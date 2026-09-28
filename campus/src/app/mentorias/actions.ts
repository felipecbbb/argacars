'use server'

import { obtenerSesion } from '@/lib/sesion'
import { createAdminClient } from '@/lib/supabase/server'
import { cancelarCita, reservarCita, type ResultadoCita } from '@/lib/reservar-cita'
import { MENTORIAS_INCLUIDAS, mentoriasUsadas } from '@/lib/mentorias'

export async function reservarMentoria(_prev: ResultadoCita, fd: FormData): Promise<ResultadoCita> {
  const { user, perfil, tieneAcceso } = await obtenerSesion()
  if (!user || !tieneAcceso) return { error: 'Vuelve a entrar al campus.' }
  if ((await mentoriasUsadas(user.id)) >= MENTORIAS_INCLUIDAS) {
    return { error: 'Ya has usado tus tres mentorías.' }
  }

  const { data: ficha } = await createAdminClient().from('profiles').select('phone').eq('id', user.id).maybeSingle()
  return reservarCita({
    tipo: 'mentoria',
    empieza: String(fd.get('empieza') ?? ''),
    zona: String(fd.get('zona') ?? ''),
    nombre: perfil?.full_name?.trim() || user.email!,
    email: user.email!,
    telefono: ficha?.phone ?? null,
    mensaje: String(fd.get('mensaje') ?? '').trim().slice(0, 600),
    userId: user.id,
  })
}

/** El alumno cancela una mentoría suya: vuelve a su saldo. */
export async function anularMentoria(fd: FormData): Promise<void> {
  const { user } = await obtenerSesion()
  const id = String(fd.get('id') ?? '')
  if (!user || !id) return
  const { data } = await createAdminClient().from('citas').select('id').eq('id', id).eq('user_id', user.id).maybeSingle()
  if (data) await cancelarCita({ id }, 'cliente')
}
