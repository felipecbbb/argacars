'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export type EstadoAcceso = { error?: string }

/** Rutas del alumno: si un administrador pidió una de estas, se respeta. */
const RUTAS_ALUMNO = ['/clase', '/recursos', '/mentorias', '/dudas']

export async function entrar(_prev: EstadoAcceso, formData: FormData): Promise<EstadoAcceso> {
  const email = String(formData.get('email') ?? '').trim()
  const password = String(formData.get('password') ?? '')
  const pedido = String(formData.get('destino') ?? '')

  if (!email || !password) return { error: 'Escribe tu correo y tu contraseña.' }

  const supabase = await createClient()
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })

  if (error || !data.user) {
    // No se distingue «no existe» de «contraseña mal»: daría pistas a quien pruebe correos.
    return { error: 'Correo o contraseña incorrectos.' }
  }

  // Se comprueba el rol siempre, no solo en algunos casos: quien administra
  // aterriza en su panel y no en el campus del alumno.
  const { data: perfil } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', data.user.id)
    .maybeSingle<{ role: string }>()

  const esAdmin = perfil?.role === 'admin'
  const destino = pedido.startsWith('/') ? pedido : ''

  let inicio: string
  if (esAdmin) {
    // Solo se respeta el destino si de verdad iba a una pantalla concreta:
    // el panel, o una del alumno que pidió a propósito.
    const concreto =
      destino.startsWith('/admin') || RUTAS_ALUMNO.some((r) => destino.startsWith(r))
    inicio = concreto ? destino : '/admin'
  } else {
    inicio = destino && !destino.startsWith('/admin') ? destino : '/campus'
  }

  revalidatePath('/', 'layout')
  redirect(inicio)
}
