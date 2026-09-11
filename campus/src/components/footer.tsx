import Image from 'next/image'
import Link from 'next/link'

const WEB = 'https://argapremiumcars.es'

export default function Footer() {
  return (
    <footer className="border-t border-white/8 bg-ink">
      <div className="mx-auto max-w-6xl px-5 py-14">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div className="lg:col-span-2">
            <Image src="/marca/logo-arga.png" alt="ARGA Premium Cars" width={132} height={33} />
            <p className="mt-5 max-w-[38ch] text-[14px] leading-relaxed text-white/50">
              Importación de vehículos del mercado europeo. Formación y servicio, con un método
              perfeccionado tras cientos de operaciones.
            </p>
            <div className="mt-6 flex gap-2.5">
              <a href="https://instagram.com/argapremiumcars" target="_blank" rel="noopener"
                 className="rounded-full border border-white/16 px-4 py-2 text-[12.5px] font-semibold transition hover:border-gold/50">
                Instagram
              </a>
              <a href="mailto:info@argapremiumcars.com"
                 className="rounded-full border border-white/16 px-4 py-2 text-[12.5px] font-semibold transition hover:border-gold/50">
                Escríbenos
              </a>
            </div>
          </div>

          <div>
            <p className="text-[11px] font-bold uppercase tracking-[.16em] text-gold">Formación</p>
            <ul className="mt-4 space-y-2.5 text-[14px] text-white/55">
              <li><a href="#temario" className="hover:text-white">Temario</a></li>
              <li><a href="#bonus" className="hover:text-white">Bonus incluidos</a></li>
              <li><a href="#nosotros" className="hover:text-white">Quiénes somos</a></li>
              <li><Link href="/entrar" className="hover:text-white">Acceso alumnos</Link></li>
            </ul>
          </div>

          <div>
            <p className="text-[11px] font-bold uppercase tracking-[.16em] text-gold">ARGA</p>
            <ul className="mt-4 space-y-2.5 text-[14px] text-white/55">
              <li><a href={WEB} className="hover:text-white">Web principal ↗</a></li>
              <li><a href={`${WEB}/coches.html`} className="hover:text-white">Coches ↗</a></li>
              <li><a href={`${WEB}/contacto.html`} className="hover:text-white">Contacto ↗</a></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-4 border-t border-white/8 pt-7 text-[12.5px] text-white/38 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} ARGA Premium Cars® · Alejandro García Alba · NIF 71740603-S</p>
          <nav className="flex flex-wrap gap-x-5 gap-y-2">
            <a href={`${WEB}/aviso-legal.html`} className="hover:text-white">Aviso legal</a>
            <a href={`${WEB}/privacidad.html`} className="hover:text-white">Privacidad</a>
            <a href={`${WEB}/cookies.html`} className="hover:text-white">Cookies</a>
          </nav>
        </div>
      </div>
    </footer>
  )
}
