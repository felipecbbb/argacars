'use client'

import { useActionState } from 'react'
import { useFormStatus } from 'react-dom'
import { guardarDatos, cambiarClave, type EstadoPerfil } from './actions'

const CAMPO =
  'mt-2 w-full rounded-xl border border-white/12 bg-ink px-4 py-3.5 text-[15px] font-normal normal-case tracking-normal text-white placeholder:text-white/25 focus:border-gold/60'
const ETIQUETA = 'block text-xs font-semibold uppercase tracking-wider text-white/50'

function Boton({ texto }: { texto: string }) {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit" disabled={pending}
      className="mt-5 rounded-full bg-gradient-to-b from-gold-soft to-gold px-7 py-3.5 text-[14px] font-extrabold uppercase tracking-wide text-ink disabled:opacity-60"
    >
      {pending ? 'Guardando…' : texto}
    </button>
  )
}

function Aviso({ estado }: { estado: EstadoPerfil }) {
  if (estado.error)
    return <p role="alert" className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">{estado.error}</p>
  if (estado.ok)
    return <p className="mt-4 rounded-xl border border-emerald-400/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100">{estado.ok}</p>
  return null
}

export default function Formularios({ nombre }: { nombre: string }) {
  const [estDatos, accDatos] = useActionState<EstadoPerfil, FormData>(guardarDatos, {})
  const [estClave, accClave] = useActionState<EstadoPerfil, FormData>(cambiarClave, {})

  return (
    <div className="mt-9 space-y-4">
      <section className="rounded-2xl border border-white/12 bg-ink-3 p-6 sm:p-7">
        <h2 className="text-[11px] font-bold uppercase tracking-[.16em] text-white/45">Tu nombre</h2>
        <form action={accDatos} className="mt-4">
          <label className={ETIQUETA}>
            Nombre y apellidos
            <input name="full_name" defaultValue={nombre} required minLength={2}
                   placeholder="Cómo quieres que te llamemos" className={CAMPO} />
          </label>
          <Aviso estado={estDatos} />
          <Boton texto="Guardar" />
        </form>
      </section>

      <section className="rounded-2xl border border-white/12 bg-ink-3 p-6 sm:p-7">
        <h2 className="text-[11px] font-bold uppercase tracking-[.16em] text-white/45">Contraseña</h2>
        <form action={accClave} className="mt-4">
          <label className={ETIQUETA}>
            Contraseña actual
            <input name="actual" type="password" autoComplete="current-password" required className={CAMPO} />
          </label>
          <label className={`${ETIQUETA} mt-5`}>
            Nueva contraseña
            <input name="nueva" type="password" autoComplete="new-password" required minLength={8}
                   placeholder="Mínimo 8 caracteres" className={CAMPO} />
          </label>
          <label className={`${ETIQUETA} mt-5`}>
            Repite la nueva
            <input name="repetir" type="password" autoComplete="new-password" required minLength={8} className={CAMPO} />
          </label>
          <Aviso estado={estClave} />
          <Boton texto="Cambiar contraseña" />
        </form>
      </section>
    </div>
  )
}
