'use client'

import { useActionState } from 'react'
import { useFormStatus } from 'react-dom'
import { entrar, type EstadoAcceso } from './actions'

function Boton() {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      className="mt-6 w-full rounded-full bg-gradient-to-b from-gold-soft to-gold px-6 py-4 text-[15px] font-extrabold uppercase tracking-wide text-ink shadow-[0_18px_40px_-16px_rgba(197,165,114,.7)] transition hover:-translate-y-0.5 disabled:opacity-60 disabled:hover:translate-y-0"
    >
      {pending ? 'Entrando…' : 'Entrar'}
    </button>
  )
}

export default function FormularioAcceso({ destino }: { destino: string }) {
  const [estado, accion] = useActionState<EstadoAcceso, FormData>(entrar, {})

  return (
    <form action={accion} className="mt-7">
      <input type="hidden" name="destino" value={destino} />

      <label className="block text-xs font-semibold uppercase tracking-wider text-white/50">
        Correo
        <input
          name="email"
          type="email"
          autoComplete="email"
          required
          className="mt-2 w-full rounded-xl border border-white/12 bg-ink px-4 py-3.5 text-[15px] font-normal normal-case tracking-normal text-white placeholder:text-white/25 focus:border-gold/60"
          placeholder="tucorreo@ejemplo.com"
        />
      </label>

      <label className="mt-5 block text-xs font-semibold uppercase tracking-wider text-white/50">
        Contraseña
        <input
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className="mt-2 w-full rounded-xl border border-white/12 bg-ink px-4 py-3.5 text-[15px] font-normal normal-case tracking-normal text-white placeholder:text-white/25 focus:border-gold/60"
          placeholder="••••••••"
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
