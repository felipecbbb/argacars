'use client'

import { useActionState, useState } from 'react'
import { useFormStatus } from 'react-dom'
import { reservar, type EstadoReserva } from './actions'

type Dia = { dia: string; huecos: { id: string; hora: string }[] }

function BotonReservar() {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      className="mt-4 w-full rounded-full bg-gradient-to-b from-gold-soft to-gold px-6 py-3.5 text-[14px] font-extrabold uppercase tracking-wide text-ink disabled:opacity-60 sm:w-auto sm:px-10"
    >
      {pending ? 'Reservando…' : 'Reservar este hueco'}
    </button>
  )
}

export default function Reserva({ porDia }: { porDia: Dia[] }) {
  const [elegido, setElegido] = useState<string | null>(null)
  const [estado, accion] = useActionState<EstadoReserva, FormData>(reservar, {})

  return (
    <form action={accion} className="mt-4">
      <div className="space-y-6">
        {porDia.map(({ dia, huecos }) => (
          <div key={dia}>
            <p className="text-[15px] font-bold capitalize">{dia}</p>
            <div className="mt-2.5 flex flex-wrap gap-2">
              {huecos.map((h) => (
                <label
                  key={h.id}
                  className={`cursor-pointer rounded-xl border px-4 py-3 text-[14px] font-semibold tabular-nums transition ${
                    elegido === h.id
                      ? 'border-gold bg-gold text-ink'
                      : 'border-white/14 bg-ink-3 text-white/80 hover:border-gold/50'
                  }`}
                >
                  <input
                    type="radio"
                    name="slot_id"
                    value={h.id}
                    className="sr-only"
                    onChange={() => setElegido(h.id)}
                    checked={elegido === h.id}
                  />
                  {h.hora}
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>

      {elegido && (
        <label className="mt-6 block text-xs font-semibold uppercase tracking-wider text-white/50">
          ¿De qué quieres hablar? (opcional)
          <input
            name="topic"
            maxLength={200}
            placeholder="Por ejemplo: revisar una operación concreta"
            className="mt-2 w-full rounded-xl border border-white/12 bg-ink px-4 py-3.5 text-[15px] font-normal normal-case tracking-normal text-white placeholder:text-white/25 focus:border-gold/60"
          />
        </label>
      )}

      {estado.error && (
        <p role="alert" className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {estado.error}
        </p>
      )}
      {estado.ok && (
        <p className="mt-4 rounded-xl border border-emerald-400/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
          {estado.ok}
        </p>
      )}

      {elegido && <BotonReservar />}
    </form>
  )
}
