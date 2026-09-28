/**
 * Fechas y zonas horarias. ARGA define su horario en su zona (Europe/Madrid)
 * y cada cliente lo ve en la suya: todo se guarda en UTC y solo se convierte
 * al pintarlo.
 */
export const ZONA_ARGA = 'Europe/Madrid'

/** Milisegundos de ahora (en una función para poder usarlo al pintar en el servidor). */
export const ahoraMs = () => Date.now()

const cacheClave = new Map<string, Intl.DateTimeFormat>()
/** «2026-09-28»: el día, en la zona indicada, al que pertenece un instante. */
export function claveDia(d: Date | string, zona = ZONA_ARGA): string {
  let f = cacheClave.get(zona)
  if (!f) {
    f = new Intl.DateTimeFormat('en-CA', { timeZone: zona, year: 'numeric', month: '2-digit', day: '2-digit' })
    cacheClave.set(zona, f)
  }
  return f.format(new Date(d))
}

/** «17:30» en la zona indicada. */
export const hora = (d: Date | string, zona = ZONA_ARGA) =>
  new Intl.DateTimeFormat('es-ES', { timeZone: zona, hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).format(new Date(d))

/** «martes, 30 de septiembre» a partir de una clave de día. */
export const diaLargo = (clave: string) =>
  new Intl.DateTimeFormat('es-ES', { timeZone: 'UTC', weekday: 'long', day: 'numeric', month: 'long' })
    .format(new Date(`${clave}T12:00:00Z`))

/** «martes, 30 de septiembre, 17:30» de un instante, en la zona indicada. */
export const fechaHora = (d: Date | string, zona = ZONA_ARGA) =>
  new Intl.DateTimeFormat('es-ES', { timeZone: zona, weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' })
    .format(new Date(d))

/** 1 = lunes … 7 = domingo, de una clave de día. */
export const diaSemana = (clave: string) => ((new Date(`${clave}T12:00:00Z`).getUTCDay() + 6) % 7) + 1

/** Suma días a una clave «2026-09-28». */
export function sumarDias(clave: string, n: number): string {
  const d = new Date(`${clave}T12:00:00Z`)
  d.setUTCDate(d.getUTCDate() + n)
  return d.toISOString().slice(0, 10)
}

/**
 * Convierte una hora de reloj en una zona («2026-09-28», «17:30», Madrid) al
 * instante real. Tiene en cuenta el cambio de hora de ese día concreto.
 */
export function aUtc(dia: string, hhmm: string, zona = ZONA_ARGA): Date {
  const [y, m, d] = dia.split('-').map(Number)
  const [h, min] = hhmm.split(':').map(Number)
  const comoUtc = Date.UTC(y, m - 1, d, h, min)
  const desfase = (t: number) => {
    const p = new Intl.DateTimeFormat('en-US', {
      timeZone: zona, hourCycle: 'h23', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit',
    }).formatToParts(new Date(t))
    const v = (k: string) => Number(p.find((x) => x.type === k)?.value)
    return Date.UTC(v('year'), v('month') - 1, v('day'), v('hour'), v('minute')) - t
  }
  // Dos pasadas: la segunda corrige si el cambio de hora cae entre medias.
  const primera = comoUtc - desfase(comoUtc)
  return new Date(comoUtc - desfase(primera))
}

/** Nombre legible de una zona: «hora de Canarias», «hora de Madrid»… */
export function nombreZona(zona: string): string {
  try {
    const largo = new Intl.DateTimeFormat('es-ES', { timeZone: zona, timeZoneName: 'longGeneric' })
      .formatToParts(new Date()).find((p) => p.type === 'timeZoneName')?.value
    const ciudad = zona.split('/').pop()?.replace(/_/g, ' ')
    return largo ? `${largo[0].toUpperCase()}${largo.slice(1)} (${ciudad})` : zona
  } catch {
    return zona
  }
}
