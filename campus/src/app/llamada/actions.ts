'use server'

import { createAdminClient } from '@/lib/supabase/server'
import { reservarCita, type ResultadoCita } from '@/lib/reservar-cita'
import { normalizarTelefono } from '@/lib/telefono'

/** Reserva pública de una llamada desde la landing (sin cuenta). */
export async function reservarLlamada(_prev: ResultadoCita, fd: FormData): Promise<ResultadoCita> {
  // Campo trampa: las personas no lo ven; los robots lo rellenan
  if (String(fd.get('web') ?? '')) return { ok: 'Reservada' }

  const nombre = String(fd.get('nombre') ?? '').trim()
  const email = String(fd.get('email') ?? '').trim().toLowerCase()
  const telefono = normalizarTelefono(String(fd.get('telefono') ?? ''))
  const mensaje = String(fd.get('mensaje') ?? '').trim().slice(0, 600)

  if (nombre.length < 2) return { error: 'Escribe tu nombre.' }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { error: 'Revisa el correo.' }
  if (!telefono) return { error: 'Revisa el teléfono: por ejemplo 600 000 000 o +34 600 000 000.' }

  // Una sola llamada pendiente por persona: si quiere otra hora, que cambie la que tiene
  const { data: pendiente } = await createAdminClient()
    .from('citas').select('token').eq('tipo', 'llamada').eq('email', email).eq('estado', 'reservada')
    .gte('empieza', new Date().toISOString()).maybeSingle()
  if (pendiente) return { error: 'Ya tienes una llamada reservada. Si quieres otra hora, cámbiala desde el enlace del correo de confirmación.' }

  return reservarCita({
    tipo: 'llamada',
    empieza: String(fd.get('empieza') ?? ''),
    zona: String(fd.get('zona') ?? ''),
    nombre, email, telefono, mensaje,
  })
}
