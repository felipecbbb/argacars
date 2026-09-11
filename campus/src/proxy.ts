import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

/** Rutas que se pueden ver sin haber entrado. */
const PUBLICAS = ['/entrar', '/recuperar', '/nueva-clave', '/auth']

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          response = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Importante: getUser() revalida el token contra Supabase en cada petición.
  const { data: { user } } = await supabase.auth.getUser()

  const ruta = request.nextUrl.pathname
  const esPublica = PUBLICAS.some((p) => ruta.startsWith(p))

  if (!user && !esPublica) {
    const url = request.nextUrl.clone()
    url.pathname = '/entrar'
    url.searchParams.set('destino', ruta)
    return NextResponse.redirect(url)
  }

  if (user && ruta === '/entrar') {
    const url = request.nextUrl.clone()
    url.pathname = '/'
    url.search = ''
    return NextResponse.redirect(url)
  }

  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)'],
}
