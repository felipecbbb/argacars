import { notFound } from 'next/navigation'
import Header from '@/components/header'
import Footer from '@/components/footer'
import { createAdminClient } from '@/lib/supabase/server'
import { cargarAgenda, type Tipo } from '@/lib/agenda'
import { ahoraMs, fechaHora, hora, nombreZona } from '@/lib/fechas'
import Gestion from './gestion'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Tu cita', robots: { index: false } }

/** Página del enlace del correo: ver la cita, cambiarla de hora o cancelarla. Sin cuenta. */
export default async function Cita({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params
  if (!/^[0-9a-f-]{36}$/i.test(token)) notFound()

  const { data: c } = await createAdminClient().from('citas')
    .select('tipo, empieza, termina, estado, nombre, zona_cliente').eq('token', token).maybeSingle()
  if (!c) notFound()

  const tipo = c.tipo as Tipo
  const agenda = await cargarAgenda(tipo)
  const viva = c.estado === 'reservada' && new Date(c.empieza).getTime() > ahoraMs()
  const volver = tipo === 'llamada' ? '/#acceso' : '/mentorias'
  const f = fechaHora(c.empieza, c.zona_cliente)

  return (
    <>
      <Header />
      <main className="mx-auto max-w-3xl px-5 pt-28 pb-20 sm:pt-36">
        <p className="text-[11px] font-bold uppercase tracking-[.2em] text-gold">
          {tipo === 'llamada' ? 'Tu llamada con ARGA' : 'Tu mentoría 1 a 1'}
        </p>
        <h1 className="mt-3 text-[clamp(24px,4.6vw,36px)] font-black leading-tight tracking-[-.035em]">
          {`${f[0].toUpperCase()}${f.slice(1)}`}–{hora(c.termina, c.zona_cliente)}
        </h1>
        <p className="mt-2 text-[14px] text-white/50">{nombreZona(c.zona_cliente)} · a nombre de {c.nombre}</p>

        {c.estado === 'cancelada' && (
          <p className="mt-8 rounded-xl border border-white/12 bg-ink-3 px-5 py-4 text-sm text-white/60">Esta cita está cancelada.</p>
        )}
        {c.estado !== 'cancelada' && !viva && (
          <p className="mt-8 rounded-xl border border-white/12 bg-ink-3 px-5 py-4 text-sm text-white/60">Esta cita ya ha pasado.</p>
        )}
        {viva && (
          <Gestion token={token} volver={volver}
                   datos={{ huecos: agenda.huecos, duracionMin: agenda.duracionMin, diasVista: agenda.diasVista, zonaArga: agenda.zonaArga, activa: agenda.activa }} />
        )}
      </main>
      <Footer />
    </>
  )
}
