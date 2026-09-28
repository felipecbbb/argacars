'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createAdminClient, createClient } from '@/lib/supabase/server'
import { normalizarTelefono } from '@/lib/telefono'

export type EstadoAcceso = { error?: string }

/** Rutas del alumno: si un administrador pidió una de estas, se respeta. */
const RUTAS_ALUMNO = ['/clase', '/recursos', '/mentorias', '/dudas', '/diploma']

export async function entrar(_prev: EstadoAcceso, formData: FormData): Promise<EstadoAcceso> {
  const usuario = String(formData.get('email') ?? '').trim()
  const password = String(formData.get('password') ?? '')
  const pedido = String(formData.get('destino') ?? '')

  if (!usuario || !password) return { error: 'Escribe tu correo o teléfono y tu contraseña.' }

  // Se puede entrar con el correo o con el teléfono: si no lleva @, se busca de
  // quién es ese teléfono y se entra con su correo. Si no es de nadie, se da el
  // mismo error que una contraseña mal, para no revelar qué teléfonos hay.
  let email = usuario
  if (!usuario.includes('@')) {
    const telefono = normalizarTelefono(usuario)
    if (!telefono) return { error: 'Correo, teléfono o contraseña incorrectos.' }
    const { data } = await createAdminClient()
      .from('profiles').select('email').eq('phone', telefono).maybeSingle<{ email: string }>()
    if (!data?.email) return { error: 'Correo, teléfono o contraseña incorrectos.' }
    email = data.email
  }

  const supabase = await createClient()
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })

  if (error || !data.user) {
    // No se distingue «no existe» de «contraseña mal»: daría pistas a quien pruebe correos.
    return { error: 'Correo, teléfono o contraseña incorrectos.' }
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
