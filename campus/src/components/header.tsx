'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useState } from 'react'

const SECCIONES = [
  ['/#formacion', 'La formación'],
  ['/#temario', 'Temario'],
  ['/#bonus', 'Bonus'],
  ['/#nosotros', 'Quiénes somos'],
] as const

export default function Header() {
  const [opaco, setOpaco] = useState(false)
  const [menu, setMenu] = useState(false)

  useEffect(() => {
    const alScroll = () => setOpaco(window.scrollY > 24)
    alScroll()
    window.addEventListener('scroll', alScroll, { passive: true })
    return () => window.removeEventListener('scroll', alScroll)
  }, [])

  // Con el menú abierto no se puede mover el fondo
  useEffect(() => {
    document.body.style.overflow = menu ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [menu])

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-colors duration-300 ${
        opaco ? 'border-b border-white/10 bg-ink/90 backdrop-blur-md' : 'border-b border-transparent'
      }`}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-5 py-4">
        <Link href="/" aria-label="ARGA Premium Cars · inicio">
          <Image src="/marca/logo-arga.png" alt="ARGA Premium Cars" width={124} height={31} priority />
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {SECCIONES.map(([href, texto]) => (
            <Link key={href} href={href} className="rounded-full px-3.5 py-2 text-[13.5px] font-semibold text-white/65 transition hover:bg-white/6 hover:text-white">
              {texto}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2.5">
          <Link
            href="/entrar"
            className="whitespace-nowrap rounded-full border border-white/24 px-4 py-2.5 text-[12px] font-bold uppercase tracking-[.06em] transition hover:border-white/45 hover:bg-white/6 sm:px-5"
          >
            Acceso alumnos
          </Link>
          <Link
            href="/#acceso"
            className="hidden whitespace-nowrap rounded-full bg-gradient-to-b from-gold-soft to-gold px-5 py-2.5 text-[12px] font-extrabold uppercase tracking-[.05em] text-ink transition hover:-translate-y-0.5 sm:inline-flex"
          >
            Acceder a la formación
          </Link>
          <button
            onClick={() => setMenu(true)}
            aria-label="Abrir el menú"
            className="grid h-10 w-10 place-items-center rounded-full border border-white/18 lg:hidden"
          >
            <span aria-hidden className="text-lg leading-none">☰</span>
          </button>
        </div>
      </div>

      {/* Menú en móvil */}
      {menu && (
        <div className="fixed inset-0 z-50 bg-ink/97 backdrop-blur-md lg:hidden">
          <div className="flex items-center justify-between px-5 py-4">
            <Image src="/marca/logo-arga.png" alt="" width={124} height={31} />
            <button
              onClick={() => setMenu(false)}
              aria-label="Cerrar el menú"
              className="grid h-10 w-10 place-items-center rounded-full border border-white/18 text-lg"
            >
              ✕
            </button>
          </div>
          <nav className="flex flex-col gap-1 px-5 pt-6">
            {SECCIONES.map(([href, texto]) => (
              <Link key={href} href={href} onClick={() => setMenu(false)}
                 className="border-b border-white/8 py-4 text-[19px] font-bold tracking-[-.02em]">
                {texto}
              </Link>
            ))}
            <Link href="/entrar" onClick={() => setMenu(false)}
                  className="border-b border-white/8 py-4 text-[19px] font-bold tracking-[-.02em] text-gold">
              Acceso alumnos
            </Link>
            <Link href="/#acceso" onClick={() => setMenu(false)}
               className="mt-7 rounded-full bg-gradient-to-b from-gold-soft to-gold px-6 py-4 text-center text-[14px] font-extrabold uppercase tracking-wide text-ink">
              Acceder a la formación
            </Link>
          </nav>
        </div>
      )}
    </header>
  )
}
