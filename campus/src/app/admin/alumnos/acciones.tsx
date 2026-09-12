'use client'

import { useState, useTransition } from 'react'
import { altaAlumno, alternarAcceso, reenviarAcceso } from './actions'

export default function Acciones({
  modo, userId, activo, email,
}: { modo: 'alta' | 'alternar'; userId?: string; activo?: boolean; email?: string }) {
  const [abierto, setAbierto] = useState(false)
  const [msg, setMsg] = useState<string | null>(null)
  const [pendiente, start] = useTransition()

  if (modo === 'alternar') {
    return (
      <div className="flex flex-wrap justify-end gap-2">
        {email && (
          <form action={reenviarAcceso}>
            <input type="hidden" name="email" value={email} />
            <button
              title="Le reenvía un enlace para entrar y poner contraseña"
              className="rounded-full border border-white/16 px-4 py-2 text-[12.5px] font-semibold text-white/60 hover:border-gold/50 hover:text-white"
            >
              Reenviar acceso
            </button>
          </form>
        )}
        <button
          onClick={() => start(async () => { await alternarAcceso(userId!, !activo) })}
          disabled={pendiente}
          className="rounded-full border border-white/16 px-4 py-2 text-[12.5px] font-semibold text-white/70 hover:border-gold/50 hover:text-white disabled:opacity-50"
        >
          {activo ? 'Retirar acceso' : 'Dar acceso'}
        </button>
      </div>
    )
  }

  return (
    <div className="relative">
      <button
        onClick={() => setAbierto((v) => !v)}
        className="rounded-full bg-gradient-to-b from-gold-soft to-gold px-5 py-2.5 text-[13px] font-extrabold uppercase tracking-wide text-ink"
      >
        Dar de alta
      </button>

      {abierto && (
        <form
          action={async (fd) => {
            const r = await altaAlumno(fd)
            setMsg(r.mensaje)
            if (r.ok) setAbierto(false)
          }}
          className="absolute right-0 z-20 mt-3 w-[320px] rounded-2xl border border-white/14 bg-ink-2 p-5 shadow-2xl"
        >
          <p className="text-[11px] font-bold uppercase tracking-wider text-gold">Alta manual</p>
          <p className="mt-1.5 text-xs text-white/45">
            Crea la cuenta y le manda por correo un enlace para poner su contraseña.
          </p>
          <input name="email" type="email" required placeholder="correo@alumno.com"
            className="mt-3.5 w-full rounded-xl border border-white/12 bg-ink px-4 py-3 text-sm" />
          <input name="full_name" placeholder="Nombre y apellidos"
            className="mt-2.5 w-full rounded-xl border border-white/12 bg-ink px-4 py-3 text-sm" />
          <button className="mt-4 w-full rounded-full bg-gold px-5 py-3 text-[13px] font-extrabold uppercase text-ink">
            Crear y dar acceso
          </button>
          {msg && <p className="mt-3 text-xs text-white/60">{msg}</p>}
        </form>
      )}
    </div>
  )
}
