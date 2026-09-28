'use client'

import { useActionState } from 'react'
import { useFormStatus } from 'react-dom'
import { irAPagar, type EstadoPago } from './actions'

const WEB = 'https://argapremiumcars.es'

function Enviar({ activo }: { activo: boolean }) {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={!activo || pending}
      className="mt-6 flex w-full justify-center rounded-full bg-gradient-to-b from-gold-soft to-gold px-8 py-4.5 text-[15px] font-extrabold uppercase tracking-wide text-ink shadow-[0_20px_46px_-16px_rgba(197,165,114,.75)] transition hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0"
    >
      {pending ? 'Abriendo el pago seguro…' : 'Pagar y acceder'}
    </button>
  )
}

export default function BotonPago({ activo }: { activo: boolean }) {
  const [estado, accion] = useActionState<EstadoPago, FormData>(irAPagar, {})

  return (
    <form action={accion}>
      <label className="flex items-start gap-3 text-[13.5px] leading-relaxed text-white/65">
        <input type="checkbox" name="condiciones" required className="mt-1 h-4 w-4 flex-none accent-[#c5a572]" />
        <span>
          Acepto las condiciones de compra y la{' '}
          <a href={`${WEB}/privacidad.html`} target="_blank" rel="noopener" className="text-gold underline underline-offset-4">política de privacidad</a>.
          Al ser contenido digital con acceso inmediato, entiendo que pierdo el derecho de desistimiento en cuanto empiezo a acceder.
        </span>
      </label>

      {estado.error && (
        <p role="alert" className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">{estado.error}</p>
      )}
      <Enviar activo={activo} />
    </form>
  )
}
