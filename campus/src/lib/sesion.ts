import { cache } from 'react'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

type Perfil = {
  id: string
  email: string
  full_name: string | null
  role: 'student' | 'admin'
  enrollments: { status: string }[] | null
}

/**
 * Sesión del visitante. Va envuelta en cache() de React: aunque la pidan el
 * layout y la página, dentro de la misma petición solo se consulta una vez.
 * Perfil y matrícula vienen en una sola consulta, no en dos.
 */
export const obtenerSesion = cache(async () => {
  const supabase = await createClient()

  // Si no hay ni rastro de cookie de sesión, no merece la pena preguntar a
  // Supabase: es visita anónima y se ahorra una ida y vuelta de red.
  const galletas = await cookies()
  const haySesion = galletas.getAll().some((c) => c.name.startsWith('sb-') && c.name.includes('auth-token'))
  if (!haySesion) {
    return { supabase, user: null, perfil: null, esAdmin: false, tieneAcceso: false }
  }

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { supabase, user: null, perfil: null, esAdmin: false, tieneAcceso: false }
  }

  const { data } = await supabase
    .from('profiles')
    .select('id, email, full_name, role, enrollments(status)')
    .eq('id', user.id)
    .maybeSingle<Perfil>()

  const esAdmin = data?.role === 'admin'
  const matriculado = (data?.enrollments ?? []).some((e) => e.status === 'active')

  return { supabase, user, perfil: data, esAdmin, tieneAcceso: esAdmin || matriculado }
})

/** Corta el paso a quien no haya entrado o no tenga la formación activa. */
export async function exigirAcceso() {
  const sesion = await obtenerSesion()
  if (!sesion.user) redirect('/entrar')
  if (!sesion.tieneAcceso) redirect('/sin-acceso')
  return { ...sesion, user: sesion.user }
}

export async function exigirAdmin() {
  const sesion = await obtenerSesion()
  if (!sesion.user) redirect('/entrar')
  if (!sesion.esAdmin) redirect('/')
  return { ...sesion, user: sesion.user }
}
