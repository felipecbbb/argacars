'use server'

import { revalidatePath } from 'next/cache'
import { createAdminClient } from '@/lib/supabase/server'
import { exigirAdmin } from '@/lib/sesion'

const MINUTOS = 30

/** Crea tramos de media hora entre dos horas de un día, en hora peninsular. */
export async function abrirHuecos(formData: FormData): Promise<string> {
  await exigirAdmin()

  const dia = String(formData.get('dia') ?? '')
  const desde = String(formData.get('desde') ?? '')
  const hasta = String(formData.get('hasta') ?? '')
  if (!dia || !desde || !hasta) return 'Faltan datos.'

  // Se interpreta la hora escrita como hora de Madrid y se guarda en UTC.
  const aUtc = (hhmm: string) => {
    const local = new Date(`${dia}T${hhmm}:00`)
    const comoMadrid = new Date(local.toLocaleString('en-US', { timeZone: 'Europe/Madrid' }))
    const desfase = local.getTime() - comoMadrid.getTime()
    return new Date(local.getTime() + desfase)
  }

  const inicio = aUtc(desde)
  const fin = aUtc(hasta)
  if (!(fin > inicio)) return 'La hora de fin tiene que ser posterior.'

  const filas: { starts_at: string; ends_at: string }[] = []
  for (let t = inicio.getTime(); t + MINUTOS * 60000 <= fin.getTime(); t += MINUTOS * 60000) {
    filas.push({
      starts_at: new Date(t).toISOString(),
      ends_at: new Date(t + MINUTOS * 60000).toISOString(),
    })
  }
  if (filas.length === 0) return 'Ese margen no da ni para media hora.'

  const admin = createAdminClient()
  const { error } = await admin.from('availability_slots').insert(filas)

  revalidatePath('/admin/mentorias')
  revalidatePath('/mentorias')
  return error ? `No se pudieron crear: ${error.message}` : `${filas.length} huecos creados.`
}

export async function cerrarHueco(formData: FormData) {
  await exigirAdmin()
  const admin = createAdminClient()
  await admin.from('availability_slots').delete().eq('id', String(formData.get('slot_id') ?? ''))
  revalidatePath('/admin/mentorias')
  revalidatePath('/mentorias')
}

export async function marcarHecha(formData: FormData) {
  await exigirAdmin()
  const admin = createAdminClient()
  await admin.from('bookings').update({ status: 'done' }).eq('id', String(formData.get('booking_id') ?? ''))
  revalidatePath('/admin/mentorias')
}
