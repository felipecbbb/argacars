import { createAdminClient } from '@/lib/supabase/server'
import EditorLeccion from './editor'

export default async function Contenido() {
  const admin = createAdminClient()
  const { data: modulos } = await admin
    .from('modules')
    .select('id, code, title, position, lessons(id, code, title, position, video_id, description, published)')
    .order('position')
    .order('position', { referencedTable: 'lessons' })

  return (
    <>
      <h1 className="text-2xl font-black tracking-[-.03em]">Contenido</h1>
      <p className="mt-1.5 text-sm text-white/50">
        El identificador del vídeo se copia de Bunny Stream. Los PDF se suben en cada clase.
      </p>

      <div className="mt-7 space-y-3.5">
        {(modulos ?? []).map((m) => (
          <section key={m.id} className="overflow-hidden rounded-2xl border border-white/12 bg-ink-3">
            <div className="flex items-baseline gap-3 px-5 py-4">
              <span className="text-[11px] font-extrabold uppercase tracking-[.14em] text-gold">Módulo {m.code}</span>
              <h2 className="text-[16px] font-extrabold tracking-[-.02em]">{m.title}</h2>
            </div>
            <ul className="divide-y divide-white/6 border-t border-white/6">
              {((m.lessons ?? []) as { id: string; code: string; title: string; video_id: string | null; description: string | null; published: boolean }[]).map((l) => (
                <li key={l.id} className="px-5 py-4">
                  <EditorLeccion leccion={l} />
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </>
  )
}
