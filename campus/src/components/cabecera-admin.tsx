'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const PESTANAS = [
  ['/admin', 'Resumen'],
  ['/admin/alumnos', 'Alumnos'],
  ['/admin/contenido', 'Clases y vídeos'],
  ['/admin/recursos', 'Recursos'],
  ['/admin/mentorias', 'Mentorías'],
] as const

export default function CabeceraAdmin() {
  const ruta = usePathname()

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-ink-2/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-3">
        <div className="flex items-center gap-3.5">
          <Image src="/marca/logo-arga.png" alt="ARGA Premium Cars" width={104} height={26} />
          <span className="rounded-full bg-gold px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-[.14em] text-ink">
            Administración
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/campus?vista=alumno"
            className="hidden rounded-full border border-white/20 px-4 py-2 text-[12.5px] font-semibold text-white/75 transition hover:border-gold/50 hover:text-white sm:inline-flex"
          >
            Ver como alumno
          </Link>
          <form action="/auth/salir" method="post">
            <button type="submit" className="rounded-full px-3.5 py-2 text-[12.5px] font-semibold text-white/45 transition hover:text-white">
              Salir
            </button>
          </form>
        </div>
      </div>

      {/* Pestañas de gestión */}
      <nav className="mx-auto flex max-w-6xl gap-1 overflow-x-auto px-5 pb-2.5">
        {PESTANAS.map(([href, texto]) => {
          const activa = ruta === href
          return (
            <Link
              key={href}
              href={href}
              aria-current={activa ? 'page' : undefined}
              className={`whitespace-nowrap rounded-full px-4 py-2 text-[13px] font-semibold transition ${
                activa
                  ? 'bg-gold text-ink'
                  : 'text-white/60 hover:bg-white/6 hover:text-white'
              }`}
            >
              {texto}
            </Link>
          )
        })}
      </nav>
    </header>
  )
}
