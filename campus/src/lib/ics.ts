/** Evento de calendario (.ics) para que la cita se añada a Google Calendar, Outlook o el iPhone. */
export function crearIcs({ uid, empieza, termina, titulo, descripcion, cancelada = false }: {
  uid: string
  empieza: Date | string
  termina: Date | string
  titulo: string
  descripcion: string
  cancelada?: boolean
}): string {
  const f = (d: Date | string) => new Date(d).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')
  const esc = (t: string) => t.replace(/\\/g, '\\\\').replace(/\n/g, '\\n').replace(/[,;]/g, (c) => `\\${c}`)
  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//ARGA Premium Cars//Campus//ES',
    `METHOD:${cancelada ? 'CANCEL' : 'REQUEST'}`,
    'BEGIN:VEVENT',
    `UID:${uid}@argapremiumcars.es`,
    `DTSTAMP:${f(new Date())}`,
    `DTSTART:${f(empieza)}`,
    `DTEND:${f(termina)}`,
    `SUMMARY:${esc(titulo)}`,
    `DESCRIPTION:${esc(descripcion)}`,
    `STATUS:${cancelada ? 'CANCELLED' : 'CONFIRMED'}`,
    ...(cancelada ? ['SEQUENCE:1'] : ['SEQUENCE:0']),
    'BEGIN:VALARM',
    'TRIGGER:-PT15M',
    'ACTION:DISPLAY',
    'DESCRIPTION:Recordatorio',
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n')
}
