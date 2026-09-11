'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export type EstadoReserva = { error?: string; ok?: string }

export async function reservar(_prev: EstadoReserva, formData: FormData): Promise<EstadoReserva> {
  const slotId = String(formData.get('slot_id') ?? '')
  const tema = String(formData.get('topic') ?? '').trim()
  if (!slotId) return { error: 'No se ha indicado el hueco.' }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Vuelve a entrar.' }

  // La reserva la frenan igualmente las políticas: hueco libre (slot_id es único),
  // acceso activo y mentorías disponibles.
  const { error } = await supabase
    .from('bookings')
    .insert({ slot_id: slotId, user_id: user.id, topic: tema || null })

  if (error) {
    if (error.code === '23505') return { error: 'Ese hueco lo acaban de coger. Elige otro.' }
    return { error: 'No se ha podido reservar. ¿Te quedan mentorías disponibles?' }
  }

  revalidatePath('/mentorias')
  return { ok: 'Hueco reservado. Te escribiremos para confirmarlo.' }
}

export async function anular(formData: FormData): Promise<void> {
  const id = String(formData.get('booking_id') ?? '')
  if (!id) return

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  await supabase.from('bookings').update({ status: 'cancelled' }).eq('id', id).eq('user_id', user.id)
  revalidatePath('/mentorias')
}
