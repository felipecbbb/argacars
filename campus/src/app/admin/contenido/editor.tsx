'use client'

import { useState } from 'react'
import { guardarLeccion, subirPdf } from './actions'

type Leccion = {
  id: string; code: string; title: string
  video_id: string | null; description: string | null; published: boolean
}

export default function EditorLeccion({ leccion }: { leccion: Leccion }) {
  const [abierto, setAbierto] = useState(false)
  const [msg, setMsg] = useState<string | null>(null)

  return (
    <div>
      <button onClick={() => setAbierto((v) => !v)} className="flex w-full items-center gap-4 text-left">
        <span className="flex-none text-[13px] font-bold tabular-nums text-white/45">{leccion.code}</span>
        <span className="flex-1 text-[14.5px]">{leccion.title}</span>
        <span className={`flex-none rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${
          leccion.video_id ? 'bg-emerald-500/15 text-emerald-300' : 'bg-white/8 text-white/40'
        }`}>
          {leccion.video_id ? 'Con vídeo' : 'Sin vídeo'}
        </span>
        <span className="flex-none text-white/25" aria-hidden>{abierto ? '▴' : '▾'}</span>
      </button>

      {abierto && (
        <div className="mt-4 space-y-4 rounded-xl border border-white/10 bg-ink p-5">
          <form
            action={async (fd) => { setMsg(await guardarLeccion(leccion.id, fd)) }}
            className="space-y-3.5"
          >
            <label className="block text-[11px] font-bold uppercase tracking-wider text-white/45">
              Identificador del vídeo en Bunny
              <input name="video_id" defaultValue={leccion.video_id ?? ''} placeholder="p. ej. 8f2c1a04-…"
                className="mt-1.5 w-full rounded-lg border border-white/12 bg-ink-3 px-3.5 py-2.5 font-mono text-[13px] font-normal normal-case tracking-normal text-white" />
            </label>

            <label className="block text-[11px] font-bold uppercase tracking-wider text-white/45">
              Descripción de la clase
              <textarea name="description" rows={6} defaultValue={leccion.description ?? ''}
                placeholder="Un resumen corto de la clase. Los enlaces se pegan tal cual o como [texto del enlace](https://…)"
                className="mt-1.5 w-full rounded-lg border border-white/12 bg-ink-3 px-3.5 py-2.5 text-[13.5px] font-normal normal-case tracking-normal leading-relaxed text-white placeholder:text-white/25" />
              <span className="mt-1.5 block text-[11.5px] font-normal normal-case tracking-normal text-white/35">
                El alumno la ve debajo del vídeo. Los PDF que adjuntes aquí abajo salen como «La guía de esta clase».
              </span>
            </label>

            <label className="flex items-center gap-2.5 text-[13px] text-white/70">
              <input type="checkbox" name="published" defaultChecked={leccion.published} className="h-4 w-4 accent-[#c5a572]" />
              Visible para los alumnos
            </label>

            <button className="rounded-full bg-gold px-5 py-2.5 text-[12.5px] font-extrabold uppercase tracking-wide text-ink">
              Guardar
            </button>
          </form>

          <form
            action={async (fd) => { setMsg(await subirPdf(leccion.id, fd)) }}
            className="border-t border-white/8 pt-4"
          >
            <p className="text-[11px] font-bold uppercase tracking-wider text-white/45">Adjuntar un PDF</p>
            <div className="mt-2.5 flex flex-wrap items-center gap-2.5">
              <input type="file" name="file" accept="application/pdf" required
                className="text-[13px] text-white/60 file:mr-3 file:rounded-full file:border-0 file:bg-white/10 file:px-4 file:py-2 file:text-[12px] file:font-bold file:text-white" />
              <input name="title" placeholder="Nombre visible" required
                className="rounded-lg border border-white/12 bg-ink-3 px-3.5 py-2 text-[13px]" />
              <label className="flex items-center gap-2 text-[12.5px] text-white/60">
                <input type="checkbox" name="is_resource" className="h-4 w-4 accent-[#c5a572]" />
                También en Recursos
              </label>
              <button className="rounded-full border border-white/18 px-4 py-2 text-[12.5px] font-bold text-white/80 hover:border-gold/50">
                Subir
              </button>
            </div>
          </form>

          {msg && <p className="text-xs text-white/55">{msg}</p>}
        </div>
      )}
    </div>
  )
}
