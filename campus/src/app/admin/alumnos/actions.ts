'use server'

import { revalidatePath } from 'next/cache'
import { createAdminClient } from '@/lib/supabase/server'
import { exigirAdmin } from '@/lib/sesion'

export async function altaAlumno(formData: FormData): Promise<{ ok: boolean; mensaje: string }> {
  await exigirAdmin()

  const email = String(formData.get('email') ?? '').trim().toLowerCase()
  const nombre = String(formData.get('full_name') ?? '').trim()
  if (!email) return { ok: false, mensaje: 'Falta el correo.' }

  const admin = createAdminClient()
  const { data, error } = await admin.auth.admin.inviteUserByEmail(email, {
    data: { full_name: nombre },
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL ?? ''}/auth/callback?next=/nueva-clave`,
  })

  if (error || !data?.user) {
    return { ok: false, mensaje: error?.message ?? 'No se ha podido crear la cuenta.' }
  }

  await admin.from('enrollments').upsert(
    { user_id: data.user.id, status: 'active', source: 'manual' },
    { onConflict: 'user_id' }
  )

  revalidatePath('/admin/alumnos')
  return { ok: true, mensaje: 'Invitación enviada.' }
}

export async function alternarAcceso(userId: string, activar: boolean) {
  await exigirAdmin()
  const admin = createAdminClient()

  await admin.from('enrollments').upsert(
    { user_id: userId, status: activar ? 'active' : 'revoked', source: 'manual' },
    { onConflict: 'user_id' }
  )

  revalidatePath('/admin/alumnos')
}
