import { NextResponse } from 'next/server'
import type Stripe from 'stripe'
import { stripe } from '@/lib/stripe'
import { darAccesoTrasPago } from '@/lib/alta-pago'

/**
 * Aviso de Stripe cuando se completa un pago. Se comprueba la firma con el
 * secreto del webhook: sin ella, cualquiera podría darse de alta gratis.
 */
export async function POST(request: Request) {
  const cliente = stripe()
  const secreto = process.env.STRIPE_WEBHOOK_SECRET
  if (!cliente || !secreto) return NextResponse.json({ error: 'Stripe sin configurar' }, { status: 503 })

  const firma = request.headers.get('stripe-signature')
  if (!firma) return NextResponse.json({ error: 'Sin firma' }, { status: 400 })

  let evento: Stripe.Event
  try {
    evento = cliente.webhooks.constructEvent(await request.text(), firma, secreto)
  } catch {
    return NextResponse.json({ error: 'Firma no válida' }, { status: 400 })
  }

  // «completed» cubre la tarjeta; «async_payment_succeeded», los métodos que tardan en confirmarse.
  if (evento.type === 'checkout.session.completed' || evento.type === 'checkout.session.async_payment_succeeded') {
    try {
      const resultado = await darAccesoTrasPago(evento.data.object)
      return NextResponse.json({ ok: true, resultado })
    } catch (e) {
      // Un 500 hace que Stripe lo reintente más tarde.
      console.error('[stripe] alta tras pago', e)
      return NextResponse.json({ error: 'No se pudo dar el alta' }, { status: 500 })
    }
  }

  return NextResponse.json({ ok: true, ignorado: evento.type })
}
