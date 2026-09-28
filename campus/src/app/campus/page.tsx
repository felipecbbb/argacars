import Image from 'next/image'
import Link from 'next/link'
import Cabecera from '@/components/cabecera'
import { redirect } from 'next/navigation'
import { exigirAcceso } from '@/lib/sesion'

export const dynamic = 'force-dynamic'

type Leccion = { id: string; code: string; title: string; position: number; video_id: string | null }
type Modulo = { id: string; code: string; title: string; description: string | null; position: number; lessons: Leccion[] }

export default async function Campus({
  searchParams,
}: {
  searchParams: Promise<{ vista?: string }>
}) {
  const { vista } = await searchParams
  const { supabase, perfil, esAdmin, user } = await exigirAcceso()

  // El administrador gestiona; solo ve el campus si pide expresamente la vista de alumno.
  if (esAdmin && vista !== 'alumno') redirect('/admin')

  const [{ data: modulos }, { data: vistas }, { data: reservas }, { data: recursos }, { data: avances }] = await Promise.all([
    supabase.from('modules')
      .select('id, code, title, description, position, lessons(id, code, title, position, video_id)')
      .order('position').order('position', { referencedTable: 'lessons' }),
    supabase.from('lesson_progress').select('lesson_id').eq('user_id', user.id),
    // La política citas_propias deja al alumno leer solo las suyas
    supabase.from('citas').select('id').eq('tipo', 'mentoria').eq('user_id', user.id).neq('estado', 'cancelada'),
    supabase.from('lesson_files').select('id', { count: 'exact', head: true }).eq('is_resource', true),
    // Por dónde va en cada vídeo (migración 0007; sin ella llega vacío y no pasa nada)
    supabase.from('lesson_watch').select('lesson_id, seconds, duration_secs').eq('user_id', user.id),
  ])

  // % visto de cada clase empezada y sin terminar
  const viendo = new Map<string, number>()
  for (const a of avances ?? []) {
    if (a.duration_secs) viendo.set(a.lesson_id, Math.min(99, Math.round((a.seconds / a.duration_secs) * 100)))
  }

  const completadas = new Set((vistas ?? []).map((v) => v.lesson_id))
  const lista = (modulos ?? []) as Modulo[]
  const todas = lista.flatMap((m) => (m.lessons ?? []).map((l) => ({ ...l, modulo: m })))
  const total = todas.length
  const hechas = todas.filter((l) => completadas.has(l.id)).length
  const pct = total ? Math.round((hechas / total) * 100) : 0

  // La siguiente clase sin ver, que es por donde el alumno quiere seguir
  const siguiente = todas.find((l) => !completadas.has(l.id)) ?? null
  const empezado = hechas > 0
  const nombre = (perfil?.full_name ?? '').trim().split(' ')[0]
  const mentoriasRestantes = Math.max(0, 3 - (reservas?.length ?? 0))

  return (
    <>
      <Cabecera esAdmin={esAdmin} />

      {/* Fondo del campus: los Urus en el concesionario, quieto y muy oscurecido */}
      <div aria-hidden className="pointer-events-none fixed inset-0 -z-10">
        <Image src="/marca/urus.jpg" alt="" fill sizes="100vw" className="object-cover object-center opacity-30" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(10,10,10,.55)_0%,rgba(10,10,10,.82)_45%,rgba(10,10,10,.95)_100%)]" />
      </div>

      <main className="relative mx-auto max-w-6xl px-5 py-9 sm:py-12">
        {esAdmin && (
          <p className="mb-6 flex flex-wrap items-center gap-x-3 gap-y-2 rounded-xl border border-gold/35 bg-gold/8 px-5 py-3.5 text-[13.5px]">
            <span className="font-bold text-gold">Vista de alumno</span>
            <span className="text-white/60">Estás viendo el campus como lo ve quien compra el curso.</span>
            <Link href="/admin" className="font-semibold text-gold underline underline-offset-4">
              Volver al panel
            </Link>
          </p>
        )}

        {/* ── Bienvenida y continuación ── */}
        <section className="overflow-hidden rounded-3xl border border-white/12 bg-gradient-to-br from-gold/14 via-ink-3/85 to-ink-3/85 p-7 backdrop-blur-md sm:p-9">
          <p className="text-[11px] font-bold uppercase tracking-[.2em] text-gold">
            {empezado ? 'Sigue donde lo dejaste' : 'Tu formación'}
          </p>
          <h1 className="mt-3 text-[clamp(24px,4.6vw,38px)] font-black leading-[1.06] tracking-[-.035em]">
            Bienvenido, {nombre || 'alumno'}.
            <span className="mt-2 block">
              {empezado
                ? <>Vas por el <span className="text-gold">{pct}%</span> del curso</>
                : <>Empieza por el <span className="text-gold">principio</span></>}
            </span>
          </h1>

          {siguiente ? (
            <div className="mt-7 flex flex-wrap items-center gap-4">
              <Link
                href={`/clase/${siguiente.code}`}
                className="inline-flex items-center gap-3 rounded-full bg-gradient-to-b from-gold-soft to-gold px-7 py-4 text-[14.5px] font-extrabold uppercase tracking-wide text-ink shadow-[0_18px_40px_-16px_rgba(197,165,114,.7)] transition hover:-translate-y-0.5"
              >
                <span aria-hidden>▶</span>
                {empezado ? 'Continuar' : 'Empezar el curso'}
              </Link>
              <div className="min-w-0">
                <p className="text-[11px] font-bold uppercase tracking-wider text-white/40">
                  Clase {siguiente.code}
                </p>
                <p className="truncate text-[15px] font-semibold">{siguiente.title}</p>
              </div>
            </div>
          ) : (
            <div className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-4 rounded-2xl border border-gold/45 bg-gold/10 px-6 py-5">
              <span aria-hidden className="grid h-12 w-12 flex-none place-items-center rounded-full bg-gold text-2xl text-ink">🏆</span>
              <div className="min-w-0 flex-1">
                <p className="text-[17px] font-extrabold tracking-[-.02em]">¡Enhorabuena! Has completado la formación</p>
                <p className="mt-1 text-sm text-white/60">Has visto las {total} clases. Tu diploma ya está listo.</p>
              </div>
              <Link href="/diploma" className="rounded-full bg-gradient-to-b from-gold-soft to-gold px-6 py-3 text-[13.5px] font-extrabold uppercase tracking-wide text-ink">
                Descargar mi diploma
              </Link>
            </div>
          )}

          {/* Avance */}
          <div className="mt-8 max-w-lg">
            <div className="flex items-baseline justify-between text-sm">
              <span className="text-white/55">Tu avance</span>
              <span className="font-bold tabular-nums">{hechas} de {total} clases</span>
            </div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/10">
              <div className="h-full rounded-full bg-gradient-to-r from-gold-soft to-gold transition-[width] duration-500" style={{ width: `${pct}%` }} />
            </div>
          </div>
        </section>

        {/* ── Accesos rápidos ── */}
        <div className="mt-4 grid gap-3.5 sm:grid-cols-3">
          <Link href="/mentorias" className="rounded-2xl border border-white/12 bg-ink-3/85 p-5 backdrop-blur-md transition hover:border-gold/40">
            <p className="text-[11px] font-bold uppercase tracking-[.14em] text-gold">Bonus</p>
            <p className="mt-1.5 text-[16px] font-extrabold tracking-[-.02em]">Mentorías 1 a 1</p>
            <p className="mt-1 text-sm text-white/45">
              {mentoriasRestantes > 0
                ? `Te quedan ${mentoriasRestantes} de 3 llamadas`
                : 'Has usado tus tres llamadas'}
            </p>
          </Link>
          <Link href="/recursos" className="rounded-2xl border border-white/12 bg-ink-3/85 p-5 backdrop-blur-md transition hover:border-gold/40">
            <p className="text-[11px] font-bold uppercase tracking-[.14em] text-gold">Descargables</p>
            <p className="mt-1.5 text-[16px] font-extrabold tracking-[-.02em]">Guías, recursos y plantillas</p>
            <p className="mt-1 text-sm text-white/45">
              {(recursos as unknown as { count?: number })?.count
                ? `${(recursos as unknown as { count: number }).count} documentos listos`
                : 'Todo el material del curso'}
            </p>
          </Link>
          <Link href="/dudas" className="rounded-2xl border border-white/12 bg-ink-3/85 p-5 backdrop-blur-md transition hover:border-gold/40">
            <p className="text-[11px] font-bold uppercase tracking-[.14em] text-gold">Soporte</p>
            <p className="mt-1.5 text-[16px] font-extrabold tracking-[-.02em]">Resuelve tus dudas</p>
            <p className="mt-1 text-sm text-white/45">Canal directo con nosotros</p>
          </Link>
        </div>

        {/* ── Temario ── */}
        <h2 className="mt-12 text-[11px] font-bold uppercase tracking-[.18em] text-white/60">
          El temario completo
        </h2>

        <div className="mt-4 space-y-3.5">
          {lista.map((m) => {
            const hechasMod = (m.lessons ?? []).filter((l) => completadas.has(l.id)).length
            const completo = (m.lessons?.length ?? 0) > 0 && hechasMod === m.lessons.length
            return (
              <section key={m.id} className="overflow-hidden rounded-2xl border border-white/12 bg-ink-3/85 backdrop-blur-md">
                <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 px-5 pt-5 sm:px-6">
                  <span className="text-[11px] font-extrabold uppercase tracking-[.14em] text-gold">
                    Módulo {m.code}
                  </span>
                  <h3 className="text-[17px] font-extrabold tracking-[-.02em] sm:text-[19px]">{m.title}</h3>
                  {completo ? (
                    <span className="rounded-full bg-emerald-500/15 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-300">
                      Completado
                    </span>
                  ) : hechasMod > 0 && (
                    <span className="rounded-full bg-white/8 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white/50 tabular-nums">
                      {hechasMod}/{m.lessons.length}
                    </span>
                  )}
                </div>
                {m.description && <p className="px-5 pt-1.5 text-sm text-white/45 sm:px-6">{m.description}</p>}

                <ul className="mt-4 divide-y divide-white/6 border-t border-white/6">
                  {(m.lessons ?? []).map((l) => {
                    const vista = completadas.has(l.id)
                    return (
                      <li key={l.id}>
                        <Link href={`/clase/${l.code}`} className="flex items-center gap-4 px-5 py-3.5 transition hover:bg-white/4 sm:px-6">
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
                          {!vista && viendo.has(l.id) ? (
                            <span className="flex flex-none items-center gap-2" title={`Has visto el ${viendo.get(l.id)}%`}>
                              <span className="hidden text-[10px] font-bold uppercase tracking-wider text-gold sm:inline">Viendo</span>
                              <span className="h-1.5 w-16 overflow-hidden rounded-full bg-white/10">
                                <span className="block h-full rounded-full bg-gold" style={{ width: `${viendo.get(l.id)}%` }} />
                              </span>
                            </span>
                          ) : !l.video_id && (
                            <span className="hidden flex-none text-[10px] font-bold uppercase tracking-wider text-white/25 sm:inline">
                              Próximamente
                            </span>
                          )}
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
