import Image from 'next/image'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import Cabecera from '@/components/cabecera'
import { exigirAcceso } from '@/lib/sesion'
import Imprimir from './imprimir'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Tu diploma' }

const fmt = new Intl.DateTimeFormat('es-ES', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Europe/Madrid' })

/**
 * Diploma de la formación. Solo se abre con todas las clases vistas.
 * Se descarga con «Imprimir → Guardar como PDF»: la hoja de estilos de
 * impresión deja solo el diploma, en A4 apaisado.
 */
export default async function Diploma() {
  const { supabase, perfil, esAdmin, user } = await exigirAcceso()

  const [{ count: total }, { data: vistas }] = await Promise.all([
    supabase.from('lessons').select('id', { count: 'exact', head: true }).eq('published', true),
    supabase.from('lesson_progress').select('completed_at').eq('user_id', user.id).order('completed_at', { ascending: false }),
  ])

  const hechas = vistas?.length ?? 0
  if (!esAdmin && (!total || hechas < total)) redirect('/campus')

  const nombre = perfil?.full_name?.trim()
  const fecha = vistas?.[0]?.completed_at ? new Date(vistas[0].completed_at) : new Date()

  return (
    <>
      <style>{`@media print {
        @page { size: A4 landscape; margin: 0 }
        body { background: #fff !important }
        .no-imprimir { display: none !important }
        .diploma { box-shadow: none !important; border-radius: 0 !important; width: 297mm !important; height: 210mm !important; max-width: none !important; margin: 0 !important }
      }`}</style>

      <div className="no-imprimir"><Cabecera esAdmin={esAdmin} /></div>

      <main className="mx-auto max-w-5xl px-5 py-9 sm:py-12 print:p-0">
        <div className="no-imprimir mb-7 flex flex-wrap items-center justify-between gap-4">
          <div>
            <Link href="/campus" className="text-[13px] text-white/45 hover:text-white">← Volver al campus</Link>
            <h1 className="mt-3 text-[clamp(22px,4vw,30px)] font-black tracking-[-.03em]">Tu diploma</h1>
            {!nombre && (
              <p className="mt-2 text-sm text-gold">
                Pon tu nombre completo en <Link href="/perfil" className="underline underline-offset-4">Mi cuenta</Link> para que aparezca en el diploma.
              </p>
            )}
          </div>
          <Imprimir />
        </div>

        <article className="diploma relative mx-auto aspect-[297/210] w-full overflow-hidden rounded-2xl bg-[#0a0a0a] text-white shadow-2xl [print-color-adjust:exact] [-webkit-print-color-adjust:exact]">
          <div aria-hidden className="absolute inset-[3%] rounded-xl border border-[#c5a572]/60" />
          <div aria-hidden className="absolute inset-[4.2%] rounded-lg border border-[#c5a572]/25" />

          <div className="relative flex h-full flex-col items-center justify-center px-[10%] text-center">
            <Image src="/marca/logo-arga.png" alt="ARGA Premium Cars" width={180} height={45} className="h-auto w-[18%]" />
            <p className="mt-[3.5%] text-[clamp(8px,1.3vw,13px)] font-bold uppercase tracking-[.3em] text-[#c5a572]">Diploma de formación</p>
            <p className="mt-[3%] text-[clamp(9px,1.5vw,15px)] text-white/60">Se otorga a</p>
            <p className="mt-[1.2%] text-[clamp(20px,4.4vw,46px)] font-black leading-tight tracking-[-.03em]">
              {nombre || user.email}
            </p>
            <div aria-hidden className="mt-[2%] h-px w-[40%] bg-[#c5a572]/60" />
            <p className="mt-[2.5%] max-w-[60ch] text-[clamp(9px,1.5vw,15px)] leading-relaxed text-white/70">
              por haber completado la <strong className="text-white">Formación de importación de vehículos</strong> de
              ARGA Premium Cars: búsqueda y selección, comprobaciones, negociación y compra, logística y transporte,
              matriculación en España, fiscalidad y caso práctico.
            </p>

            <div className="mt-[5%] grid w-full grid-cols-3 items-end gap-[4%] text-[clamp(8px,1.2vw,12px)]">
              <div>
                <p className="font-bold">Alejandro</p>
                <div className="mx-auto mt-1 h-px w-3/4 bg-white/30" />
                <p className="mt-1 text-white/50">ARGA Premium Cars</p>
              </div>
              <div>
                <p className="font-bold capitalize">{fmt.format(fecha)}</p>
                <div className="mx-auto mt-1 h-px w-3/4 bg-white/30" />
                <p className="mt-1 text-white/50">Fecha</p>
              </div>
              <div>
                <p className="font-bold">Rodrigo</p>
                <div className="mx-auto mt-1 h-px w-3/4 bg-white/30" />
                <p className="mt-1 text-white/50">ARGA Premium Cars</p>
              </div>
            </div>
          </div>
        </article>
      </main>
    </>
  )
}
