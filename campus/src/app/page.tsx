import Link from 'next/link'
import Cabecera from '@/components/cabecera'
import { exigirAcceso } from '@/lib/sesion'

export const dynamic = 'force-dynamic'

type Leccion = { id: string; code: string; title: string; position: number; duration_secs: number | null }
type Modulo = { id: string; code: string; title: string; description: string | null; position: number; lessons: Leccion[] }

export default async function Campus() {
  const { supabase, perfil, esAdmin, user } = await exigirAcceso()

  const { data: modulos } = await supabase
    .from('modules')
    .select('id, code, title, description, position, lessons(id, code, title, position, duration_secs)')
    .order('position')
    .order('position', { referencedTable: 'lessons' })

  const { data: vistas } = await supabase
    .from('lesson_progress')
    .select('lesson_id')
    .eq('user_id', user.id)

  const completadas = new Set((vistas ?? []).map((v) => v.lesson_id))
  const lista = (modulos ?? []) as Modulo[]
  const total = lista.reduce((n, m) => n + (m.lessons?.length ?? 0), 0)
  const hechas = lista.reduce(
    (n, m) => n + (m.lessons ?? []).filter((l) => completadas.has(l.id)).length, 0
  )
  const pct = total ? Math.round((hechas / total) * 100) : 0
  const nombre = (perfil?.full_name ?? '').split(' ')[0]

  return (
    <>
      <Cabecera esAdmin={esAdmin} />

      <main className="mx-auto max-w-6xl px-5 py-9 sm:py-12">
        <p className="text-[11px] font-bold uppercase tracking-[.2em] text-gold">Tu formación</p>
        <h1 className="mt-3 text-[clamp(26px,5vw,40px)] font-black leading-[1.05] tracking-[-.035em]">
          {nombre ? `Hola, ${nombre}.` : 'Hola.'} De buscar el coche a<br className="hidden sm:block" />
          tenerlo <span className="text-gold">matriculado en España</span>
        </h1>

        {/* Progreso */}
        <div className="mt-7 max-w-md">
          <div className="flex items-baseline justify-between text-sm">
            <span className="text-white/55">Tu avance</span>
            <span className="font-bold tabular-nums">{hechas} de {total} clases</span>
          </div>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/10">
            <div className="h-full rounded-full bg-gradient-to-r from-gold-soft to-gold transition-[width] duration-500" style={{ width: `${pct}%` }} />
          </div>
        </div>

        {/* Módulos */}
        <div className="mt-10 space-y-3.5">
          {lista.map((m) => {
            const hechasMod = (m.lessons ?? []).filter((l) => completadas.has(l.id)).length
            const completo = m.lessons?.length > 0 && hechasMod === m.lessons.length
            return (
              <section key={m.id} className="overflow-hidden rounded-2xl border border-white/12 bg-ink-3">
                <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 px-5 pt-5 sm:px-6">
                  <span className="text-[11px] font-extrabold uppercase tracking-[.14em] text-gold">
                    Módulo {m.code}
                  </span>
                  <h2 className="text-[17px] font-extrabold tracking-[-.02em] sm:text-[19px]">{m.title}</h2>
                  {completo && (
                    <span className="rounded-full bg-emerald-500/15 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-300">
                      Completado
                    </span>
                  )}
                </div>
                {m.description && <p className="px-5 pt-1.5 text-sm text-white/45 sm:px-6">{m.description}</p>}

                <ul className="mt-4 divide-y divide-white/6 border-t border-white/6">
                  {(m.lessons ?? []).map((l) => {
                    const vista = completadas.has(l.id)
                    return (
                      <li key={l.id}>
                        <Link
                          href={`/clase/${l.code}`}
                          className="flex items-center gap-4 px-5 py-3.5 transition hover:bg-white/4 sm:px-6"
                        >
                          <span
                            className={`grid h-6 w-6 flex-none place-items-center rounded-full border text-[10px] font-bold ${
                              vista ? 'border-gold bg-gold text-ink' : 'border-white/25 text-white/40'
                            }`}
                            aria-hidden
                          >
                            {vista ? '✓' : ''}
                          </span>
                          <span className="flex-none text-[13px] font-bold tabular-nums text-white/45">{l.code}</span>
                          <span className="flex-1 text-[14.5px] leading-snug">{l.title}</span>
                          <span className="flex-none text-white/25" aria-hidden>›</span>
                        </Link>
                      </li>
                    )
                  })}
                </ul>
              </section>
            )
          })}
        </div>
      </main>
    </>
  )
}
