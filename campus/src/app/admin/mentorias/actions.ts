'use server'

import { revalidatePath } from 'next/cache'
import { createAdminClient } from '@/lib/supabase/server'
import { exigirAdmin } from '@/lib/sesion'
import { cancelarCita } from '@/lib/reservar-cita'
import type { Franja, Tipo } from '@/lib/agenda'

export type EstadoAdmin = { ok?: string; error?: string }

const tipoDe = (v: FormDataEntryValue | null): Tipo => (v === 'mentoria' ? 'mentoria' : 'llamada')
const HHMM = /^([01]\d|2[0-3]):[0-5]\d$/
// Algunos navegadores devuelven «10:00:00» en los campos de hora: nos quedamos con «10:00»
const aHHMM = (v: unknown) => String(v ?? '').trim().slice(0, 5)
const entero = (v: FormDataEntryValue | null, min: number, max: number) => {
  const n = Number(v)
  return Number.isInteger(n) && n >= min && n <= max ? n : null
}

function refrescar() {
  revalidatePath('/admin/mentorias')
  revalidatePath('/mentorias')
  revalidatePath('/')
}

/** Duración, margen, antelación, días vista, máximo al día y si la agenda está abierta. */
export async function guardarAjustes(_prev: EstadoAdmin, fd: FormData): Promise<EstadoAdmin> {
  await exigirAdmin()
  const duracion = entero(fd.get('duracion_min'), 10, 180)
  const margen = entero(fd.get('margen_min'), 0, 120)
  const antelacion = entero(fd.get('antelacion_horas'), 0, 720)
  const dias = entero(fd.get('dias_vista'), 1, 180)
  const maxTexto = String(fd.get('max_dia') ?? '').trim()
  const maxDia = maxTexto === '' ? null : entero(maxTexto, 1, 50)
  if (duracion === null || margen === null || antelacion === null || dias === null || (maxTexto !== '' && maxDia === null)) {
    return { error: 'Revisa los números.' }
  }

  const { error } = await createAdminClient().from('agenda_ajustes').upsert({
    tipo: tipoDe(fd.get('tipo')),
    duracion_min: duracion, margen_min: margen, antelacion_horas: antelacion, dias_vista: dias,
    max_dia: maxDia, activa: fd.get('activa') === 'on', updated_at: new Date().toISOString(),
  })
  if (error) return { error: `No se pudo guardar: ${error.message}` }
  refrescar()
  return { ok: 'Reglas guardadas.' }
}

/** Sustituye el horario semanal completo de una agenda. */
export async function guardarHorario(tipo: Tipo, recibidas: Franja[]): Promise<EstadoAdmin> {
  await exigirAdmin()
  tipo = tipo === 'mentoria' ? 'mentoria' : 'llamada'
  const franjas = recibidas.map((f) => ({ dia_semana: Number(f.dia_semana), desde: aHHMM(f.desde), hasta: aHHMM(f.hasta) }))
  for (const f of franjas) {
    if (f.dia_semana < 1 || f.dia_semana > 7 || !HHMM.test(f.desde) || !HHMM.test(f.hasta)) return { error: 'Hay una hora mal escrita.' }
    if (f.hasta <= f.desde) return { error: 'En cada franja, la hora de fin tiene que ser posterior a la de inicio.' }
  }
  // Sin franjas solapadas dentro del mismo día
  for (let d = 1; d <= 7; d++) {
    const delDia = franjas.filter((f) => f.dia_semana === d).sort((a, b) => a.desde.localeCompare(b.desde))
    for (let i = 1; i < delDia.length; i++) if (delDia[i].desde < delDia[i - 1].hasta) return { error: 'Hay dos franjas que se pisan el mismo día.' }
  }

  // Primero se guarda el horario nuevo y solo después se borra el viejo: si algo
  // falla a medias, la agenda se queda con el horario anterior y no vacía.
  const admin = createAdminClient()
  const { data: viejas, error: e0 } = await admin.from('agenda_horario').select('id').eq('tipo', tipo)
  if (e0) return { error: `No se pudo guardar: ${e0.message}` }
  if (franjas.length) {
    const { error: e1 } = await admin.from('agenda_horario').insert(franjas.map((f) => ({ tipo, ...f })))
    if (e1) return { error: `No se pudo guardar: ${e1.message}` }
  }
  const ids = (viejas ?? []).map((v) => v.id)
  if (ids.length) {
    const { error: e2 } = await admin.from('agenda_horario').delete().in('id', ids)
    if (e2) return { error: `No se pudo terminar de guardar: ${e2.message}` }
  }
  refrescar()
  return { ok: 'Horario guardado.' }
}

