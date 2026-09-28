import Link from 'next/link'
import Header from '@/components/header'
import Footer from '@/components/footer'
import { stripe } from '@/lib/stripe'

export const metadata = { title: 'Pago recibido' }
export const dynamic = 'force-dynamic'

export default async function Gracias({ searchParams }: { searchParams: Promise<{ sesion?: string }> }) {
  const { sesion } = await searchParams

  // Solo para enseñar a qué correo va el acceso; el alta la hace el webhook.
  let email: string | null = null
  const cliente = stripe()
  if (cliente && sesion?.startsWith('cs_')) {
    try {
      const s = await cliente.checkout.sessions.retrieve(sesion)
      if (s.payment_status === 'paid') email = s.customer_details?.email ?? null
    } catch {}
  }

  return (
    <>
      <Header />
      <main className="mx-auto max-w-2xl px-5 pt-32 pb-20 text-center sm:pt-40">
        <p className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-gold text-3xl text-ink" aria-hidden>✓</p>
        <h1 className="mt-7 text-[clamp(26px,5vw,40px)] font-black leading-[1.08] tracking-[-.035em]">
          ¡Bienvenido a la formación!
        </h1>
        <p className="mt-5 text-[16px] leading-relaxed text-white/65">
          Hemos recibido tu pago. En unos minutos te llega un correo
          {email ? <> a <strong className="text-white">{email}</strong></> : null} con el enlace para
          elegir tu contraseña y entrar al campus.
        </p>
        <p className="mt-3 text-[14px] text-white/45">
          Si no lo ves, mira en la carpeta de spam o escríbenos a info@argapremiumcars.com.
        </p>
        <Link href="/entrar" className="mt-9 inline-flex rounded-full border border-white/24 px-7 py-3.5 text-[13px] font-bold uppercase tracking-wide hover:border-white/45">
          Ir a la pantalla de acceso
        </Link>
      </main>
      <Footer />
    </>
  )
}
