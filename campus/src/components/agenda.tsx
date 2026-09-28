'use client'

import { useMemo, useState, useSyncExternalStore } from 'react'
import { claveDia, diaLargo, hora, nombreZona, sumarDias } from '@/lib/fechas'

const MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre']
const SEMANA = ['L', 'M', 'X', 'J', 'V', 'S', 'D']

/** Las zonas más probables primero; luego, todas. */
const HABITUALES = [
  'Europe/Madrid', 'Atlantic/Canary', 'Europe/Lisbon', 'Europe/London', 'Europe/Paris', 'Europe/Berlin',
  'America/Mexico_City', 'America/Bogota', 'America/Lima', 'America/Argentina/Buenos_Aires', 'America/Santiago', 'America/New_York',
]

function todasLasZonas(): string[] {
  try {
    return (Intl as unknown as { supportedValuesOf: (k: string) => string[] }).supportedValuesOf('timeZone')
  } catch {
    return HABITUALES
  }
}

/** Desfase de una zona ahora mismo: «UTC+2». */
function desfase(zona: string) {
  try {
    return new Intl.DateTimeFormat('en-US', { timeZone: zona, timeZoneName: 'shortOffset' })
      .formatToParts(new Date()).find((p) => p.type === 'timeZoneName')?.value.replace('GMT', 'UTC') ?? ''
  } catch {
    return ''
  }
}

export type DatosCalendario = {
  huecos: string[]
  duracionMin: number
  diasVista: number
  zonaArga: string
  activa: boolean
}

/**
 * Calendario de reserva estilo Calendly.
 * - Siempre visible: los días con hueco se pueden pulsar y llevan un punto; el resto sale en gris.
 * - Las horas se enseñan en la zona horaria del cliente (se detecta sola y la puede cambiar).
 * - Al elegir una hora aparece «Siguiente», que entrega el hueco y la zona al formulario.
 */
