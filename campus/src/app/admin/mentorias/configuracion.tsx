'use client'

import { useActionState, useState, useTransition } from 'react'
import Agenda, { type DatosCalendario } from '@/components/agenda'
import type { Ajustes, Franja, Tipo } from '@/lib/agenda'
import { anadirExcepcion, guardarAjustes, guardarHorario, type EstadoAdmin } from './actions'

const DIAS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']
const CAMPO = 'rounded-lg border border-white/12 bg-ink px-3 py-2 text-[13.5px] text-white'
const hhmm = (t: string) => t.slice(0, 5)

function Aviso({ e }: { e: EstadoAdmin }) {
  if (e.error) return <p role="alert" className="mt-3 text-sm text-red-300">{e.error}</p>
  if (e.ok) return <p className="mt-3 text-sm text-emerald-300">{e.ok}</p>
  return null
}

/** Horario semanal: cada día con sus franjas (mañana, tarde…), como en Calendly. */
export function HorarioSemanal({ tipo, inicial }: { tipo: Tipo; inicial: Franja[] }) {
  const [franjas, setFranjas] = useState(inicial.map((f) => ({ ...f, desde: hhmm(f.desde), hasta: hhmm(f.hasta) })))
  const [estado, setEstado] = useState<EstadoAdmin>({})
  const [pendiente, start] = useTransition()

  const delDia = (d: number) => franjas.map((f, i) => ({ ...f, i })).filter((f) => f.dia_semana === d)
  const cambiar = (i: number, k: 'desde' | 'hasta', v: string) => setFranjas((fs) => fs.map((f, j) => (j === i ? { ...f, [k]: v } : f)))
  const quitar = (i: number) => setFranjas((fs) => fs.filter((_, j) => j !== i))
  const anadir = (d: number) => {
    const ult = delDia(d).at(-1)
    setFranjas((fs) => [...fs, ult ? { dia_semana: d, desde: ult.hasta, hasta: ult.hasta < '20:00' ? '20:00' : '23:00' } : { dia_semana: d, desde: '10:00', hasta: '14:00' }])
  }
  const copiarATodos = (d: number) => {
    const modelo = delDia(d)
    setFranjas((fs) => [
      ...fs.filter((f) => f.dia_semana === d || f.dia_semana > 5),
      ...[1, 2, 3, 4, 5].filter((x) => x !== d).flatMap((x) => modelo.map((m) => ({ dia_semana: x, desde: m.desde, hasta: m.hasta }))),
    ])
  }

  return (
    <div>
      <ul className="divide-y divide-white/8 rounded-2xl border border-white/12 bg-ink-3">
        {DIAS.map((nombre, idx) => {
          const d = idx + 1
          const suyas = delDia(d)
          return (
            <li key={d} className="flex flex-wrap items-start gap-x-5 gap-y-2 px-5 py-3.5">
              <label className="flex w-32 flex-none items-center gap-2.5 pt-2 text-[14px] font-semibold">
                <input type="checkbox" checked={suyas.length > 0} className="h-4 w-4 accent-[#c5a572]"
                       onChange={(e) => (e.target.checked ? anadir(d) : setFranjas((fs) => fs.filter((f) => f.dia_semana !== d)))} />
                {nombre}
              </label>
              <div className="flex-1 space-y-2">
                {suyas.length === 0 && <p className="pt-2 text-[13.5px] text-white/35">No disponible</p>}
                {suyas.map((f) => (
                  <div key={f.i} className="flex flex-wrap items-center gap-2">
                    <input type="time" step={900} value={f.desde} onChange={(e) => cambiar(f.i, 'desde', e.target.value)} className={CAMPO} />
                    <span className="text-white/40">–</span>
                    <input type="time" step={900} value={f.hasta} onChange={(e) => cambiar(f.i, 'hasta', e.target.value)} className={CAMPO} />
                    <button type="button" onClick={() => quitar(f.i)} aria-label="Quitar franja" className="px-2 text-lg text-white/35 hover:text-red-300">×</button>
                  </div>
                ))}
              </div>
              <div className="flex gap-3 pt-2 text-[12.5px] font-semibold">
                <button type="button" onClick={() => anadir(d)} className="text-gold hover:underline">+ Franja</button>
                {suyas.length > 0 && d <= 5 && (
                  <button type="button" onClick={() => copiarATodos(d)} className="text-white/45 hover:text-white" title="Copiar este horario de lunes a viernes">
                    Copiar a L-V
                  </button>
                )}
              </div>
            </li>
          )
        })}
      </ul>
      <div className="mt-4 flex items-center gap-4">
        <button type="button" disabled={pendiente} onClick={() => start(async () => setEstado(await guardarHorario(tipo, franjas)))}
                className="rounded-full bg-gold px-6 py-2.5 text-[13px] font-extrabold uppercase text-ink disabled:opacity-60">
          {pendiente ? 'Guardando…' : 'Guardar horario'}
        </button>
        <span className="text-[12.5px] text-white/40">Horas en la zona de ARGA (peninsular). Cada cliente las ve en la suya.</span>
      </div>
      <Aviso e={estado} />
    </div>
  )
}

