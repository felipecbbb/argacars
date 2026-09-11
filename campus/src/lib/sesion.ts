import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

/** Devuelve el usuario, su perfil y si tiene el acceso al curso activo. */
export async function obtenerSesion() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/entrar')

  const [{ data: perfil }, { data: matricula }] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', user.id).single(),
    supabase.from('enrollments').select('status').eq('user_id', user.id).maybeSingle(),
  ])

  const esAdmin = perfil?.role === 'admin'
  return {
    supabase,
    user,
    perfil,
    esAdmin,
    tieneAcceso: esAdmin || matricula?.status === 'active',
  }
}

/** Igual que la anterior, pero corta el paso a quien no tenga acceso. */
export async function exigirAcceso() {
  const sesion = await obtenerSesion()
  if (!sesion.tieneAcceso) redirect('/sin-acceso')
  return sesion
}

export async function exigirAdmin() {
  const sesion = await obtenerSesion()
  if (!sesion.esAdmin) redirect('/')
  return sesion
}
