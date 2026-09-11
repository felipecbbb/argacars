import Image from 'next/image'
import Link from 'next/link'
import FormularioAcceso from './formulario'

export default async function Entrar({
  searchParams,
}: {
  searchParams: Promise<{ destino?: string }>
}) {
  const { destino } = await searchParams

  return (
    <main className="relative min-h-dvh flex items-center justify-center px-5 py-12 overflow-hidden">
      {/* Fondo de marca */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute -top-40 -right-24 h-[520px] w-[520px] rounded-full bg-gold/15 blur-[110px]" />
        <div className="absolute -bottom-40 -left-24 h-[420px] w-[420px] rounded-full bg-white/5 blur-[110px]" />
      </div>

      <div className="relative w-full max-w-[420px]">
        <div className="flex justify-center">
          <Image src="/marca/logo-arga.png" alt="ARGA Premium Cars" width={168} height={42} priority />
        </div>

        <div className="mt-9 rounded-3xl border border-white/12 bg-ink-2/80 p-7 backdrop-blur sm:p-9">
          <p className="text-[11px] font-bold uppercase tracking-[.2em] text-gold">Campus de formación</p>
          <h1 className="mt-3 text-[26px] font-black leading-tight tracking-[-.03em]">
            Entra a tu formación
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-white/55">
            Usa el correo con el que compraste el curso.
          </p>

          <FormularioAcceso destino={destino ?? '/campus'} />
        </div>

        <p className="mt-6 text-center text-xs text-white/40">
          ¿Problemas para entrar?{' '}
          <Link href="/recuperar" className="text-gold underline underline-offset-4">
            Recupera tu contraseña
          </Link>
        </p>
      </div>
    </main>
  )
}
