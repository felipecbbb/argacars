import Link from 'next/link'
import Cabecera from '@/components/cabecera'
import { exigirAcceso } from '@/lib/sesion'
import { cargarAgenda } from '@/lib/agenda'
import { ahoraMs, fechaHora, hora, ZONA_ARGA } from '@/lib/fechas'
import { MENTORIAS_INCLUIDAS } from '@/lib/mentorias'
import { createAdminClient } from '@/lib/supabase/server'
import Reserva from './reserva'
import { anularMentoria } from './actions'

export const dynamic = 'force-dynamic'

type Cita = { id: string; empieza: string; termina: string; estado: string; mensaje: string | null; zona_cliente: string; token: string }

export default async function Mentorias() {
  const { esAdmin, user } = await exigirAcceso()

  const [agenda, { data }] = await Promise.all([
    cargarAgenda('mentoria'),
    createAdminClient().from('citas').select('id, empieza, termina, estado, mensaje, zona_cliente, token')
      .eq('tipo', 'mentoria').eq('user_id', user.id).neq('estado', 'cancelada').order('empieza'),
  ])
  const mias = (data ?? []) as Cita[]
  const restantes = Math.max(0, MENTORIAS_INCLUIDAS - mias.length)
  const ahora = ahoraMs()

  return (
    <>
      <Cabecera esAdmin={esAdmin} />
      <main className="mx-auto max-w-4xl px-5 py-9 sm:py-12">
        <p className="text-[11px] font-bold uppercase tracking-[.2em] text-gold">Mentorías 1 a 1</p>
        <h1 className="mt-3 text-[clamp(24px,4.6vw,36px)] font-black leading-tight tracking-[-.035em]">
          {agenda.duracionMin} minutos de llamada <span className="text-gold">privada con nosotros</span>
        </h1>
        <p className="mt-3 max-w-prose text-[15px] text-white/55">
          Tienes tres incluidas con la formación y no caducan. Elige el día y la hora que te vengan bien: las horas salen en tu zona horaria.
        </p>

        <div className="mt-6 inline-flex items-center gap-3 rounded-full border border-gold/35 bg-gold/8 px-5 py-2.5">
          <span className="text-2xl font-black tabular-nums text-gold">{restantes}</span>
          <span className="text-sm text-white/70">{restantes === 1 ? 'mentoría disponible' : 'mentorías disponibles'} de {MENTORIAS_INCLUIDAS}</span>
        </div>

        {mias.length > 0 && (
          <section className="mt-9">
            <h2 className="text-[11px] font-bold uppercase tracking-[.16em] text-white/45">Tus mentorías</h2>
            <ul className="mt-3 space-y-2.5">
              {mias.map((c) => {
                const pasada = new Date(c.termina).getTime() < ahora
                return (
                  <li key={c.id} className="flex flex-wrap items-center gap-x-4 gap-y-2 rounded-xl border border-white/12 bg-ink-3 px-5 py-4">
                    <div className="flex-1">
                      <p className="text-[15px] font-bold first-letter:uppercase">{fechaHora(c.empieza, c.zona_cliente)}–{hora(c.termina, c.zona_cliente)}</p>
                      {c.zona_cliente !== ZONA_ARGA && <p className="text-xs text-white/40">Hora peninsular: {hora(c.empieza, ZONA_ARGA)}</p>}
                      {c.mensaje && <p className="mt-1.5 text-sm text-white/45">«{c.mensaje}»</p>}
                    </div>
                    {c.estado === 'hecha' || pasada ? (
                      <span className="rounded-full bg-white/8 px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-white/50">Hecha</span>
                    ) : (
                      <div className="flex gap-2">
                        <Link href={`/cita/${c.token}`} className="rounded-full border border-white/18 px-4 py-2 text-[13px] font-semibold text-white/70 hover:border-gold/50">Cambiar</Link>
                        <form action={anularMentoria}>
                          <input type="hidden" name="id" value={c.id} />
                          <button className="rounded-full border border-white/18 px-4 py-2 text-[13px] font-semibold text-white/60 hover:border-red-400/50 hover:text-red-200">Anular</button>
                        </form>
                      </div>
                    )}
                  </li>
                )
              })}
            </ul>
          </section>
        )}

        <section className="mt-10">
          <h2 className="text-[11px] font-bold uppercase tracking-[.16em] text-white/45">Reserva una mentoría</h2>
          {restantes === 0 ? (
            <p className="mt-4 rounded-xl border border-white/10 bg-ink-3 px-5 py-5 text-sm text-white/55">
              Ya has usado tus tres mentorías. Si necesitas otra llamada, escríbenos por el canal de la comunidad.
            </p>
          ) : (
            <Reserva datos={{ huecos: agenda.huecos, duracionMin: agenda.duracionMin, diasVista: agenda.diasVista, zonaArga: agenda.zonaArga, activa: agenda.activa }} />
          )}
        </section>
      </main>
    </>
  )
}
