import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

/** Rutas que se pueden ver sin haber entrado. */
const PUBLICAS = ['/entrar', '/recuperar', '/nueva-clave', '/auth']

/** La portada es pública: enseña la plataforma y desde ahí se entra. */
const PORTADA = '/'

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

  // Solo se usa para decidir a dónde mandar al visitante, así que se lee de la
  // cookie y se evita una llamada de red en cada navegación. La autorización real
  // la hacen las páginas con getUser() y, por debajo, las reglas de la base.
  const { data: { session } } = await supabase.auth.getSession()
  const user = session?.user ?? null

  const ruta = request.nextUrl.pathname
  const esPublica = ruta === PORTADA || PUBLICAS.some((p) => ruta.startsWith(p))

  if (!user && !esPublica) {
    const url = request.nextUrl.clone()
    url.pathname = '/entrar'
    url.searchParams.set('destino', ruta)
    return NextResponse.redirect(url)
  }

  // Quien ya ha entrado no necesita ver la portada ni el formulario
  if (user && (ruta === '/entrar' || ruta === PORTADA)) {
    const url = request.nextUrl.clone()
    url.pathname = '/campus'
    url.search = ''
    return NextResponse.redirect(url)
  }

  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)'],
}
