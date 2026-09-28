import Cabecera from '@/components/cabecera'
import { exigirAcceso } from '@/lib/sesion'

export const dynamic = 'force-dynamic'

const GRUPO = process.env.NEXT_PUBLIC_GRUPO_SOPORTE ?? 'https://chat.whatsapp.com/LjdNjRDenmoLtEz1I8I3NC'

export default async function Dudas() {
  const { esAdmin } = await exigirAcceso()

  return (
    <>
      <Cabecera esAdmin={esAdmin} />
      <main className="mx-auto max-w-3xl px-5 py-9 sm:py-14">
        <p className="text-[11px] font-bold uppercase tracking-[.2em] text-gold">Resuelve tus dudas</p>
        <h1 className="mt-3 text-[clamp(24px,4.6vw,36px)] font-black leading-tight tracking-[-.035em]">
          ¿Te has atascado? <span className="text-gold">Pregúntanos</span>
        </h1>
        <p className="mt-4 max-w-prose text-[15px] leading-relaxed text-white/60">
          Las dudas se resuelven en el canal de la comunidad, donde estamos nosotros y el resto de
          alumnos. Si es algo que quieres ver en profundidad, reserva una de tus mentorías.
        </p>

        <div className="mt-8 grid gap-3.5 sm:grid-cols-2">
          <a
            href={GRUPO}
            target="_blank"
            rel="noopener"
            className="rounded-2xl border border-white/12 bg-ink-3 p-6 transition hover:border-gold/40"
          >
            <p className="text-[11px] font-bold uppercase tracking-[.14em] text-gold">Respuesta rápida</p>
            <p className="mt-2 text-[17px] font-extrabold tracking-[-.02em]">Canal de la comunidad</p>
            <p className="mt-2 text-sm text-white/50">
              Escribe tu duda y te contestamos ahí. También verás las de tus compañeros.
            </p>
          </a>

          <a
            href="/mentorias"
            className="rounded-2xl border border-white/12 bg-ink-3 p-6 transition hover:border-gold/40"
          >
            <p className="text-[11px] font-bold uppercase tracking-[.14em] text-gold">Cara a cara</p>
            <p className="mt-2 text-[17px] font-extrabold tracking-[-.02em]">Mentoría 1 a 1</p>
            <p className="mt-2 text-sm text-white/50">
              30 minutos de llamada privada. Tienes tres incluidas, sin caducidad.
            </p>
          </a>
        </div>
      </main>
    </>
  )
}
