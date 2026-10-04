import { createAdminClient } from '@/lib/supabase/server'
import { aUtc, claveDia, diaSemana, sumarDias } from '@/lib/fechas'

export type Tipo = 'llamada' | 'mentoria'

export type Ajustes = {
  tipo: Tipo
  duracion_min: number
  margen_min: number
  antelacion_horas: number
  dias_vista: number
  max_dia: number | null
  zona: string
  activa: boolean
}
export type Franja = { id?: string; dia_semana: number; desde: string; hasta: string }
/**
 * Excepción de un día concreto:
 * - sin horas → día cerrado;
 * - con horas y `bloquea` → esas horas no se atienden, el resto del día sigue con el horario semanal;
 * - con horas y sin `bloquea` → horario especial (sustituye al semanal ese día).
 */
export type Excepcion = { id?: string; fecha: string; desde: string | null; hasta: string | null; bloquea?: boolean | null; motivo?: string | null }
type Ocupada = { empieza: string; termina: string; tipo?: Tipo }

/** Lo que necesita el calendario del cliente para pintarse. */
export type DatosAgenda = {
  tipo: Tipo
  huecos: string[]        // inicio de cada hueco libre, en ISO (UTC)
  duracionMin: number
  diasVista: number
  zonaArga: string
  activa: boolean
}

export const AJUSTES_POR_DEFECTO: Omit<Ajustes, 'tipo'> = {
  duracion_min: 30, margen_min: 0, antelacion_horas: 12, dias_vista: 30, max_dia: null, zona: 'Europe/Madrid', activa: true,
}

const hhmm = (t: string) => t.slice(0, 5)

/**
 * Calcula los huecos libres a partir de las reglas. Es la ÚNICA fuente de
 * verdad: el calendario la usa para pintar y la reserva la vuelve a llamar
 * para comprobar que el hueco elegido sigue siendo válido.
 */
export function calcularHuecos(
  ajustes: Ajustes, horario: Franja[], excepciones: Excepcion[], ocupadas: Ocupada[], ahora = new Date(),
): string[] {
  if (!ajustes.activa) return []
  const zona = ajustes.zona
  const dur = ajustes.duracion_min * 60_000
  const margen = ajustes.margen_min * 60_000
  const minimo = ahora.getTime() + ajustes.antelacion_horas * 3_600_000
  const hoy = claveDia(ahora, zona)

  // Las citas ya cogidas (de las dos agendas), ensanchadas con el margen de descanso
  const bloques = ocupadas.map((o) => [new Date(o.empieza).getTime() - margen, new Date(o.termina).getTime() + margen])
  // El máximo al día cuenta solo las citas de ESTA agenda: «máximo de llamadas al día»
  const porDia = new Map<string, number>()
  for (const o of ocupadas) {
    if (o.tipo && o.tipo !== ajustes.tipo) continue
    porDia.set(claveDia(o.empieza, zona), (porDia.get(claveDia(o.empieza, zona)) ?? 0) + 1)
  }

  const huecos: string[] = []
  for (let i = 0; i <= ajustes.dias_vista; i++) {
    const dia = sumarDias(hoy, i)
    const delDia = excepciones.filter((e) => e.fecha === dia)
    if (delDia.some((e) => !e.desde)) continue // día cerrado
    // Día completo ya: el máximo limita las citas COGIDAS, no los huecos que se enseñan
    if (ajustes.max_dia && (porDia.get(dia) ?? 0) >= ajustes.max_dia) continue

    const especiales = delDia.filter((e) => !e.bloquea)
    const franjas = especiales.length
      ? especiales.map((e) => ({ desde: e.desde!, hasta: e.hasta! }))
      : horario.filter((f) => f.dia_semana === diaSemana(dia))
    // Horas bloqueadas ese día (médico, un viaje…): se restan del horario
    const bloqueadas = delDia.filter((e) => e.bloquea)
      .map((e) => [aUtc(dia, hhmm(e.desde!), zona).getTime(), aUtc(dia, hhmm(e.hasta!), zona).getTime()])

    for (const f of [...franjas].sort((a, b) => a.desde.localeCompare(b.desde))) {
      const fin = aUtc(dia, hhmm(f.hasta), zona).getTime()
      for (let t = aUtc(dia, hhmm(f.desde), zona).getTime(); t + dur <= fin; t += dur) {
        if (t < minimo) continue
        if (bloques.some(([a, b]) => t < b && t + dur > a)) continue
        if (bloqueadas.some(([a, b]) => t < b && t + dur > a)) continue
        huecos.push(new Date(t).toISOString())
      }
    }
  }
  return huecos
}

/** Lee reglas y citas de la base y devuelve los huecos libres de una agenda. */
export async function cargarAgenda(tipo: Tipo): Promise<DatosAgenda & { ajustes: Ajustes }> {
  const admin = createAdminClient()
  const desde = new Date(Date.now() - 86_400_000).toISOString()

  const [{ data: aj }, { data: horario }, { data: excepciones }, { data: ocupadas }] = await Promise.all([
    admin.from('agenda_ajustes').select('*').eq('tipo', tipo).maybeSingle(),
    admin.from('agenda_horario').select('dia_semana, desde, hasta').eq('tipo', tipo),
    // '*' y no una lista de columnas: si falta la migración 0010 (columna «bloquea»), la
    // consulta no debe fallar, porque entonces se ignorarían también los días cerrados.
    admin.from('agenda_excepciones').select('*').eq('tipo', tipo).gte('fecha', desde.slice(0, 10)),
    // Todas las citas vivas, de las dos agendas: el tiempo de ARGA es uno solo
    admin.from('citas').select('empieza, termina, tipo').eq('estado', 'reservada').gte('termina', desde),
  ])

  // Sin la migración 0008 aplicada no hay tablas: en producción la agenda sale
  // vacía (no rota); en local se enseña el horario de partida para poder verla.
  const demo = !aj && process.env.NODE_ENV !== 'production'
  const ajustes: Ajustes = { tipo, ...AJUSTES_POR_DEFECTO, ...(aj ?? {}) }
  const franjas: Franja[] = demo
    ? [1, 2, 3, 4, 5].flatMap((d) => [{ dia_semana: d, desde: '10:00', hasta: '14:00' }, { dia_semana: d, desde: '16:00', hasta: '20:00' }])
    : horario ?? []
  const huecos = aj || demo ? calcularHuecos(ajustes, franjas, excepciones ?? [], ocupadas ?? []) : []

  return {
    tipo, ajustes, huecos,
    duracionMin: ajustes.duracion_min,
    diasVista: ajustes.dias_vista,
    zonaArga: ajustes.zona,
    activa: ajustes.activa && (Boolean(aj) || demo),
  }
}
