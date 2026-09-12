'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { obtenerSesion } from '@/lib/sesion'

export type EstadoPerfil = { error?: string; ok?: string }

export async function guardarDatos(_prev: EstadoPerfil, formData: FormData): Promise<EstadoPerfil> {
  const { user } = await obtenerSesion()
  if (!user) return { error: 'Vuelve a entrar.' }

  const nombre = String(formData.get('full_name') ?? '').trim()
  if (nombre.length < 2) return { error: 'Escribe tu nombre.' }

  const supabase = await createClient()
  const { error } = await supabase.from('profiles').update({ full_name: nombre }).eq('id', user.id)
  if (error) return { error: 'No se ha podido guardar.' }

  revalidatePath('/perfil')
  revalidatePath('/campus')
  return { ok: 'Datos guardados.' }
}

export async function cambiarClave(_prev: EstadoPerfil, formData: FormData): Promise<EstadoPerfil> {
  const { user } = await obtenerSesion()
  if (!user) return { error: 'Vuelve a entrar.' }

  const actual = String(formData.get('actual') ?? '')
  const nueva = String(formData.get('nueva') ?? '')
  const repetir = String(formData.get('repetir') ?? '')

  if (nueva.length < 8) return { error: 'La nueva contraseña necesita ocho caracteres como mínimo.' }
  if (nueva !== repetir) return { error: 'Las dos contraseñas nuevas no coinciden.' }

  const supabase = await createClient()

  // Se comprueba la actual antes de cambiarla: si alguien deja la sesión abierta,
  // no debería poder cambiar la contraseña sin saberla.
  const { error: errActual } = await supabase.auth.signInWithPassword({
    email: user.email!,
    password: actual,
  })
  if (errActual) return { error: 'La contraseña actual no es correcta.' }

  const { error } = await supabase.auth.updateUser({ password: nueva })
  if (error) return { error: 'No se ha podido cambiar. Prueba con otra contraseña.' }

  return { ok: 'Contraseña actualizada.' }
}
