import { createAdminClient } from '@/lib/supabase/server'
import SubirRecurso from './subir'
import { borrarRecurso, renombrarRecurso } from './actions'

const fmtPeso = (b: number | null) =>
  b ? `${(b / 1024 / 1024).toFixed(1)} MB` : '—'

export const metadata = { title: 'Recursos' }

export default async function AdminRecursos() {
  const admin = createAdminClient()
  const { data: recursos } = await admin
    .from('lesson_files')
    .select('id, title, size_bytes, position, lesson_id, is_resource, lessons(code)')
    .eq('is_resource', true)
    .order('position')

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-[-.03em]">Recursos descargables</h1>
          <p className="mt-1.5 text-sm text-white/50">
            Las guías y plantillas que el alumno ve en su zona de recursos.
          </p>
        </div>
        <SubirRecurso siguiente={(recursos?.length ?? 0) + 1} />
      </div>

      {(recursos?.length ?? 0) === 0 ? (
        <p className="mt-8 rounded-2xl border border-dashed border-gold/35 bg-ink-3 p-8 text-center text-sm text-white/50">
          Todavía no hay recursos. Sube el primero con el botón de arriba.
        </p>
      ) : (
        <ul className="mt-8 space-y-2.5">
          {recursos!.map((r, i) => {
            const clase = r.lessons as unknown as { code: string } | null
            return (
              <li key={r.id} className="flex flex-wrap items-center gap-x-4 gap-y-3 rounded-xl border border-white/12 bg-ink-3 px-5 py-4">
                <span className="flex-none text-[12px] font-bold tabular-nums text-white/35">{i + 1}</span>

                <form action={renombrarRecurso} className="flex flex-1 flex-wrap items-center gap-2.5">
                  <input type="hidden" name="id" value={r.id} />
                  <input
                    name="title" defaultValue={r.title}
                    className="min-w-[220px] flex-1 rounded-lg border border-transparent bg-transparent px-2 py-1.5 text-[14.5px] transition hover:border-white/12 focus:border-gold/50 focus:bg-ink"
                  />
                  <button className="rounded-full border border-white/16 px-3.5 py-1.5 text-[12px] font-semibold text-white/60 transition hover:border-gold/50 hover:text-white">
                    Guardar
                  </button>
                </form>

                {clase?.code && (
                  <span className="flex-none rounded-full bg-white/8 px-2.5 py-1 text-[10.5px] font-bold uppercase tracking-wider text-white/50">
                    Clase {clase.code}
                  </span>
                )}
                <span className="flex-none text-[12.5px] tabular-nums text-white/35">{fmtPeso(r.size_bytes)}</span>

                <a
                  href={`/api/descargar/${r.id}`}
                  className="flex-none rounded-full border border-white/16 px-3.5 py-1.5 text-[12px] font-semibold text-white/60 transition hover:border-gold/50 hover:text-white"
                >
                  Ver
                </a>

                <form action={borrarRecurso} className="flex-none">
                  <input type="hidden" name="id" value={r.id} />
                  <button className="rounded-full border border-white/16 px-3.5 py-1.5 text-[12px] font-semibold text-white/45 transition hover:border-red-400/50 hover:text-red-200">
                    Borrar
                  </button>
                </form>
              </li>
            )
          })}
        </ul>
      )}
    </>
  )
}
