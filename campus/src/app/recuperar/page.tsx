import Image from 'next/image'
import Link from 'next/link'
import FormularioRecuperar from './formulario'

export default function Recuperar() {
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
          <p className="text-[11px] font-bold uppercase tracking-[.2em] text-gold">Contraseña</p>
          <h1 className="mt-3 text-[26px] font-black leading-tight tracking-[-.03em]">
            ¿No recuerdas tu contraseña?
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-white/55">
            Escribe tu correo y te mandamos un enlace para poner una nueva.
          </p>
          <FormularioRecuperar />
        </div>

        <p className="mt-6 text-center text-xs text-white/40">
          <Link href="/entrar" className="text-gold underline underline-offset-4">Volver a entrar</Link>
        </p>
      </div>
    </main>
  )
}
