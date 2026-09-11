'use server'

import { createClient } from '@/lib/supabase/server'

export type EstadoRecuperar = { error?: string; enviado?: boolean }

export async function pedirEnlace(_prev: EstadoRecuperar, formData: FormData): Promise<EstadoRecuperar> {
  const email = String(formData.get('email') ?? '').trim()
  if (!email) return { error: 'Escribe tu correo.' }

  const supabase = await createClient()
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? ''
  await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${base}/auth/callback?next=/nueva-clave`,
  })

  // Se responde igual exista o no la cuenta: así no se puede averiguar quién está dado de alta.
  return { enviado: true }
}
