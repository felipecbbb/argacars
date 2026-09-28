'use client'

import Link from 'next/link'
import { useActionState, useState } from 'react'
import { useFormStatus } from 'react-dom'
import Agenda, { type DatosCalendario } from '@/components/agenda'
import { reservarLlamada } from '@/app/llamada/actions'
import type { ResultadoCita } from '@/lib/reservar-cita'
import { fechaHora, hora, nombreZona } from '@/lib/fechas'

const CAMPO = 'mt-1.5 w-full rounded-xl border border-white/12 bg-ink px-4 py-3 text-[15px] font-normal normal-case tracking-normal text-white placeholder:text-white/25 focus:border-gold/60'
const ETIQUETA = 'block text-[11px] font-bold uppercase tracking-wider text-white/50'

function Enviar() {
  const { pending } = useFormStatus()
  return (
    <button type="submit" disabled={pending}
            className="mt-5 w-full rounded-full bg-gradient-to-b from-gold-soft to-gold px-6 py-4 text-[14px] font-extrabold uppercase tracking-wide text-ink disabled:opacity-60">
      {pending ? 'Reservando…' : 'Reservar la llamada'}
    </button>
  )
}

/** Reserva de llamada de la landing: calendario → datos → confirmación. */
export default function AgendaLlamada({ datos }: { datos: DatosCalendario }) {
  const [eleccion, setEleccion] = useState<{ iso: string; zona: string } | null>(null)
  const [estado, accion] = useActionState<ResultadoCita, FormData>(reservarLlamada, {})

  if (estado.ok && eleccion) {
    return (
      <div className="rounded-2xl border border-emerald-400/30 bg-emerald-500/10 p-6 text-center">
        <p className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-emerald-400/20 text-2xl text-emerald-200" aria-hidden>✓</p>
        <p className="mt-4 text-[17px] font-extrabold">¡Llamada reservada!</p>
        <p className="mt-2 text-[14.5px] text-white/75 first-letter:uppercase">
          {fechaHora(eleccion.iso, eleccion.zona)} · {nombreZona(eleccion.zona)}
        </p>
        <p className="mt-3 text-[13.5px] text-white/55">Te hemos enviado la confirmación por correo, con el evento para tu calendario y un enlace por si necesitas cambiarla.</p>
      </div>
    )
  }

  if (!eleccion) return <Agenda datos={datos} onElegir={(iso, zona) => setEleccion({ iso, zona })} />

  const fin = new Date(new Date(eleccion.iso).getTime() + datos.duracionMin * 60_000)
  return (
    <form action={accion}>
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-gold/40 bg-gold/8 px-5 py-4">
        <div>
          <p className="text-[15px] font-extrabold first-letter:uppercase">{fechaHora(eleccion.iso, eleccion.zona)}–{hora(fin, eleccion.zona)}</p>
          <p className="text-[12.5px] text-white/50">{datos.duracionMin} min · {nombreZona(eleccion.zona)}</p>
        </div>
        <button type="button" onClick={() => setEleccion(null)} className="text-[13px] font-semibold text-gold underline underline-offset-4">
          Cambiar
        </button>
      </div>

      <input type="hidden" name="empieza" value={eleccion.iso} />
      <input type="hidden" name="zona" value={eleccion.zona} />
      <input type="text" name="web" tabIndex={-1} autoComplete="off" aria-hidden className="absolute -left-[9999px] h-0 w-0 opacity-0" />

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <label className={ETIQUETA}>Nombre y apellidos
          <input name="nombre" required minLength={2} autoComplete="name" className={CAMPO} />
        </label>
        <label className={ETIQUETA}>Teléfono
          <input name="telefono" type="tel" required autoComplete="tel" placeholder="600 000 000" className={CAMPO} />
        </label>
        <label className={`${ETIQUETA} sm:col-span-2`}>Correo
          <input name="email" type="email" required autoComplete="email" className={CAMPO} />
        </label>
        <label className={`${ETIQUETA} sm:col-span-2`}>¿Qué te gustaría resolver? <span className="font-normal normal-case text-white/30">(opcional)</span>
          <textarea name="mensaje" rows={3} maxLength={600} placeholder="El coche que buscas, tu presupuesto, si es para ti o como actividad profesional…" className={CAMPO} />
        </label>
      </div>

      {estado.error && (
        <p role="alert" className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">{estado.error}</p>
      )}
      <Enviar />
      <p className="mt-3 text-center text-[12px] text-white/40">
        Tus datos solo se usan para esta llamada. <Link href="https://argapremiumcars.es/privacidad.html" className="underline underline-offset-2">Privacidad</Link>
      </p>
    </form>
  )
}
