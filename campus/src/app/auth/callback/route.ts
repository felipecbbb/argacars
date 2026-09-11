import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * Punto de entrada de los enlaces que Supabase manda por correo
 * (invitación a un alumno nuevo y recuperación de contraseña).
 * Cambia el código de un solo uso por una sesión y sigue a donde toque.
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const siguiente = searchParams.get('next') ?? '/campus'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) return NextResponse.redirect(`${origin}${siguiente}`)
  }

  return NextResponse.redirect(`${origin}/entrar?error=enlace`)
}
