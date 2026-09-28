import Link from 'next/link'
import { createAdminClient } from '@/lib/supabase/server'
import { cargarAgenda, type Franja, type Tipo } from '@/lib/agenda'
import { ahoraMs, claveDia, diaLargo, hora, nombreZona, ZONA_ARGA } from '@/lib/fechas'
import { borrarExcepcion, cancelarCitaAdmin, marcarCitaHecha } from './actions'
import { HorarioSemanal, NuevaExcepcion, Reglas, VistaPrevia } from './configuracion'

export const metadata = { title: 'Agenda' }
export const dynamic = 'force-dynamic'

type Cita = {
  id: string; tipo: Tipo; empieza: string; termina: string; estado: string
  nombre: string; email: string; telefono: string | null; mensaje: string | null; zona_cliente: string
}
type Excepcion = { id: string; tipo: Tipo; fecha: string; desde: string | null; hasta: string | null; motivo: string | null }

const ETIQUETA = { llamada: 'Llamada', mentoria: 'Mentoría' }

export default async function AdminAgenda({ searchParams }: { searchParams: Promise<{ tipo?: string }> }) {
  const { tipo: pedido } = await searchParams
  const tipo: Tipo = pedido === 'mentoria' ? 'mentoria' : 'llamada'
  const admin = createAdminClient()
  const ahora = ahoraMs()
  const hace3Dias = new Date(ahora - 3 * 86_400_000).toISOString()

  const [agenda, { data: horario }, { data: excepciones, error: sinTablas }, { data: citasData }] = await Promise.all([
    cargarAgenda(tipo),
    admin.from('agenda_horario').select('id, dia_semana, desde, hasta').eq('tipo', tipo).order('dia_semana').order('desde'),
    admin.from('agenda_excepciones').select('*').gte('fecha', new Date(ahora).toISOString().slice(0, 10)).order('fecha'),
    admin.from('citas').select('*').gte('empieza', hace3Dias).neq('estado', 'cancelada').order('empieza'),
  ])

  const citas = (citasData ?? []) as Cita[]
  const porDia = new Map<string, Cita[]>()
  for (const c of citas) porDia.set(claveDia(c.empieza), [...(porDia.get(claveDia(c.empieza)) ?? []), c])

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-[-.03em]">Agenda</h1>
          <p className="mt-1.5 max-w-[70ch] text-sm text-white/50">
            Las llamadas de la web y las mentorías de los alumnos comparten vuestro tiempo: si alguien coge una hora
            en una agenda, desaparece también de la otra. Os llega un correo con cada reserva o cancelación.
          </p>
        </div>
      </div>

      {sinTablas && (
        <p className="mt-6 rounded-xl border border-gold/40 bg-gold/8 px-5 py-4 text-sm text-gold">
          Falta aplicar la migración 0008 (agenda) en la base de datos. Hasta entonces la agenda no guarda nada.
        </p>
      )}

      {/* ── Citas ── */}
      <section className="mt-8">
        <h2 className="text-[11px] font-bold uppercase tracking-[.16em] text-white/45">Próximas citas</h2>
        {citas.length === 0 ? (
          <p className="mt-3 rounded-xl border border-white/10 bg-ink-3 px-5 py-5 text-sm text-white/45">No hay citas reservadas.</p>
        ) : (
          <div className="mt-3 space-y-5">
            {[...porDia.entries()].map(([dia, lista]) => (
              <div key={dia}>
                <p className="text-[13px] font-bold first-letter:uppercase text-white/60">{diaLargo(dia)}</p>
                <ul className="mt-2 space-y-2">
                  {lista.map((c) => {
                    const pasada = new Date(c.termina).getTime() < ahora
                    return (
                      <li key={c.id} className="flex flex-wrap items-center gap-x-5 gap-y-2 rounded-xl border border-white/12 bg-ink-3 px-5 py-4">
                        <span className="w-24 flex-none text-[15px] font-extrabold tabular-nums">{hora(c.empieza)}–{hora(c.termina)}</span>
                        <span className={`flex-none rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${c.tipo === 'llamada' ? 'bg-gold/15 text-gold' : 'bg-white/10 text-white/60'}`}>
                          {ETIQUETA[c.tipo]}
                        </span>
                        <div className="min-w-0 flex-1 text-[14px]">
                          <p className="font-semibold">{c.nombre}</p>
                          <p className="text-[13px] text-white/50">
                            {c.email}{c.telefono && <> · <a href={`tel:${c.telefono}`} className="underline underline-offset-2">{c.telefono}</a></>}
                            {c.zona_cliente !== ZONA_ARGA && <> · su hora: {hora(c.empieza, c.zona_cliente)} ({nombreZona(c.zona_cliente)})</>}
                          </p>
                          {c.mensaje && <p className="mt-1 text-[13px] text-white/45">«{c.mensaje}»</p>}
                        </div>
                        {c.estado === 'hecha' ? (
                          <span className="rounded-full bg-white/8 px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-white/45">Hecha</span>
                        ) : (
                          <div className="flex gap-2">
                            {pasada ? (
                              <form action={marcarCitaHecha}>
                                <input type="hidden" name="id" value={c.id} />
                                <button className="rounded-full border border-white/18 px-4 py-2 text-[12.5px] font-semibold text-white/70 hover:border-gold/50">Marcar hecha</button>
                              </form>
                            ) : (
                              <form action={cancelarCitaAdmin}>
                                <input type="hidden" name="id" value={c.id} />
                                <button className="rounded-full border border-white/18 px-4 py-2 text-[12.5px] font-semibold text-white/55 hover:border-red-400/50 hover:text-red-200"
                                        title="Se cancela y el cliente recibe un correo">Cancelar</button>
                              </form>
                            )}
                          </div>
                        )}
                      </li>
                    )
                  })}
                </ul>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ── Configuración de cada agenda ── */}
      <div className="mt-12 flex flex-wrap items-center gap-2 border-b border-white/10 pb-3">
        <span className="mr-2 text-[11px] font-bold uppercase tracking-[.16em] text-white/45">Configurar</span>
        {(['llamada', 'mentoria'] as const).map((t) => (
          <Link key={t} href={`/admin/mentorias?tipo=${t}`}
                className={`rounded-full px-4 py-2 text-[13px] font-bold ${t === tipo ? 'bg-gold text-ink' : 'border border-white/14 text-white/60 hover:text-white'}`}>
            {t === 'llamada' ? 'Llamadas (web)' : 'Mentorías (alumnos)'}
          </Link>
        ))}
      </div>

      <div className="mt-6 grid gap-8 xl:grid-cols-2">
        <section>
          <h2 className="text-[15px] font-extrabold">Horario semanal</h2>
          <p className="mt-1 text-[13px] text-white/45">Cuándo se puede reservar {tipo === 'llamada' ? 'una llamada' : 'una mentoría'}, semana a semana.</p>
          <div className="mt-4"><HorarioSemanal key={tipo} tipo={tipo} inicial={(horario ?? []) as Franja[]} /></div>
        </section>
        <section>
          <h2 className="text-[15px] font-extrabold">Reglas</h2>
          <p className="mt-1 text-[13px] text-white/45">Duración, descansos, antelación y límites.</p>
          <div className="mt-4"><Reglas key={tipo} ajustes={agenda.ajustes} /></div>
        </section>
      </div>

      <section className="mt-10">
        <h2 className="text-[15px] font-extrabold">Días bloqueados y horarios especiales</h2>
        <p className="mt-1 text-[13px] text-white/45">Vacaciones, festivos o un día que atendéis en otro horario.</p>
        <div className="mt-4"><NuevaExcepcion tipo={tipo} /></div>
        {(excepciones?.length ?? 0) > 0 && (
          <ul className="mt-3 flex flex-wrap gap-2">
            {(excepciones as Excepcion[]).map((e) => (
              <li key={e.id} className="flex items-center gap-2.5 rounded-xl border border-white/12 bg-ink-3 px-4 py-2.5 text-[13px]">
                <span className="font-semibold first-letter:uppercase">{diaLargo(e.fecha)}</span>
                <span className="text-white/50">{e.desde ? `solo ${e.desde.slice(0, 5)}–${e.hasta!.slice(0, 5)}` : 'cerrado'}</span>
                <span className="text-white/35">· {ETIQUETA[e.tipo]}{e.motivo ? ` · ${e.motivo}` : ''}</span>
                <form action={borrarExcepcion}>
                  <input type="hidden" name="id" value={e.id} />
                  <button className="text-white/35 hover:text-red-300" aria-label="Quitar">×</button>
                </form>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-10">
        <h2 className="text-[15px] font-extrabold">Así lo ve el cliente ahora mismo</h2>
        <p className="mt-1 text-[13px] text-white/45">{agenda.huecos.length} huecos libres en los próximos {agenda.diasVista} días.</p>
        <div className="mt-4">
          <VistaPrevia datos={{ huecos: agenda.huecos, duracionMin: agenda.duracionMin, diasVista: agenda.diasVista, zonaArga: agenda.zonaArga, activa: agenda.activa }} />
        </div>
      </section>
    </>
  )
}
