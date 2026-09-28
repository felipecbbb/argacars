'use client'

import { useState, useTransition } from 'react'
import { borrarRecurso, cambiarTipo, renombrarRecurso, reordenarRecursos } from './actions'

type Recurso = {
  id: string
  title: string
  size_bytes: number | null
  clase: string | null
  kind: 'recurso' | 'plantilla'
}

const peso = (b: number | null) => (b ? `${(b / 1024 / 1024).toFixed(1)} MB` : '—')

export default function Lista({ inicial }: { inicial: Recurso[] }) {
  const [items, setItems] = useState(inicial)
  const [arrastrado, setArrastrado] = useState<string | null>(null)
  const [sucio, setSucio] = useState(false)
  const [msg, setMsg] = useState<string | null>(null)
  const [editando, setEditando] = useState<string | null>(null)
  const [pendiente, start] = useTransition()

  // La lista local solo guarda el orden; el tipo se lee de lo que manda el servidor,
  // para que el botón Guía/Plantilla se refresque tras cambiarlo.
  const tipoDe = (r: Recurso) => inicial.find((x) => x.id === r.id)?.kind ?? r.kind

  function soltarSobre(id: string) {
    if (!arrastrado || arrastrado === id) return
    const desde = items.findIndex((r) => r.id === arrastrado)
    const hasta = items.findIndex((r) => r.id === id)
    if (desde < 0 || hasta < 0) return

    const copia = [...items]
    const [movido] = copia.splice(desde, 1)
    copia.splice(hasta, 0, movido)
    setItems(copia)
    setSucio(true)
  }

  function guardarOrden() {
    start(async () => {
      setMsg(await reordenarRecursos(items.map((r) => r.id)))
      setSucio(false)
    })
  }

  return (
    <>
      {sucio && (
        <div className="mt-6 flex flex-wrap items-center gap-3.5 rounded-xl border border-gold/40 bg-gold/8 px-5 py-3.5">
          <p className="flex-1 text-[13.5px]">Has cambiado el orden. ¿Lo guardamos?</p>
          <button onClick={() => { setItems(inicial); setSucio(false) }}
                  className="rounded-full border border-white/20 px-4 py-2 text-[12.5px] font-semibold text-white/70 hover:border-white/40">
            Deshacer
          </button>
          <button onClick={guardarOrden} disabled={pendiente}
                  className="rounded-full bg-gold px-5 py-2 text-[12.5px] font-extrabold uppercase text-ink disabled:opacity-60">
            {pendiente ? 'Guardando…' : 'Guardar orden'}
          </button>
        </div>
      )}

      {msg && <p className="mt-4 text-xs text-white/55">{msg}</p>}

      <ul className="mt-6 space-y-2.5">
        {items.map((r, i) => (
          <li
            key={r.id}
            draggable
            onDragStart={() => setArrastrado(r.id)}
            onDragEnd={() => setArrastrado(null)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => soltarSobre(r.id)}
            className={`flex flex-wrap items-center gap-x-4 gap-y-3 rounded-xl border bg-ink-3 px-4 py-4 transition ${
              arrastrado === r.id ? 'border-gold/60 opacity-50' : 'border-white/12'
            }`}
          >
            <span
              aria-hidden
              title="Arrastra para cambiar el orden"
              className="flex-none cursor-grab select-none px-1 text-white/25 active:cursor-grabbing"
            >
              ⠿
            </span>
            <span className="flex-none text-[12px] font-bold tabular-nums text-white/35">{i + 1}</span>

            <form action={renombrarRecurso} onSubmit={() => setEditando(null)} className="flex flex-1 flex-wrap items-center gap-2.5">
              <input type="hidden" name="id" value={r.id} />
              <input
                name="title" defaultValue={r.title} title="Pulsa para cambiar el nombre"
                onChange={(e) => setEditando(e.target.value.trim() && e.target.value !== r.title ? r.id : null)}
                className="min-w-[200px] flex-1 rounded-lg border border-transparent bg-transparent px-2 py-1.5 text-[14.5px] transition hover:border-white/12 focus:border-gold/50 focus:bg-ink"
              />
              {editando === r.id && (
                <button className="rounded-full bg-gold px-3.5 py-1.5 text-[12px] font-bold text-ink">
                  Guardar nombre
                </button>
              )}
            </form>

            {r.clase && (
              <span className="flex-none rounded-full bg-white/8 px-2.5 py-1 text-[10.5px] font-bold uppercase tracking-wider text-white/50">
                Clase {r.clase}
              </span>
            )}
            <form action={cambiarTipo} className="flex-none">
              <input type="hidden" name="id" value={r.id} />
              <input type="hidden" name="kind" value={tipoDe(r) === 'plantilla' ? 'recurso' : 'plantilla'} />
              <button
                title="Cambiar entre guía y plantilla"
                className={`rounded-full px-2.5 py-1 text-[10.5px] font-bold uppercase tracking-wider transition ${
                  tipoDe(r) === 'plantilla' ? 'bg-gold/15 text-gold hover:bg-gold/25' : 'bg-white/8 text-white/50 hover:bg-white/14'
                }`}
              >
                {tipoDe(r) === 'plantilla' ? 'Plantilla' : 'Guía'}
              </button>
            </form>
            <span className="flex-none text-[12.5px] tabular-nums text-white/35">{peso(r.size_bytes)}</span>

            <a href={`/api/descargar/${r.id}`}
               className="flex-none rounded-full border border-white/16 px-3.5 py-1.5 text-[12px] font-semibold text-white/60 transition hover:border-gold/50 hover:text-white">
              Descargar
            </a>

            <form action={borrarRecurso} className="flex-none">
              <input type="hidden" name="id" value={r.id} />
              <button className="rounded-full border border-white/16 px-3.5 py-1.5 text-[12px] font-semibold text-white/45 transition hover:border-red-400/50 hover:text-red-200">
                Borrar
              </button>
            </form>
          </li>
        ))}
      </ul>
    </>
  )
}
