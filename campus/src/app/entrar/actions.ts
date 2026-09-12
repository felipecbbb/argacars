'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export type EstadoAcceso = { error?: string }

export async function entrar(_prev: EstadoAcceso, formData: FormData): Promise<EstadoAcceso> {
  const email = String(formData.get('email') ?? '').trim()
  const password = String(formData.get('password') ?? '')
  const destino = String(formData.get('destino') ?? '/campus')

  if (!email || !password) return { error: 'Escribe tu correo y tu contraseña.' }

  const supabase = await createClient()
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    // No se distingue «no existe» de «contraseña mal»: daría pistas a quien pruebe correos.
    return { error: 'Correo o contraseña incorrectos.' }
  }

  // Quien administra entra a gestionar, no a hacer el curso.
  let inicio = destino.startsWith('/') ? destino : '/campus'
  if (inicio === '/campus' && data.user) {
    const { data: perfil } = await supabase
      .from('profiles').select('role').eq('id', data.user.id).maybeSingle()
    if (perfil?.role === 'admin') inicio = '/admin'
  }

  revalidatePath('/', 'layout')
  redirect(inicio)
}
