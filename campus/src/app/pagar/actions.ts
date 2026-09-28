'use server'

import { redirect } from 'next/navigation'
import { stripe, urlBase } from '@/lib/stripe'
import { PRECIO_EUR } from '@/lib/contenido-landing'

export type EstadoPago = { error?: string }

/** Abre el pago en Stripe (su página segura) y manda allí al comprador. */
export async function irAPagar(_prev: EstadoPago, formData: FormData): Promise<EstadoPago> {
  const cliente = stripe()
  if (!cliente || !PRECIO_EUR) return { error: 'El pago online aún no está activo. Agenda una llamada y te lo gestionamos.' }
  if (formData.get('condiciones') !== 'on') return { error: 'Tienes que aceptar las condiciones de compra.' }

  const base = urlBase()
  let url: string | null = null
  try {
    const sesion = await cliente.checkout.sessions.create({
      mode: 'payment',
      locale: 'es',
      line_items: [{
        quantity: 1,
        price_data: {
          currency: 'eur',
          unit_amount: Math.round(PRECIO_EUR * 100),
          product_data: {
            name: 'Formación de importación de vehículos · ARGA Premium Cars',
            description: '9 módulos en vídeo, guías, plantillas, 3 mentorías 1 a 1 y bonus. Precio 2.400 € + 21 % de IVA.',
          },
        },
      }],
      // Lo que hace falta para la factura y la ficha del alumno
      customer_creation: 'always',
      billing_address_collection: 'required',
      phone_number_collection: { enabled: true },
      tax_id_collection: { enabled: true },
      success_url: `${base}/pagar/gracias?sesion={CHECKOUT_SESSION_ID}`,
      cancel_url: `${base}/pagar`,
    })
    url = sesion.url
  } catch (e) {
    console.error('[stripe] crear sesión', e)
    return { error: 'No se ha podido abrir el pago. Inténtalo de nuevo en un momento.' }
  }

  if (!url) return { error: 'No se ha podido abrir el pago.' }
  redirect(url)
}
