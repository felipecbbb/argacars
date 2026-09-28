import type Stripe from 'stripe'
import { createAdminClient } from '@/lib/supabase/server'
import { enviarBienvenida } from '@/lib/correo'
import { normalizarTelefono } from '@/lib/telefono'
import { urlBase } from '@/lib/stripe'

/**
 * Da acceso a quien acaba de pagar. Lo llama el aviso (webhook) de Stripe.
 * Es idempotente: Stripe repite los avisos, y la matrícula guarda la sesión
 * de pago, así que un segundo aviso no crea nada ni vuelve a mandar el correo.
 */
export async function darAccesoTrasPago(sesion: Stripe.Checkout.Session): Promise<string> {
  if (sesion.payment_status !== 'paid') return 'Sin cobrar todavía: nada que hacer.'

  const email = sesion.customer_details?.email?.trim().toLowerCase()
  if (!email) return 'La sesión no trae correo.'

  const nombre = sesion.customer_details?.name?.trim() || null
  const telefono = normalizarTelefono(sesion.customer_details?.phone ?? '')
  const dir = sesion.customer_details?.address
  const direccion = dir
    ? [dir.line1, dir.line2, [dir.postal_code, dir.city].filter(Boolean).join(' '), dir.state, dir.country]
        .filter(Boolean).join(', ')
    : null

  const admin = createAdminClient()

  const { data: repetido } = await admin
    .from('enrollments').select('id').eq('stripe_session_id', sesion.id).maybeSingle()
  if (repetido) return 'Aviso repetido: el alta ya se hizo.'

  // ¿Ya tenía cuenta? (alguien a quien se le retiró el acceso, o que se dio de alta a mano)
  const { data: existente } = await admin
    .from('profiles').select('id').eq('email', email).maybeSingle()

  let userId = existente?.id as string | undefined
  let enlace: string | null = null
  const redirectTo = `${urlBase()}/auth/callback?next=/nueva-clave`

  if (!userId) {
    const { data, error } = await admin.auth.admin.generateLink({
      type: 'invite', email, options: { data: { full_name: nombre ?? '' }, redirectTo },
    })
    if (error || !data?.user) throw new Error(`No se pudo crear la cuenta de ${email}: ${error?.message}`)
    userId = data.user.id
    enlace = data.properties.action_link
  } else {
    const { data } = await admin.auth.admin.generateLink({ type: 'recovery', email, options: { redirectTo } })
    enlace = data?.properties?.action_link ?? null
  }

  const { error: errMatricula } = await admin.from('enrollments').upsert({
    user_id: userId,
    status: 'active',
    source: 'stripe',
    amount_cents: sesion.amount_total,
    purchased_at: new Date().toISOString(),
    stripe_session_id: sesion.id,
  }, { onConflict: 'user_id' })
  if (errMatricula) throw new Error(`No se pudo guardar la matrícula: ${errMatricula.message}`)

  // Los datos que el alumno dejó en el pago pasan a su ficha (solo si no los tenía).
  const cambios: Record<string, string> = {}
  if (nombre) cambios.full_name = nombre
  if (telefono) cambios.phone = telefono
  if (direccion) cambios.address = direccion
  if (Object.keys(cambios).length) {
    const { error } = await admin.from('profiles').update(cambios).eq('id', userId)
    // Si el teléfono ya lo usa otra cuenta, se guarda el resto igualmente.
    if (error && cambios.phone) {
      delete cambios.phone
      await admin.from('profiles').update(cambios).eq('id', userId)
    }
  }

  if (enlace) await enviarBienvenida(email, enlace, nombre)
  return `Alta hecha: ${email}`
}
