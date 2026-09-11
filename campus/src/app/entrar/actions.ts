'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export type EstadoAcceso = { error?: string }

export async function entrar(_prev: EstadoAcceso, formData: FormData): Promise<EstadoAcceso> {
  const email = String(formData.get('email') ?? '').trim()
  const password = String(formData.get('password') ?? '')
  const destino = String(formData.get('destino') ?? '/')

  if (!email || !password) return { error: 'Escribe tu correo y tu contraseña.' }

  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    // No se distingue «no existe» de «contraseña mal»: daría pistas a quien pruebe correos.
    return { error: 'Correo o contraseña incorrectos.' }
  }

  revalidatePath('/', 'layout')
  redirect(destino.startsWith('/') ? destino : '/')
}
