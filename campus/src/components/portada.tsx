import Image from 'next/image'
import Link from 'next/link'

/** Lo que ve quien llega al campus sin haber entrado todavía. */
export default function Portada() {
  return (
    <main className="relative min-h-dvh overflow-hidden">
      {/* Fondo de marca */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <Image
          src="/marca/fondo.jpg" alt="" fill priority
          className="object-cover object-[center_38%] opacity-25 grayscale-[.2]"
        />
        <div className="absolute inset-0 bg-[radial-gradient(110%_75%_at_50%_35%,rgba(10,10,10,.4)_0%,rgba(10,10,10,.88)_58%,rgba(10,10,10,.99)_100%)]" />
        <div className="absolute -top-40 -right-24 h-[560px] w-[560px] rounded-full bg-gold/14 blur-[120px]" />
        <div className="absolute -bottom-44 -left-28 h-[460px] w-[460px] rounded-full bg-white/5 blur-[120px]" />
      </div>

      <div className="relative z-10 mx-auto flex min-h-dvh max-w-5xl flex-col px-5">
        {/* Barra superior */}
        <header className="flex items-center justify-between py-6">
          <Image src="/marca/logo-arga.png" alt="ARGA Premium Cars" width={132} height={33} priority />
          <Link
            href="/entrar"
            className="rounded-full border border-white/24 px-5 py-2.5 text-[12px] font-bold uppercase tracking-[.06em] text-white transition hover:border-white/45 hover:bg-white/6"
          >
            Acceso alumnos
          </Link>
        </header>

        {/* Centro */}
        <div className="flex flex-1 flex-col justify-center py-12">
          <p className="text-[11px] font-bold uppercase tracking-[.24em] text-gold">
            Campus de formación
          </p>
          <h1 className="mt-4 max-w-[17ch] text-[clamp(32px,7vw,62px)] font-black leading-[.98] tracking-[-.045em]">
            Tu formación de <span className="text-gold">importación</span>, de principio a fin
          </h1>
          <p className="mt-6 max-w-[58ch] text-[clamp(15px,2.2vw,18px)] leading-relaxed text-white/65">
            Ocho módulos, veinte clases y todas las guías descargables. Más tus tres mentorías
            privadas con nosotros. Entra con el correo con el que compraste el curso.
          </p>

          <div className="mt-9 flex flex-wrap items-center gap-4">
            <Link
              href="/entrar"
              className="inline-flex items-center gap-3 rounded-full bg-gradient-to-b from-gold-soft to-gold px-8 py-4.5 text-[15px] font-extrabold uppercase tracking-wide text-ink shadow-[0_20px_46px_-16px_rgba(197,165,114,.75)] transition hover:-translate-y-0.5"
            >
              Entrar a mi formación
            </Link>
            <a
              href="https://comunidad.argapremiumcars.es"
              className="text-[14px] font-semibold text-white/55 underline underline-offset-4 transition hover:text-white"
            >
              Todavía no tengo acceso
            </a>
          </div>

          {/* Lo que hay dentro */}
          <ul className="mt-14 grid gap-4 sm:grid-cols-3">
            {[
              ['8 módulos', 'De buscar el coche a tenerlo matriculado en España.'],
              ['Guías y plantillas', 'Todo el material descargable, siempre disponible.'],
              ['3 mentorías 1 a 1', 'Media hora de llamada privada. Sin caducidad.'],
            ].map(([t, d]) => (
              <li key={t} className="rounded-2xl border border-white/12 bg-white/[.03] p-5 backdrop-blur-sm">
                <p className="text-[16px] font-extrabold tracking-[-.02em]">{t}</p>
                <p className="mt-1.5 text-[13.5px] leading-relaxed text-white/50">{d}</p>
              </li>
            ))}
          </ul>
        </div>

        <footer className="border-t border-white/8 py-6 text-[12px] text-white/35">
          © 2026 ARGA Premium Cars · Campus de formación
        </footer>
      </div>
    </main>
  )
}
