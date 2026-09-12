'use server'

import { createAdminClient } from '@/lib/supabase/server'
import { enviarRecuperacion } from '@/lib/correo'

export type EstadoRecuperar = { error?: string; enviado?: boolean }

export async function pedirEnlace(_prev: EstadoRecuperar, formData: FormData): Promise<EstadoRecuperar> {
  const email = String(formData.get('email') ?? '').trim().toLowerCase()
  if (!email) return { error: 'Escribe tu correo.' }

  const base = process.env.NEXT_PUBLIC_SITE_URL ?? ''
  const admin = createAdminClient()

  // Se genera el enlace y lo enviamos nosotros, con la plantilla de ARGA.
  const { data, error } = await admin.auth.admin.generateLink({
    type: 'recovery',
    email,
    options: { redirectTo: `${base}/auth/callback?next=/nueva-clave` },
  })

  if (!error && data?.properties?.action_link) {
    await enviarRecuperacion(email, data.properties.action_link)
  }

  // Se responde igual exista o no la cuenta: así no se puede averiguar quién está dado de alta.
  return { enviado: true }
}
