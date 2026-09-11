'use client'

import { useState } from 'react'
import { abrirHuecos } from './actions'

export default function AbrirHuecos() {
  const [abierto, setAbierto] = useState(false)
  const [msg, setMsg] = useState<string | null>(null)

  return (
    <div className="relative">
      <button
        onClick={() => setAbierto((v) => !v)}
        className="rounded-full bg-gradient-to-b from-gold-soft to-gold px-5 py-2.5 text-[13px] font-extrabold uppercase tracking-wide text-ink"
      >
        Abrir huecos
      </button>

      {abierto && (
        <form
          action={async (fd) => { setMsg(await abrirHuecos(fd)) }}
          className="absolute right-0 z-20 mt-3 w-[330px] rounded-2xl border border-white/14 bg-ink-2 p-5 shadow-2xl"
        >
          <p className="text-[11px] font-bold uppercase tracking-wider text-gold">Nuevos huecos</p>
          <p className="mt-1.5 text-xs text-white/45">
            Se crean tramos de 30 minutos entre las dos horas que indiques.
          </p>

          <label className="mt-3.5 block text-[11px] font-bold uppercase tracking-wider text-white/45">
            Día
            <input name="dia" type="date" required
              className="mt-1.5 w-full rounded-lg border border-white/12 bg-ink px-3.5 py-2.5 text-sm font-normal normal-case tracking-normal text-white" />
          </label>

          <div className="mt-3 grid grid-cols-2 gap-3">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-white/45">
              Desde
              <input name="desde" type="time" defaultValue="17:00" required
                className="mt-1.5 w-full rounded-lg border border-white/12 bg-ink px-3.5 py-2.5 text-sm font-normal normal-case tracking-normal text-white" />
            </label>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-white/45">
              Hasta
              <input name="hasta" type="time" defaultValue="19:00" required
                className="mt-1.5 w-full rounded-lg border border-white/12 bg-ink px-3.5 py-2.5 text-sm font-normal normal-case tracking-normal text-white" />
            </label>
          </div>

          <button className="mt-4 w-full rounded-full bg-gold px-5 py-3 text-[13px] font-extrabold uppercase text-ink">
            Crear huecos
          </button>
          {msg && <p className="mt-3 text-xs text-white/60">{msg}</p>}
        </form>
      )}
    </div>
  )
}
