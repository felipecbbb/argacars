import Link from 'next/link'
import { notFound } from 'next/navigation'
import Cabecera from '@/components/cabecera'
import { exigirAcceso } from '@/lib/sesion'
import MarcarVista from './marcar-vista'
import Reproductor from './reproductor'
import TextoConEnlaces from '@/components/texto-con-enlaces'
import BotonDescargar from '@/components/boton-descargar'

export const dynamic = 'force-dynamic'

export default async function Clase({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params
  const { supabase, esAdmin, user } = await exigirAcceso()

  const { data: leccion } = await supabase
    .from('lessons')
    .select('id, code, title, description, video_id, position, module_id, modules(code, title, position)')
    .eq('code', decodeURIComponent(code))
    .maybeSingle()

  if (!leccion) notFound()

  const [{ data: adjuntos }, { data: vista }, { data: hermanas }, { data: avance }] = await Promise.all([
    supabase.from('lesson_files').select('id, title, storage_path, size_bytes')
      .eq('lesson_id', leccion.id).order('position'),
    supabase.from('lesson_progress').select('lesson_id')
      .eq('user_id', user.id).eq('lesson_id', leccion.id).maybeSingle(),
    supabase.from('lessons').select('code, title, position').eq('module_id', leccion.module_id).order('position'),
    // Por dónde iba en el vídeo (tabla de la migración 0007; si aún no existe, se empieza de cero)
    supabase.from('lesson_watch').select('seconds, duration_secs')
      .eq('user_id', user.id).eq('lesson_id', leccion.id).maybeSingle(),
  ])
  // Si ya lo terminó, vuelve a empezar desde el principio
  const retomar = avance?.duration_secs && avance.seconds < avance.duration_secs * 0.9 ? avance.seconds : 0

  const idx = (hermanas ?? []).findIndex((l) => l.code === leccion.code)
  const anterior = idx > 0 ? hermanas![idx - 1] : null
  const siguiente = idx >= 0 && idx < (hermanas?.length ?? 0) - 1 ? hermanas![idx + 1] : null
  const modulo = leccion.modules as unknown as { code: string; title: string }

  return (
    <>
      <Cabecera esAdmin={esAdmin} />

      <main className="mx-auto max-w-4xl px-5 py-8 sm:py-11">
        <Link href="/campus" className="text-[13px] text-white/45 hover:text-white">← Todos los módulos</Link>

        <p className="mt-5 text-[11px] font-bold uppercase tracking-[.18em] text-gold">
          Módulo {modulo?.code} · {modulo?.title}
        </p>
        <h1 className="mt-2.5 text-[clamp(22px,4vw,32px)] font-black leading-tight tracking-[-.03em]">
          <span className="text-white/35 tabular-nums">{leccion.code}</span> {leccion.title}
        </h1>

        <div className="mt-6">
          <Reproductor videoId={leccion.video_id} lessonId={leccion.id} inicio={retomar} yaVista={Boolean(vista)} />
        </div>

        <MarcarVista lessonId={leccion.id} yaVista={Boolean(vista)} />

        {leccion.description && (
          <section className="mt-8 rounded-2xl border border-white/10 bg-ink-3 p-6">
            <h2 className="text-[11px] font-bold uppercase tracking-[.16em] text-white/45">Sobre esta clase</h2>
            <TextoConEnlaces texto={leccion.description} className="mt-3 text-[15px] leading-relaxed text-white/72" />
          </section>
        )}

        {(adjuntos?.length ?? 0) > 0 && (
          <section className="mt-5 rounded-2xl border border-white/10 bg-ink-3 p-6">
            <h2 className="text-[11px] font-bold uppercase tracking-[.16em] text-white/45">
              {adjuntos!.length === 1 ? 'La guía de esta clase' : 'Las guías de esta clase'}
            </h2>
            <ul className="mt-3 space-y-2">
              {adjuntos!.map((a) => (
                <li key={a.id}>
                  <a
                    href={`/api/descargar/${a.id}`}
                    className="group flex items-center gap-3 rounded-xl border border-white/10 bg-ink px-4 py-3 text-[14.5px] transition hover:border-gold/40"
                  >
                    <span className="text-[11px] font-extrabold text-white/40" aria-hidden>PDF</span>
                    <span className="flex-1">{a.title}</span>
                    <BotonDescargar />
                  </a>
                </li>
              ))}
            </ul>
          </section>
        )}

        <nav className="mt-9 flex items-center justify-between gap-4 border-t border-white/8 pt-6 text-sm">
          {anterior ? (
            <Link href={`/clase/${anterior.code}`} className="text-white/60 hover:text-white">
              ← {anterior.code} {anterior.title}
            </Link>
          ) : <span />}
          {siguiente && (
            <Link href={`/clase/${siguiente.code}`} className="text-right font-semibold text-gold hover:underline">
              {siguiente.code} {siguiente.title} →
            </Link>
          )}
        </nav>
      </main>
    </>
  )
}
