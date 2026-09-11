import Image from 'next/image'
import FormularioNuevaClave from './formulario'

export const dynamic = 'force-dynamic'

export default function NuevaClave() {
  return (
    <main className="relative flex min-h-dvh items-center justify-center overflow-hidden px-5 py-12">
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute -top-40 -right-24 h-[520px] w-[520px] rounded-full bg-gold/15 blur-[110px]" />
      </div>

      <div className="relative w-full max-w-[420px]">
        <div className="flex justify-center">
          <Image src="/marca/logo-arga.png" alt="ARGA Premium Cars" width={168} height={42} priority />
        </div>

        <div className="mt-9 rounded-3xl border border-white/12 bg-ink-2/80 p-7 backdrop-blur sm:p-9">
          <p className="text-[11px] font-bold uppercase tracking-[.2em] text-gold">Tu acceso</p>
          <h1 className="mt-3 text-[26px] font-black leading-tight tracking-[-.03em]">
            Elige tu contraseña
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-white/55">
            Con ella entrarás al campus a partir de ahora.
          </p>
          <FormularioNuevaClave />
        </div>
      </div>
    </main>
  )
}
