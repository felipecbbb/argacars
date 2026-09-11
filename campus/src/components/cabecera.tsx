import Image from 'next/image'
import Link from 'next/link'

export default function Cabecera({ esAdmin = false }: { esAdmin?: boolean }) {
  return (
    <header className="sticky top-0 z-30 border-b border-white/8 bg-ink/85 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-3.5">
        <Link href="/" className="flex items-center gap-3">
          <Image src="/marca/logo-arga.png" alt="ARGA Premium Cars" width={112} height={28} />
          <span className="hidden text-[11px] font-bold uppercase tracking-[.18em] text-gold sm:inline">
            Campus
          </span>
        </Link>

        <nav className="flex items-center gap-1 text-[13px] font-semibold">
          <Link href="/" className="rounded-full px-3 py-2 text-white/70 hover:bg-white/6 hover:text-white">
            Módulos
          </Link>
          <Link href="/recursos" className="rounded-full px-3 py-2 text-white/70 hover:bg-white/6 hover:text-white">
            Recursos
          </Link>
          <Link href="/mentorias" className="rounded-full px-3 py-2 text-white/70 hover:bg-white/6 hover:text-white">
            Mentorías
          </Link>
          <Link href="/dudas" className="hidden rounded-full px-3 py-2 text-white/70 hover:bg-white/6 hover:text-white sm:block">
            Dudas
          </Link>
          {esAdmin && (
            <Link href="/admin" className="rounded-full border border-gold/40 px-3 py-2 text-gold hover:bg-gold/10">
              Panel
            </Link>
          )}
          <form action="/auth/salir" method="post">
            <button className="rounded-full px-3 py-2 text-white/45 hover:text-white" type="submit">
              Salir
            </button>
          </form>
        </nav>
      </div>
    </header>
  )
}