export default function Agenda({ datos, onElegir, oscuro = true }: {
  datos: DatosCalendario
  onElegir: (iso: string, zona: string) => void
  oscuro?: boolean
}) {
  // La zona del navegador solo se conoce en el cliente: en el servidor se pinta con la de ARGA
  const detectada = useSyncExternalStore(
    () => () => {},
    () => Intl.DateTimeFormat().resolvedOptions().timeZone || datos.zonaArga,
    () => datos.zonaArga,
  )
  const [elegida, setElegida] = useState<string | null>(null)
  const zona = elegida ?? detectada

  const porDia = useMemo(() => {
    const m = new Map<string, string[]>()
    for (const h of datos.huecos) {
      const k = claveDia(h, zona)
      m.set(k, [...(m.get(k) ?? []), h])
    }
    return m
  }, [datos.huecos, zona])

  const hoy = claveDia(new Date(), zona)
  const ultimo = sumarDias(hoy, datos.diasVista)
  const primero = [...porDia.keys()].sort()[0] ?? null

  const [dia, setDia] = useState<string | null>(null)
  const [hueco, setHueco] = useState<string | null>(null)
  const diaActivo = dia && porDia.has(dia) ? dia : primero
  // Mes a la vista: el del día activo (el primero con hueco, que puede caer el mes que viene)
  // hasta que la persona navegue con las flechas.
  const [navegado, setNavegado] = useState<{ y: number; m: number } | null>(null)
  const base = diaActivo ?? hoy
  const vista = navegado ?? { y: Number(base.slice(0, 4)), m: Number(base.slice(5, 7)) - 1 }

  const diasMes = new Date(Date.UTC(vista.y, vista.m + 1, 0)).getUTCDate()
  const hueco0 = (new Date(Date.UTC(vista.y, vista.m, 1)).getUTCDay() + 6) % 7
  const claveMes = (d: number) => `${vista.y}-${String(vista.m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
  const celdas = [...Array.from({ length: hueco0 }, () => null), ...Array.from({ length: diasMes }, (_, i) => claveMes(i + 1))]

  const mesClave = (y: number, m: number) => `${y}-${String(m + 1).padStart(2, '0')}`
  const hayAntes = mesClave(vista.y, vista.m) > hoy.slice(0, 7)
  const hayDespues = mesClave(vista.y, vista.m) < ultimo.slice(0, 7)
  const mover = (p: number) => setNavegado({ y: vista.m + p < 0 ? vista.y - 1 : vista.m + p > 11 ? vista.y + 1 : vista.y, m: (vista.m + p + 12) % 12 })

  const zonas = useMemo(() => {
    const resto = todasLasZonas().filter((z) => !HABITUALES.includes(z))
    return { habituales: HABITUALES.includes(zona) ? HABITUALES : [zona, ...HABITUALES], resto: resto.filter((z) => z !== zona) }
  }, [zona])

  const c = oscuro
    ? { caja: 'border-white/12 bg-ink-3', texto: 'text-white', suave: 'text-white/45', off: 'text-white/18', hover: 'hover:bg-white/8', boton: 'border-white/14 bg-ink text-white/85 hover:border-gold/60' }
    : { caja: 'border-ink/10 bg-white', texto: 'text-ink', suave: 'text-ink/50', off: 'text-ink/20', hover: 'hover:bg-ink/5', boton: 'border-ink/15 bg-white text-ink hover:border-ink/40' }

  const delDia = diaActivo ? porDia.get(diaActivo) ?? [] : []

  return (
    <div>
      {/* Zona horaria */}
      <label className={`flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[12.5px] ${c.suave}`}>
        <span className="flex items-center gap-1.5">
          <svg viewBox="0 0 24 24" aria-hidden className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" /></svg>
          Zona horaria
        </span>
        <select value={zona} onChange={(e) => { setElegida(e.target.value); setHueco(null) }}
                className={`min-w-0 max-w-full flex-1 rounded-lg border px-3 py-2 text-[13px] font-semibold ${c.caja} ${c.texto}`}>
          <optgroup label="Habituales">
            {zonas.habituales.map((z) => <option key={z} value={z}>{nombreZona(z)} · {desfase(z)}</option>)}
          </optgroup>
          <optgroup label="Todas">
            {zonas.resto.map((z) => <option key={z} value={z}>{z.replace(/_/g, ' ')} · {desfase(z)}</option>)}
          </optgroup>
        </select>
      </label>

      <div className="mt-4 grid gap-4 md:grid-cols-[minmax(0,1.1fr)_minmax(0,.9fr)]">
        {/* Mes */}
        <div className={`rounded-2xl border p-4 sm:p-5 ${c.caja}`}>
          <div className="flex items-center justify-between">
            <button type="button" onClick={() => mover(-1)} disabled={!hayAntes} aria-label="Mes anterior"
                    className={`grid h-9 w-9 place-items-center rounded-full border border-current/20 ${c.suave} transition disabled:opacity-25`}>‹</button>
            <p className={`text-[15px] font-extrabold first-letter:uppercase ${c.texto}`}>{MESES[vista.m]} {vista.y}</p>
            <button type="button" onClick={() => mover(1)} disabled={!hayDespues} aria-label="Mes siguiente"
                    className={`grid h-9 w-9 place-items-center rounded-full border border-current/20 ${c.suave} transition disabled:opacity-25`}>›</button>
          </div>

          <div className="mt-4 grid grid-cols-7 gap-1 text-center">
            {SEMANA.map((s) => <span key={s} className={`pb-1 text-[11px] font-bold ${c.suave}`}>{s}</span>)}
            {celdas.map((k, i) => {
              if (!k) return <span key={`v${i}`} />
              const libre = porDia.has(k)
              const elegido = k === diaActivo
              return (
                <button key={k} type="button" disabled={!libre}
                        onClick={() => { setDia(k); setHueco(null) }}
                        aria-pressed={elegido}
                        aria-label={`${diaLargo(k)}${libre ? `, ${porDia.get(k)!.length} huecos libres` : ', sin huecos'}`}
                        className={`relative mx-auto grid aspect-square w-full max-w-11 place-items-center rounded-full text-[14px] tabular-nums transition ${
                          elegido ? 'bg-gold font-extrabold text-ink'
                            : libre ? `font-bold ${c.texto} ${c.hover} bg-gold/10`
                            : c.off
                        } ${k === hoy && !elegido ? 'ring-1 ring-current/30' : ''}`}>
                  {Number(k.slice(8))}
                  {libre && !elegido && <span aria-hidden className="absolute bottom-1 h-1 w-1 rounded-full bg-gold" />}
                </button>
              )
            })}
          </div>
        </div>

        {/* Horas del día */}
        <div className={`rounded-2xl border p-4 sm:p-5 ${c.caja}`}>
          {!datos.activa || datos.huecos.length === 0 ? (
            <div className="flex h-full min-h-48 flex-col items-center justify-center text-center">
              <p className={`text-[14.5px] font-bold ${c.texto}`}>No quedan huecos libres</p>
              <p className={`mt-1.5 max-w-[30ch] text-[13px] ${c.suave}`}>
                En los próximos {datos.diasVista} días está todo cogido. Escríbenos a info@argapremiumcars.com y te buscamos un momento.
              </p>
            </div>
          ) : diaActivo && (
            <>
              <p className={`text-[15px] font-extrabold first-letter:uppercase ${c.texto}`}>{diaLargo(diaActivo)}</p>
              <p className={`mt-0.5 text-[12px] ${c.suave}`}>{datos.duracionMin} min · {nombreZona(zona)}</p>
              <ul className="mt-4 max-h-80 space-y-2 overflow-y-auto pr-1">
                {delDia.map((h) => (
                  <li key={h} className="flex gap-2">
                    <button type="button" onClick={() => setHueco(h)} aria-pressed={hueco === h}
                            className={`flex-1 rounded-xl border px-3 py-3 text-[14.5px] font-bold tabular-nums transition ${
                              hueco === h ? `border-transparent bg-white/10 ${c.texto} ${oscuro ? '' : 'bg-ink/10'}` : c.boton
                            }`}>
                      {hora(h, zona)}
                    </button>
                    {hueco === h && (
                      <button type="button" onClick={() => onElegir(h, zona)}
                              className="flex-1 rounded-xl bg-gold px-3 py-3 text-[14px] font-extrabold text-ink transition hover:bg-gold-soft">
                        Siguiente
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
