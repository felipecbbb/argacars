'use client'

import { useActionState, useState } from 'react'
import { useFormStatus } from 'react-dom'
import Agenda, { type DatosCalendario } from '@/components/agenda'
import type { ResultadoCita } from '@/lib/reservar-cita'
import { fechaHora, hora, nombreZona } from '@/lib/fechas'
import { reservarMentoria } from './actions'

function Enviar() {
  const { pending } = useFormStatus()
  return (
    <button type="submit" disabled={pending}
            className="mt-5 rounded-full bg-gradient-to-b from-gold-soft to-gold px-8 py-4 text-[14px] font-extrabold uppercase tracking-wide text-ink disabled:opacity-60">
      {pending ? 'Reservando…' : 'Confirmar la mentoría'}
    </button>
  )
}

export default function Reserva({ datos }: { datos: DatosCalendario }) {
  const [eleccion, setEleccion] = useState<{ iso: string; zona: string } | null>(null)
  const [estado, accion] = useActionState<ResultadoCita, FormData>(reservarMentoria, {})

  if (estado.ok && eleccion) {
    return (
      <p className="mt-4 rounded-2xl border border-emerald-400/30 bg-emerald-500/10 px-5 py-5 text-[15px] text-emerald-100">
        Mentoría reservada para el <strong>{fechaHora(eleccion.iso, eleccion.zona)}</strong> ({nombreZona(eleccion.zona)}).
        Te hemos mandado la confirmación al correo con el evento para tu calendario.
      </p>
    )
  }

  if (!eleccion) return <div className="mt-4"><Agenda datos={datos} onElegir={(iso, zona) => setEleccion({ iso, zona })} /></div>

  const fin = new Date(new Date(eleccion.iso).getTime() + datos.duracionMin * 60_000)
  return (
    <form action={accion} className="mt-4 rounded-2xl border border-white/12 bg-ink-3 p-5 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-[16px] font-extrabold first-letter:uppercase">{fechaHora(eleccion.iso, eleccion.zona)}–{hora(fin, eleccion.zona)}</p>
          <p className="text-[12.5px] text-white/50">{datos.duracionMin} min · {nombreZona(eleccion.zona)}</p>
        </div>
        <button type="button" onClick={() => setEleccion(null)} className="text-[13px] font-semibold text-gold underline underline-offset-4">Cambiar</button>
      </div>
      <input type="hidden" name="empieza" value={eleccion.iso} />
      <input type="hidden" name="zona" value={eleccion.zona} />
      <label className="mt-5 block text-[11px] font-bold uppercase tracking-wider text-white/50">
        ¿De qué quieres hablar? <span className="font-normal normal-case text-white/30">(opcional)</span>
        <textarea name="mensaje" rows={3} maxLength={600} placeholder="Por ejemplo: revisar una operación concreta"
                  className="mt-1.5 w-full rounded-xl border border-white/12 bg-ink px-4 py-3 text-[15px] font-normal normal-case tracking-normal text-white placeholder:text-white/25 focus:border-gold/60" />
      </label>
      {estado.error && <p role="alert" className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">{estado.error}</p>}
      <Enviar />
    </form>
  )
}
