'use client'

import { useState } from 'react'
import { subirRecurso } from './actions'

export default function SubirRecurso({ siguiente }: { siguiente: number }) {
  const [abierto, setAbierto] = useState(false)
  const [msg, setMsg] = useState<string | null>(null)

  return (
    <div className="relative">
      <button
        onClick={() => setAbierto((v) => !v)}
        className="rounded-full bg-gradient-to-b from-gold-soft to-gold px-5 py-2.5 text-[13px] font-extrabold uppercase tracking-wide text-ink"
      >
        Subir recurso
      </button>

      {abierto && (
        <form
          action={async (fd) => { setMsg(await subirRecurso(fd)); }}
          className="absolute right-0 z-20 mt-3 w-[340px] rounded-2xl border border-white/14 bg-ink-2 p-5 shadow-2xl"
        >
          <p className="text-[11px] font-bold uppercase tracking-wider text-gold">Nuevo descargable</p>
          <p className="mt-1.5 text-xs text-white/45">
            Aparecerá en la zona de recursos de todos los alumnos.
          </p>

          <input type="hidden" name="position" value={siguiente} />
          <input
            type="file" name="file" accept="application/pdf" required
            className="mt-3.5 w-full text-[13px] text-white/60 file:mr-3 file:rounded-full file:border-0 file:bg-white/10 file:px-4 file:py-2 file:text-[12px] file:font-bold file:text-white"
          />
          <select
            name="kind" defaultValue="recurso"
            className="mt-2.5 w-full rounded-xl border border-white/12 bg-ink px-4 py-3 text-sm"
          >
            <option value="recurso">Guía o recurso</option>
            <option value="plantilla">Plantilla (contrato, autorización…)</option>
          </select>
          <input
            name="title" placeholder="Nombre visible (opcional)"
            className="mt-2.5 w-full rounded-xl border border-white/12 bg-ink px-4 py-3 text-sm"
          />
          <button className="mt-4 w-full rounded-full bg-gold px-5 py-3 text-[13px] font-extrabold uppercase text-ink">
            Subir
          </button>
          {msg && <p className="mt-3 text-xs text-white/60">{msg}</p>}
        </form>
      )}
    </div>
  )
}
