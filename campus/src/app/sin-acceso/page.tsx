import Image from 'next/image'

export default function SinAcceso() {
  return (
    <main className="flex min-h-dvh items-center justify-center px-5 py-12">
      <div className="w-full max-w-md text-center">
        <Image src="/marca/logo-arga.png" alt="ARGA Premium Cars" width={150} height={38} className="mx-auto" />
        <div className="mt-9 rounded-3xl border border-white/12 bg-ink-2 p-8">
          <p className="text-[11px] font-bold uppercase tracking-[.18em] text-gold">Acceso pendiente</p>
          <h1 className="mt-3 text-2xl font-black tracking-[-.03em]">Tu cuenta todavía no tiene la formación activa</h1>
          <p className="mt-3 text-sm leading-relaxed text-white/55">
            Si acabas de comprar, puede tardar unos minutos en activarse. Si ya ha pasado un rato,
            escríbenos y lo miramos.
          </p>
          <form action="/auth/salir" method="post" className="mt-7">
            <button className="w-full rounded-full border border-white/18 px-6 py-3.5 text-sm font-bold text-white/80 hover:border-white/40">
              Salir
            </button>
          </form>
        </div>
      </div>
    </main>
  )
}
