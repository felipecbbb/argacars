import { cliente, plantilla, REMITENTE } from '@/lib/correo'
import { crearIcs } from '@/lib/ics'
import { fechaHora, hora, nombreZona, ZONA_ARGA } from '@/lib/fechas'
import { urlBase } from '@/lib/stripe'

export type CitaCorreo = {
  id: string
  tipo: 'llamada' | 'mentoria'
  empieza: string
  termina: string
  nombre: string
  email: string
  telefono?: string | null
  mensaje?: string | null
  zona_cliente: string
  token: string
}

/** Quién recibe los avisos de ARGA (reservas, cancelaciones). */
const AVISOS = process.env.CORREO_AVISOS ?? 'info@argapremiumcars.com'

const QUE = { llamada: 'Llamada con ARGA Premium Cars', mentoria: 'Mentoría 1 a 1 · ARGA Premium Cars' }
const esc = (t: string) => t.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]!)

function cuando(c: CitaCorreo, zona: string) {
  const f = fechaHora(c.empieza, zona)
  return `${f[0].toUpperCase()}${f.slice(1)}–${hora(c.termina, zona)} (${nombreZona(zona)})`
}

function adjunto(c: CitaCorreo, cancelada = false) {
  const ics = crearIcs({
    uid: c.id, empieza: c.empieza, termina: c.termina, cancelada,
    titulo: c.tipo === 'llamada' ? `Llamada ARGA · ${c.nombre}` : `Mentoría ARGA · ${c.nombre}`,
    descripcion: `${QUE[c.tipo]}\nCon: ${c.nombre} · ${c.email}${c.telefono ? ` · ${c.telefono}` : ''}${c.mensaje ? `\nTema: ${c.mensaje}` : ''}\nGestionar: ${urlBase()}/cita/${c.token}`,
  })
  return [{ filename: cancelada ? 'cita-cancelada.ics' : 'cita.ics', content: Buffer.from(ics, 'utf-8'), contentType: 'text/calendar' }]
}

async function enviar(para: string, asunto: string, html: string, adjuntos?: ReturnType<typeof adjunto>, responderA?: string) {
  const resend = cliente()
  if (!resend) return { error: 'Falta configurar el envío de correo.' }
  const { error } = await resend.emails.send({ from: REMITENTE, to: para, subject: asunto, html, attachments: adjuntos, replyTo: responderA })
  return error ? { error: error.message } : {}
}

/** Confirmación al cliente y aviso a ARGA. Los dos llevan el .ics para su calendario. */
export async function correosReserva(c: CitaCorreo) {
  const gestionar = `${urlBase()}/cita/${c.token}`
  const datos = `<strong>${esc(c.nombre)}</strong> · ${esc(c.email)}${c.telefono ? ` · ${esc(c.telefono)}` : ''}${c.mensaje ? `<br>«${esc(c.mensaje)}»` : ''}`

  await Promise.all([
    enviar(c.email, `Confirmada: ${QUE[c.tipo]}`, plantilla({
      titulo: c.tipo === 'llamada' ? 'Tu llamada está reservada' : 'Tu mentoría está reservada',
      cuerpo: `Hola ${esc(c.nombre.split(' ')[0])}, te esperamos el<br><strong>${cuando(c, c.zona_cliente)}</strong>.<br><br>
        ${c.tipo === 'llamada'
          ? 'Te llamaremos al teléfono que nos has dejado. Si quieres, ve pensando qué te gustaría resolver: coche que buscas, presupuesto y si es para ti o como actividad profesional.'
          : 'Te escribiremos para enviarte el enlace de la videollamada. Si tienes una operación concreta, ten a mano el anuncio y los números.'}
        <br><br>Adjuntamos el evento para que lo añadas a tu calendario.`,
      boton: 'Cambiar o cancelar la cita',
      enlace: gestionar,
      pie: 'Si no puedes asistir, cancélala desde el botón para que otra persona pueda usar ese hueco.',
    }), adjunto(c)),

    enviar(AVISOS, `Nueva ${c.tipo === 'llamada' ? 'llamada' : 'mentoría'}: ${c.nombre} · ${fechaHora(c.empieza, ZONA_ARGA)}`, plantilla({
      titulo: c.tipo === 'llamada' ? 'Nueva llamada reservada desde la web' : 'Nueva mentoría reservada',
      cuerpo: `${cuando(c, ZONA_ARGA)}<br><br>${datos}<br><br>El cliente está en: ${esc(nombreZona(c.zona_cliente))}.`,
      boton: 'Ver la agenda',
      enlace: `${urlBase()}/admin/mentorias`,
    }), adjunto(c), c.email),
  ])
}

/** Aviso de cancelación: al otro lado de quien canceló (y copia a ARGA siempre). */
export async function correosCancelacion(c: CitaCorreo, por: 'cliente' | 'admin') {
  const reservar = c.tipo === 'llamada' ? `${urlBase()}/#acceso` : `${urlBase()}/mentorias`
  await Promise.all([
    enviar(c.email, `Cancelada: ${QUE[c.tipo]}`, plantilla({
      titulo: 'Tu cita se ha cancelado',
      cuerpo: `${por === 'admin'
        ? 'Hemos tenido que cancelar tu cita del'
        : 'Te confirmamos que has cancelado tu cita del'}<br><strong>${cuando(c, c.zona_cliente)}</strong>.<br><br>Puedes elegir otro hueco cuando quieras.`,
      boton: 'Elegir otro hueco',
      enlace: reservar,
    }), adjunto(c, true)),
    enviar(AVISOS, `Cancelada: ${c.nombre} · ${fechaHora(c.empieza, ZONA_ARGA)}`, plantilla({
      titulo: por === 'cliente' ? 'Un cliente ha cancelado su cita' : 'Has cancelado una cita',
      cuerpo: `${cuando(c, ZONA_ARGA)}<br><br><strong>${esc(c.nombre)}</strong> · ${esc(c.email)}. El hueco vuelve a estar libre.`,
      boton: 'Ver la agenda',
      enlace: `${urlBase()}/admin/mentorias`,
    }), adjunto(c, true)),
  ])
}

/** Recordatorio al cliente el día antes. */
export async function correoRecordatorio(c: CitaCorreo) {
  return enviar(c.email, `Recordatorio: ${QUE[c.tipo]} mañana`, plantilla({
    titulo: 'Te recordamos tu cita',
    cuerpo: `Hola ${esc(c.nombre.split(' ')[0])}, mañana tenemos tu ${c.tipo === 'llamada' ? 'llamada' : 'mentoría'}:<br><strong>${cuando(c, c.zona_cliente)}</strong>.`,
    boton: 'Cambiar o cancelar la cita',
    enlace: `${urlBase()}/cita/${c.token}`,
  }))
}
