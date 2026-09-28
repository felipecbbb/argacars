import Cabecera from '@/components/cabecera'
import { exigirAcceso } from '@/lib/sesion'
import BotonDescargar from '@/components/boton-descargar'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Guías, recursos y plantillas' }

type Fichero = { id: string; title: string; kind?: string | null }

export default async function Recursos() {
  const { supabase, esAdmin } = await exigirAcceso()

  // select('*') y no la lista de columnas: así la página no se cae si la
  // migración 0005 (columna kind) aún no está aplicada. Sin ella, todo es «recurso».
  const { data } = await supabase
    .from('lesson_files')
    .select('*')
    .eq('is_resource', true)
    .order('position')

  const ficheros = (data ?? []) as Fichero[]
  const plantillas = ficheros.filter((f) => f.kind === 'plantilla')
  const recursos = ficheros.filter((f) => f.kind !== 'plantilla')

  return (
    <>
      <Cabecera esAdmin={esAdmin} />
      <main className="mx-auto max-w-4xl px-5 py-9 sm:py-12">
        <p className="text-[11px] font-bold uppercase tracking-[.2em] text-gold">Descargables</p>
        <h1 className="mt-3 text-[clamp(24px,4.6vw,36px)] font-black leading-tight tracking-[-.035em]">
          Guías, recursos y <span className="text-gold">plantillas</span>
        </h1>
        <p className="mt-3 max-w-prose text-[15px] text-white/55">
          Todo el material descargable del curso, junto. Las guías también aparecen dentro de la
          clase a la que pertenecen.
        </p>

        <Bloque titulo="Guías y recursos" vacio="Todavía no hay guías subidas" lista={recursos} />
        <Bloque titulo="Plantillas" vacio="Las plantillas se están preparando"
                detalle="Contratos y autorizaciones listos para usar en tus operaciones." lista={plantillas} />
      </main>
    </>
  )
}

function Bloque({ titulo, detalle, vacio, lista }: { titulo: string; detalle?: string; vacio: string; lista: Fichero[] }) {
  return (
    <section className="mt-11">
      <div className="flex items-baseline justify-between gap-4 border-b border-white/10 pb-3">
        <h2 className="text-[18px] font-extrabold tracking-[-.02em]">{titulo}</h2>
        {lista.length > 0 && <span className="text-[12px] font-semibold text-white/40 tabular-nums">{lista.length}</span>}
      </div>
      {detalle && <p className="mt-3 text-sm text-white/50">{detalle}</p>}

      {lista.length === 0 ? (
        <div className="mt-5 rounded-2xl border border-dashed border-gold/35 bg-ink-3 p-7 text-center">
          <p className="text-[11px] font-bold uppercase tracking-[.16em] text-gold">Pendiente</p>
          <p className="mt-2 text-[15px] font-semibold">{vacio}</p>
          <p className="mt-1.5 text-sm text-white/45">Aparecerán aquí en cuanto estén disponibles.</p>
        </div>
      ) : (
        <ul className="mt-5 space-y-2.5">
          {lista.map((f) => (
            <li key={f.id}>
              <a
                href={`/api/descargar/${f.id}`}
                className="group flex items-center gap-4 rounded-xl border border-white/10 bg-ink-3 px-5 py-3.5 transition hover:border-gold/40"
              >
                <span className="text-[11px] font-extrabold text-white/40" aria-hidden>PDF</span>
                <span className="flex-1 text-[15px]">{f.title}</span>
                <BotonDescargar />
              </a>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
