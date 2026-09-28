import Stripe from 'stripe'

/**
 * Cliente de Stripe, o null si todavía no hay clave: así la web funciona igual
 * (el botón de pago se enseña como «pendiente») hasta que ARGA cree su cuenta.
 */
export function stripe(): Stripe | null {
  const clave = process.env.STRIPE_SECRET_KEY
  return clave ? new Stripe(clave) : null
}

/** Dirección pública del campus, para los enlaces de vuelta de Stripe y de los correos. */
export function urlBase(): string {
  return (process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000').replace(/\/$/, '')
}