/**
 * Bloquea días enteros, bloquea unas horas (el resto del día sigue con el
 * horario semanal) o pone un horario especial un día. Admite rango de fechas.
 */
export async function anadirExcepcion(_prev: EstadoAdmin, fd: FormData): Promise<EstadoAdmin> {
  await exigirAdmin()
  const desdeFecha = String(fd.get('fecha') ?? '')
  const hastaFecha = String(fd.get('fecha_fin') ?? '') || desdeFecha
  const modo = fd.get('modo') === 'especial' ? 'especial' : fd.get('modo') === 'horas' ? 'horas' : 'cerrado'
  const cerrado = modo === 'cerrado'
  const desde = aHHMM(fd.get('desde'))
  const hasta = aHHMM(fd.get('hasta'))
  const motivo = String(fd.get('motivo') ?? '').trim().slice(0, 120) || null
  const tipos: Tipo[] = fd.get('tipo') === 'ambas' ? ['llamada', 'mentoria'] : [tipoDe(fd.get('tipo'))]

  if (!/^\d{4}-\d{2}-\d{2}$/.test(desdeFecha) || !/^\d{4}-\d{2}-\d{2}$/.test(hastaFecha) || hastaFecha < desdeFecha) {
    return { error: 'Revisa las fechas.' }
  }
  if (!cerrado && (!HHMM.test(desde) || !HHMM.test(hasta) || hasta <= desde)) return { error: 'Revisa las horas: la de fin tiene que ser posterior a la de inicio.' }

  const filas: object[] = []
  for (let d = new Date(`${desdeFecha}T12:00:00Z`); d.toISOString().slice(0, 10) <= hastaFecha; d.setUTCDate(d.getUTCDate() + 1)) {
    if (filas.length > 400) return { error: 'Demasiados días de golpe.' }
    for (const tipo of tipos) {
      // «bloquea» solo se manda cuando hace falta: así lo demás funciona aunque falte la migración 0010
      filas.push({ tipo, fecha: d.toISOString().slice(0, 10), desde: cerrado ? null : desde, hasta: cerrado ? null : hasta, motivo, ...(modo === 'horas' && { bloquea: true }) })
    }
  }

  const { error } = await createAdminClient().from('agenda_excepciones').insert(filas)
  if (error && modo === 'horas' && /bloquea/.test(error.message)) {
    return { error: 'Para bloquear horas falta aplicar la migración 0010 (agenda_bloqueos) en Supabase.' }
  }
  if (error) return { error: `No se pudo guardar: ${error.message}` }
  refrescar()
  return { ok: { cerrado: 'Días bloqueados.', horas: 'Horas bloqueadas.', especial: 'Horario especial guardado.' }[modo] }
}

export async function borrarExcepcion(fd: FormData) {
  await exigirAdmin()
  await createAdminClient().from('agenda_excepciones').delete().eq('id', String(fd.get('id') ?? ''))
  refrescar()
}

/** El admin cancela una cita: el cliente recibe el aviso por correo. */
export async function cancelarCitaAdmin(fd: FormData) {
  await exigirAdmin()
  await cancelarCita({ id: String(fd.get('id') ?? '') }, 'admin')
}

export async function marcarCitaHecha(fd: FormData) {
  await exigirAdmin()
  await createAdminClient().from('citas').update({ estado: 'hecha' }).eq('id', String(fd.get('id') ?? '')).eq('estado', 'reservada')
  refrescar()
}
