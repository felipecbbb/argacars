import Cabecera from '@/components/cabecera'
import { exigirAcceso } from '@/lib/sesion'

export const dynamic = 'force-dynamic'

export default async function Recursos() {
  const { supabase, esAdmin } = await exigirAcceso()

  const { data: ficheros } = await supabase
    .from('lesson_files')
    .select('id, title, size_bytes')
    .eq('is_resource', true)
    .order('position')

  return (
    <>
      <Cabecera esAdmin={esAdmin} />
      <main className="mx-auto max-w-4xl px-5 py-9 sm:py-12">
        <p className="text-[11px] font-bold uppercase tracking-[.2em] text-gold">Zona de recursos</p>
        <h1 className="mt-3 text-[clamp(24px,4.6vw,36px)] font-black leading-tight tracking-[-.035em]">
          Guías y plantillas <span className="text-gold">para cada paso</span>
        </h1>
        <p className="mt-3 max-w-prose text-[15px] text-white/55">
          Todo el material descargable del curso, junto. Los mismos documentos aparecen también
          dentro de la clase a la que pertenecen.
        </p>

        {(ficheros?.length ?? 0) === 0 ? (
          <div className="mt-9 rounded-2xl border border-dashed border-gold/35 bg-ink-3 p-8 text-center">
            <p className="text-[11px] font-bold uppercase tracking-[.16em] text-gold">Pendiente</p>
            <p className="mt-2 text-[15px] font-semibold">Todavía no hay recursos subidos</p>
            <p className="mt-1.5 text-sm text-white/45">Se suben desde el panel y aparecen aquí.</p>
          </div>
        ) : (
          <ul className="mt-8 space-y-2.5">
            {ficheros!.map((f) => (
              <li key={f.id}>
                <a
                  href={`/api/descargar/${f.id}`}
                  className="flex items-center gap-4 rounded-xl border border-white/10 bg-ink-3 px-5 py-4 transition hover:border-gold/40"
                >
                  <span className="text-xs font-extrabold text-gold" aria-hidden>PDF</span>
                  <span className="flex-1 text-[15px]">{f.title}</span>
                  <span className="text-white/30" aria-hidden>↓</span>
                </a>
              </li>
            ))}
          </ul>
        )}
      </main>
    </>
  )
}
