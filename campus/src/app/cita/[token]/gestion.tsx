'use client'

import Link from 'next/link'
import { useActionState, useState } from 'react'
import { useFormStatus } from 'react-dom'
import Agenda, { type DatosCalendario } from '@/components/agenda'
import type { ResultadoCita } from '@/lib/reservar-cita'
import { fechaHora, nombreZona } from '@/lib/fechas'
import { cambiarDesdeEnlace, cancelarDesdeEnlace } from './actions'

function Boton({ texto, pendiente, peligro = false }: { texto: string; pendiente: string; peligro?: boolean }) {
  const { pending } = useFormStatus()
  return (
    <button type="submit" disabled={pending}
            className={`rounded-full px-6 py-3.5 text-[13.5px] font-extrabold uppercase tracking-wide disabled:opacity-60 ${
              peligro ? 'border border-red-400/40 text-red-200 hover:bg-red-500/10' : 'bg-gradient-to-b from-gold-soft to-gold text-ink'
            }`}>
      {pending ? pendiente : texto}
    </button>
  )
}

export default function Gestion({ token, datos, volver }: { token: string; datos: DatosCalendario; volver: string }) {
  const [modo, setModo] = useState<'inicio' | 'cambiar' | 'cancelar'>('inicio')
  const [eleccion, setEleccion] = useState<{ iso: string; zona: string } | null>(null)
  const [estCancelar, accCancelar] = useActionState<ResultadoCita, FormData>(cancelarDesdeEnlace, {})
  const [estCambiar, accCambiar] = useActionState<ResultadoCita, FormData>(cambiarDesdeEnlace, {})

  if (estCancelar.ok) {
    return (
      <div className="mt-8 rounded-2xl border border-white/12 bg-ink-3 p-6">
        <p className="text-[16px] font-extrabold">Cita cancelada</p>
        <p className="mt-1.5 text-sm text-white/55">Te hemos mandado la confirmación por correo. Cuando quieras, reserva otro hueco.</p>
        <Link href={volver} className="mt-5 inline-flex rounded-full border border-white/24 px-6 py-3 text-[13px] font-bold uppercase tracking-wide">Elegir otro hueco</Link>
      </div>
    )
  }
  if (estCambiar.ok && eleccion) {
    return (
      <div className="mt-8 rounded-2xl border border-emerald-400/30 bg-emerald-500/10 p-6">
        <p className="text-[16px] font-extrabold">Cita cambiada</p>
        <p className="mt-1.5 text-sm text-white/70">
          Nueva hora: <strong className="first-letter:uppercase">{fechaHora(eleccion.iso, eleccion.zona)}</strong> ({nombreZona(eleccion.zona)}).
          Te llega la nueva confirmación al correo.
        </p>
      </div>
    )
  }

  return (
    <div className="mt-8">
      {modo === 'inicio' && (
        <div className="flex flex-wrap gap-3">
          <button onClick={() => setModo('cambiar')} className="rounded-full bg-gradient-to-b from-gold-soft to-gold px-6 py-3.5 text-[13.5px] font-extrabold uppercase tracking-wide text-ink">
            Cambiar de hora
          </button>
          <button onClick={() => setModo('cancelar')} className="rounded-full border border-white/20 px-6 py-3.5 text-[13.5px] font-bold uppercase tracking-wide text-white/70 hover:border-red-400/40 hover:text-red-200">
            Cancelar la cita
          </button>
        </div>
      )}

      {modo === 'cancelar' && (
        <form action={accCancelar} className="rounded-2xl border border-red-400/25 bg-red-500/5 p-6">
          <input type="hidden" name="token" value={token} />
          <p className="text-[15px] font-bold">¿Seguro que quieres cancelarla?</p>
          <p className="mt-1 text-sm text-white/55">El hueco quedará libre para otra persona.</p>
          {estCancelar.error && <p role="alert" className="mt-3 text-sm text-red-200">{estCancelar.error}</p>}
          <div className="mt-5 flex flex-wrap gap-3">
            <Boton texto="Sí, cancelar" pendiente="Cancelando…" peligro />
            <button type="button" onClick={() => setModo('inicio')} className="px-4 text-[13.5px] font-semibold text-white/60">No, volver</button>
          </div>
        </form>
      )}

      {modo === 'cambiar' && !eleccion && (
        <>
          <button onClick={() => setModo('inicio')} className="mb-4 text-[13px] text-white/50 hover:text-white">← Volver</button>
          <Agenda datos={datos} onElegir={(iso, zona) => setEleccion({ iso, zona })} />
        </>
      )}

      {modo === 'cambiar' && eleccion && (
        <form action={accCambiar} className="rounded-2xl border border-gold/40 bg-gold/8 p-6">
          <input type="hidden" name="token" value={token} />
          <input type="hidden" name="empieza" value={eleccion.iso} />
          <input type="hidden" name="zona" value={eleccion.zona} />
          <p className="text-[12px] font-bold uppercase tracking-wider text-gold">Nueva hora</p>
          <p className="mt-1 text-[16px] font-extrabold first-letter:uppercase">{fechaHora(eleccion.iso, eleccion.zona)}</p>
          <p className="text-[12.5px] text-white/50">{nombreZona(eleccion.zona)}</p>
          {estCambiar.error && <p role="alert" className="mt-3 text-sm text-red-200">{estCambiar.error}</p>}
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <Boton texto="Confirmar el cambio" pendiente="Cambiando…" />
            <button type="button" onClick={() => setEleccion(null)} className="px-4 text-[13.5px] font-semibold text-gold underline underline-offset-4">Elegir otra</button>
          </div>
        </form>
      )}
    </div>
  )
}