/** Reglas típicas de una agenda. */
export function Reglas({ ajustes }: { ajustes: Ajustes }) {
  const [estado, accion] = useActionState(guardarAjustes, {})
  const fila = 'flex flex-wrap items-center justify-between gap-3 px-5 py-3.5'
  return (
    <form action={accion}>
      <input type="hidden" name="tipo" value={ajustes.tipo} />
      <div className="divide-y divide-white/8 rounded-2xl border border-white/12 bg-ink-3 text-[14px]">
        <label className={fila}>
          <span><b>Agenda abierta</b><span className="block text-[12.5px] text-white/45">Si la cierras, el calendario sale sin huecos.</span></span>
          <input type="checkbox" name="activa" defaultChecked={ajustes.activa} className="h-5 w-5 accent-[#c5a572]" />
        </label>
        <label className={fila}>
          <span><b>Duración de cada cita</b></span>
          <select name="duracion_min" defaultValue={ajustes.duracion_min} className={CAMPO}>
            {[15, 20, 30, 45, 60, 90].map((m) => <option key={m} value={m}>{m} min</option>)}
          </select>
        </label>
        <label className={fila}>
          <span><b>Descanso entre citas</b><span className="block text-[12.5px] text-white/45">Minutos libres antes y después de cada cita cogida.</span></span>
          <select name="margen_min" defaultValue={ajustes.margen_min} className={CAMPO}>
            {[0, 5, 10, 15, 30].map((m) => <option key={m} value={m}>{m ? `${m} min` : 'Sin descanso'}</option>)}
          </select>
        </label>
        <label className={fila}>
          <span><b>Antelación mínima</b><span className="block text-[12.5px] text-white/45">Nadie puede reservar con menos margen que este.</span></span>
          <select name="antelacion_horas" defaultValue={ajustes.antelacion_horas} className={CAMPO}>
            {[1, 2, 4, 12, 24, 48, 72].map((h) => <option key={h} value={h}>{h} h</option>)}
          </select>
        </label>
        <label className={fila}>
          <span><b>Días que se pueden reservar</b><span className="block text-[12.5px] text-white/45">Desde hoy hacia delante.</span></span>
          <select name="dias_vista" defaultValue={ajustes.dias_vista} className={CAMPO}>
            {[7, 14, 21, 30, 45, 60, 90].map((d) => <option key={d} value={d}>{d} días</option>)}
          </select>
        </label>
        <label className={fila}>
          <span><b>Máximo de citas al día</b><span className="block text-[12.5px] text-white/45">Vacío = sin límite.</span></span>
          <input name="max_dia" type="number" min={1} max={50} defaultValue={ajustes.max_dia ?? ''} placeholder="Sin límite" className={`${CAMPO} w-28`} />
        </label>
      </div>
      <button className="mt-4 rounded-full bg-gold px-6 py-2.5 text-[13px] font-extrabold uppercase text-ink">Guardar reglas</button>
      <Aviso e={estado} />
    </form>
  )
}

/** Bloquear días (vacaciones, festivos) o poner un horario especial un día concreto. */
export function NuevaExcepcion({ tipo }: { tipo: Tipo }) {
  const [estado, accion] = useActionState(anadirExcepcion, {})
  const [modo, setModo] = useState<'cerrado' | 'especial'>('cerrado')
  return (
    <form action={accion} className="rounded-2xl border border-white/12 bg-ink-3 p-5">
      <div className="flex flex-wrap gap-2 text-[13px] font-semibold">
        {(['cerrado', 'especial'] as const).map((m) => (
          <label key={m} className={`cursor-pointer rounded-full border px-4 py-2 ${modo === m ? 'border-gold bg-gold/15 text-gold' : 'border-white/14 text-white/60'}`}>
            <input type="radio" name="modo" value={m} checked={modo === m} onChange={() => setModo(m)} className="sr-only" />
            {m === 'cerrado' ? 'Bloquear días' : 'Horario especial un día'}
          </label>
        ))}
      </div>
      <div className="mt-4 flex flex-wrap items-end gap-3 text-[11px] font-bold uppercase tracking-wider text-white/45">
        <label>Desde<input type="date" name="fecha" required className={`mt-1 block ${CAMPO}`} /></label>
        {modo === 'cerrado'
          ? <label>Hasta (opcional)<input type="date" name="fecha_fin" className={`mt-1 block ${CAMPO}`} /></label>
          : <>
              <label>De<input type="time" name="desde" defaultValue="10:00" required className={`mt-1 block ${CAMPO}`} /></label>
              <label>A<input type="time" name="hasta" defaultValue="14:00" required className={`mt-1 block ${CAMPO}`} /></label>
            </>}
        <label>Aplicar a
          <select name="tipo" defaultValue="ambas" className={`mt-1 block ${CAMPO}`}>
            <option value="ambas">Las dos agendas</option>
            <option value={tipo}>Solo {tipo === 'llamada' ? 'llamadas' : 'mentorías'}</option>
          </select>
        </label>
        <label className="min-w-40 flex-1">Motivo (opcional)<input name="motivo" placeholder="Vacaciones, festivo…" className={`mt-1 block w-full ${CAMPO}`} /></label>
        <button className="rounded-full bg-gold px-5 py-2.5 text-[12.5px] font-extrabold uppercase text-ink">Añadir</button>
      </div>
      <Aviso e={estado} />
    </form>
  )
}

/** Así ve el cliente el calendario ahora mismo (sin poder reservar). */
export function VistaPrevia({ datos }: { datos: DatosCalendario }) {
  const [aviso, setAviso] = useState(false)
  return (
    <div>
      <Agenda datos={datos} onElegir={() => setAviso(true)} />
      {aviso && <p className="mt-3 text-sm text-white/50">Esto es solo la vista previa: aquí no se reserva.</p>}
    </div>
  )
}
