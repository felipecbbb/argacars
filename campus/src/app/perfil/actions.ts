'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { obtenerSesion } from '@/lib/sesion'
import { normalizarTelefono } from '@/lib/telefono'
import { enviarAvisoClave } from '@/lib/correo'

export type EstadoPerfil = { error?: string; ok?: string }

export async function guardarDatos(_prev: EstadoPerfil, formData: FormData): Promise<EstadoPerfil> {
  const { user } = await obtenerSesion()
  if (!user) return { error: 'Vuelve a entrar.' }

  const nombre = String(formData.get('full_name') ?? '').trim()
  const telefono = String(formData.get('phone') ?? '').trim()
  const direccion = String(formData.get('address') ?? '').trim()
  if (nombre.length < 2) return { error: 'Escribe tu nombre.' }
  const telNormal = telefono ? normalizarTelefono(telefono) : null
  if (telefono && !telNormal) return { error: 'Revisa el teléfono: por ejemplo 600 000 000 o +34 600 000 000.' }
  if (direccion.length > 300) return { error: 'La dirección es demasiado larga.' }

  const supabase = await createClient()
  const { error } = await supabase
    .from('profiles')
    .update({ full_name: nombre, phone: telNormal, address: direccion || null })
    .eq('id', user.id)
  // El teléfono sirve para entrar, así que no puede repetirse entre cuentas
  if (error?.code === '23505') return { error: 'Ese teléfono ya está en otra cuenta. Escríbenos si es tuyo.' }
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

  const { data: perfil } = await supabase.from('profiles').select('full_name').eq('id', user.id).maybeSingle()
  await enviarAvisoClave(user.email!, perfil?.full_name)
  return { ok: 'Contraseña actualizada. Te hemos mandado un aviso al correo.' }
}
