import Link from 'next/link'
import Header from '@/components/header'
import Footer from '@/components/footer'
import { BONUS, MODULOS, PRECIO_EUR, PRECIO_TEXTO, IVA } from '@/lib/contenido-landing'
import BotonPago from './boton'

export const metadata = { title: 'Acceder a la formación' }

/** Pantalla intermedia antes de Stripe: qué compras, cuánto cuesta y el botón de pago. */
export default function Pagar() {
  const listo = Boolean(PRECIO_EUR && process.env.STRIPE_SECRET_KEY)
  const clases = MODULOS.reduce((n, m) => n + m.lessons.length, 0)

  return (
    <>
      <Header />
      <main className="mx-auto max-w-5xl px-5 pt-28 pb-16 sm:pt-36 sm:pb-24">
        <Link href="/#acceso" className="text-[13px] text-white/45 hover:text-white">← Volver</Link>
        <p className="mt-6 text-[11px] font-bold uppercase tracking-[.2em] text-gold">Acceder a la formación</p>
        <h1 className="mt-3 max-w-[24ch] text-[clamp(26px,4.8vw,42px)] font-black leading-[1.08] tracking-[-.035em]">
          Formación de importación de vehículos <span className="text-gold">ARGA Premium Cars</span>
        </h1>

        <div className="mt-10 grid gap-5 lg:grid-cols-[1.2fr_1fr]">
          <section className="rounded-[28px] border border-white/12 bg-ink-3 p-6 sm:p-8">
            <h2 className="text-[11px] font-bold uppercase tracking-[.16em] text-white/45">Qué incluye</h2>
            <ul className="mt-5 space-y-3">
              <li className="flex gap-3 text-[15px]"><Check />{MODULOS.length} módulos y {clases} clases en vídeo, de la búsqueda a la matriculación</li>
              {BONUS.map((b, i) => (
                <li key={b.title} className="flex gap-3 text-[15px] text-white/80">
                  <Check />
                  <span>
                    <b className="text-gold">Bonus {i + 1}.</b> {b.title}
                    {b.pronto && <span className="ml-2 rounded-full border border-gold/50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-gold">Próximamente</span>}
                  </span>
                </li>
              ))}
            </ul>
          </section>

          <section className="flex flex-col rounded-[28px] border border-gold/40 bg-[linear-gradient(160deg,rgba(197,165,114,.16)_0%,rgba(197,165,114,.04)_60%,transparent_100%)] p-6 sm:p-8">
            <h2 className="text-[11px] font-bold uppercase tracking-[.16em] text-white/45">Tu pedido</h2>
            {PRECIO_EUR ? (
              <dl className="mt-5 space-y-2 border-b border-white/10 pb-5 text-[14.5px]">
                <div className="flex justify-between gap-4"><dt className="text-white/70">Acceso completo · pago único</dt><dd className="tabular-nums">{PRECIO_TEXTO.base}</dd></div>
                <div className="flex justify-between gap-4"><dt className="text-white/50">IVA ({Math.round(IVA * 100)} %)</dt><dd className="tabular-nums text-white/50">{new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0, useGrouping: 'always' }).format(PRECIO_EUR - PRECIO_EUR / (1 + IVA))}</dd></div>
                <div className="flex items-baseline justify-between gap-4 pt-2"><dt className="font-bold">Total</dt><dd className="text-[32px] font-black tracking-[-.04em] tabular-nums">{PRECIO_TEXTO.total}</dd></div>
              </dl>
            ) : (
              <span className="mt-5 inline-block rounded-lg border border-dashed border-gold/50 px-3 py-1.5 text-sm font-bold text-gold">Precio pendiente</span>
            )}
            <p className="mt-3 text-[13px] text-white/45">Recibirás la factura por correo.</p>

            <ul className="mt-6 space-y-2 text-[13.5px] text-white/60">
              <li>· Pago seguro con tarjeta, Apple Pay o Google Pay a través de Stripe.</li>
              <li>· Acceso inmediato: en cuanto se confirma, te llega el correo para entrar.</li>
            </ul>

            <div className="mt-auto pt-6">
              {!listo && (
                <p className="mb-2 rounded-xl border border-dashed border-gold/40 px-4 py-3 text-[13px] text-gold">
                  El pago online se activa en cuanto esté conectada la cuenta de Stripe.
                </p>
              )}
              <BotonPago activo={listo} />
              <p className="mt-5 text-center text-[13px] text-white/45">
                ¿Tienes dudas antes de pagar?{' '}
                <Link href="/#acceso" className="font-semibold text-gold underline underline-offset-4">Agenda una llamada</Link>
              </p>
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </>
  )
}

function Check() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className="mt-0.5 h-4.5 w-4.5 flex-none fill-gold">
      <path d="M9 16.2 4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4z" />
    </svg>
  )
}
