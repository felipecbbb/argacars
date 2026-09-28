import { revalidatePath } from 'next/cache'
import { createAdminClient } from '@/lib/supabase/server'
import { cargarAgenda, type Tipo } from '@/lib/agenda'
import { correosCancelacion, correosReserva, type CitaCorreo } from '@/lib/correo-agenda'

export type ResultadoCita = { ok?: string; error?: string; token?: string }

function zonaValida(z: string) {
  try { new Intl.DateTimeFormat('es-ES', { timeZone: z }); return true } catch { return false }
}

function refrescar() {
  revalidatePath('/')
  revalidatePath('/mentorias')
  revalidatePath('/admin/mentorias')
}

/**
 * Reserva un hueco. Reglas:
 * 1. El hueco tiene que salir en el cálculo de huecos libres EN ESTE MOMENTO
 *    (horario, antelación mínima, días vista, máximo al día, margen, días cerrados).
 * 2. La base de datos impide dos citas vivas solapadas: si dos personas pulsan a
 *    la vez, una entra y la otra recibe «se acaba de ocupar».
 * 3. Al reservar se avisa por correo al cliente y a ARGA, con el evento de calendario.
 */
export async function reservarCita(d: {
  tipo: Tipo
  empieza: string
  nombre: string
  email: string
  telefono?: string | null
  mensaje?: string | null
  zona: string
  userId?: string | null
}): Promise<ResultadoCita> {
  const agenda = await cargarAgenda(d.tipo)
  const inicio = new Date(d.empieza)
  if (Number.isNaN(inicio.getTime())) return { error: 'La hora elegida no es válida.' }
  if (!agenda.huecos.includes(inicio.toISOString())) {
    return { error: 'Ese hueco ya no está disponible. Elige otro, por favor.' }
  }

  const fila = {
    tipo: d.tipo,
    empieza: inicio.toISOString(),
    termina: new Date(inicio.getTime() + agenda.duracionMin * 60_000).toISOString(),
    nombre: d.nombre,
    email: d.email.toLowerCase(),
    telefono: d.telefono || null,
    mensaje: d.mensaje || null,
    zona_cliente: zonaValida(d.zona) ? d.zona : agenda.zonaArga,
    user_id: d.userId ?? null,
  }

  const { data, error } = await createAdminClient().from('citas').insert(fila).select('id, token').single()
  if (error) {
    // 23P01 = choca con otra cita (restricción de exclusión)
    if (error.code === '23P01') return { error: 'Ese hueco se acaba de ocupar. Elige otro, por favor.' }
    console.error('[agenda] reservar', error)
    return { error: 'No se ha podido reservar. Inténtalo de nuevo.' }
  }

  await correosReserva({ ...fila, id: data.id, token: data.token } as CitaCorreo).catch((e) => console.error('[agenda] correo', e))
  refrescar()
  return { ok: 'Reservada', token: data.token }
}

/** Cancela una cita viva y avisa a las dos partes. */
export async function cancelarCita(
  filtro: { token?: string; id?: string }, por: 'cliente' | 'admin', silencioso = false,
): Promise<ResultadoCita> {
  const admin = createAdminClient()
  let q = admin.from('citas').select('*').eq('estado', 'reservada')
  q = filtro.token ? q.eq('token', filtro.token) : q.eq('id', filtro.id ?? '')
  const { data: cita } = await q.maybeSingle()
  if (!cita) return { error: 'Esta cita ya no está activa.' }
  if (new Date(cita.empieza).getTime() < Date.now()) return { error: 'La cita ya ha pasado.' }

  const { error } = await admin.from('citas').update({ estado: 'cancelada', cancelada_por: por }).eq('id', cita.id)
  if (error) return { error: 'No se ha podido cancelar.' }

  if (!silencioso) await correosCancelacion(cita as CitaCorreo, por).catch((e) => console.error('[agenda] correo', e))
  refrescar()
  return { ok: 'Cancelada' }
}

/**
 * Cambia una cita de hora: primero reserva la nueva (si está libre) y solo
 * entonces libera la antigua, para que nunca se quede sin ninguna. Se manda la
 * confirmación de la nueva; la cancelación de la antigua va en silencio.
 */
export async function reprogramarCita(token: string, empieza: string, zona: string): Promise<ResultadoCita> {
  const { data: vieja } = await createAdminClient().from('citas').select('*')
    .eq('token', token).eq('estado', 'reservada').maybeSingle()
  if (!vieja) return { error: 'Esta cita ya no está activa.' }

  const nueva = await reservarCita({
    tipo: vieja.tipo, empieza, zona, nombre: vieja.nombre, email: vieja.email,
    telefono: vieja.telefono, mensaje: vieja.mensaje, userId: vieja.user_id,
  })
  if (nueva.error) return nueva
  await cancelarCita({ id: vieja.id }, 'cliente', true)
  return nueva
}
