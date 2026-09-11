'use client'

import { useActionState } from 'react'
import { useFormStatus } from 'react-dom'
import { pedirEnlace, type EstadoRecuperar } from './actions'

function Boton() {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      className="mt-6 w-full rounded-full bg-gradient-to-b from-gold-soft to-gold px-6 py-4 text-[15px] font-extrabold uppercase tracking-wide text-ink disabled:opacity-60"
    >
      {pending ? 'Enviando…' : 'Enviar enlace'}
    </button>
  )
}

export default function FormularioRecuperar() {
  const [estado, accion] = useActionState<EstadoRecuperar, FormData>(pedirEnlace, {})

  if (estado.enviado) {
    return (
      <p className="mt-7 rounded-xl border border-emerald-400/30 bg-emerald-500/10 px-4 py-4 text-sm leading-relaxed text-emerald-100">
        Si ese correo tiene cuenta en el campus, le acaba de llegar el enlace. Revisa también la
        carpeta de spam.
      </p>
    )
  }

  return (
    <form action={accion} className="mt-7">
      <label className="block text-xs font-semibold uppercase tracking-wider text-white/50">
        Correo
        <input
          name="email" type="email" autoComplete="email" required
          placeholder="tucorreo@ejemplo.com"
          className="mt-2 w-full rounded-xl border border-white/12 bg-ink px-4 py-3.5 text-[15px] font-normal normal-case tracking-normal text-white placeholder:text-white/25 focus:border-gold/60"
        />
      </label>
      {estado.error && (
        <p role="alert" className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {estado.error}
        </p>
      )}
      <Boton />
    </form>
  )
}
