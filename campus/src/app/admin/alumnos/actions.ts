'use server'

import { revalidatePath } from 'next/cache'
import { createAdminClient } from '@/lib/supabase/server'
import { exigirAdmin } from '@/lib/sesion'
import { enviarAlta } from '@/lib/correo'

function destinoCallback() {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? ''
  return `${base}/auth/callback?next=/nueva-clave`
}

export async function altaAlumno(formData: FormData): Promise<{ ok: boolean; mensaje: string }> {
  await exigirAdmin()

  const email = String(formData.get('email') ?? '').trim().toLowerCase()
  const nombre = String(formData.get('full_name') ?? '').trim()
  if (!email) return { ok: false, mensaje: 'Falta el correo.' }

  const admin = createAdminClient()

  // Se genera el enlace sin que Supabase mande nada: el correo lo enviamos
  // nosotros con Resend, con la imagen de ARGA y sin su límite de envíos.
  const { data, error } = await admin.auth.admin.generateLink({
    type: 'invite',
    email,
    options: { data: { full_name: nombre }, redirectTo: destinoCallback() },
  })

  if (error || !data?.user) {
    const yaExiste = error?.message?.toLowerCase().includes('already')
    return {
      ok: false,
      mensaje: yaExiste
        ? 'Ese correo ya tiene cuenta. Dale acceso desde la lista.'
        : error?.message ?? 'No se ha podido crear la cuenta.',
    }
  }

  await admin.from('enrollments').upsert(
    { user_id: data.user.id, status: 'active', source: 'manual' },
    { onConflict: 'user_id' }
  )

  const envio = await enviarAlta(email, data.properties.action_link, nombre)
  revalidatePath('/admin/alumnos')
  revalidatePath('/admin')

  return envio.error
    ? { ok: true, mensaje: `Alumno creado con acceso, pero el correo no salió: ${envio.error}` }
    : { ok: true, mensaje: 'Alumno creado y correo enviado.' }
}

export async function alternarAcceso(userId: string, activar: boolean) {
  await exigirAdmin()
  const admin = createAdminClient()

  await admin.from('enrollments').upsert(
    { user_id: userId, status: activar ? 'active' : 'revoked', source: 'manual' },
    { onConflict: 'user_id' }
  )

  revalidatePath('/admin/alumnos')
  revalidatePath('/admin')
}

/** Reenvía el correo de acceso a quien no lo encuentre o se le haya caducado. */
export async function reenviarAcceso(formData: FormData): Promise<void> {
  await exigirAdmin()
  const email = String(formData.get('email') ?? '').trim().toLowerCase()
  if (!email) return

  const admin = createAdminClient()
  const { data, error } = await admin.auth.admin.generateLink({
    type: 'recovery',
    email,
    options: { redirectTo: destinoCallback() },
  })
  if (error || !data?.properties) return

  await enviarAlta(email, data.properties.action_link)
  revalidatePath('/admin/alumnos')
}
