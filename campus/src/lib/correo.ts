import { Resend } from 'resend'

const REMITENTE = process.env.CORREO_REMITENTE ?? 'ARGA Premium Cars <web@argapremiumcars.es>'
const GOLD = '#c5a572'
const NEGRO = '#0a0a0a'

/** Plantilla de correo con la imagen de ARGA. Sin imágenes externas: solo texto y color. */
function plantilla({ titulo, cuerpo, boton, enlace, pie }: {
  titulo: string
  cuerpo: string
  boton: string
  enlace: string
  pie?: string
}) {
  return `<!doctype html>
<html lang="es"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f4f4f2;font-family:-apple-system,'Segoe UI',Helvetica,Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f2;padding:32px 16px;">
    <tr><td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 2px 14px rgba(0,0,0,.06);">

        <tr><td style="background:${NEGRO};padding:26px 32px;">
          <span style="color:#ffffff;font-size:17px;font-weight:800;letter-spacing:-.02em;">ARGA Premium Cars</span>
          <span style="color:${GOLD};font-size:11px;font-weight:700;letter-spacing:.16em;text-transform:uppercase;padding-left:10px;">Campus</span>
        </td></tr>

        <tr><td style="padding:34px 32px 8px;">
          <h1 style="margin:0;font-size:23px;line-height:1.25;letter-spacing:-.02em;color:${NEGRO};">${titulo}</h1>
        </td></tr>

        <tr><td style="padding:12px 32px 0;">
          <p style="margin:0;font-size:15px;line-height:1.6;color:#44444a;">${cuerpo}</p>
        </td></tr>

        <tr><td style="padding:28px 32px 4px;">
          <a href="${enlace}" style="display:inline-block;background:${GOLD};color:${NEGRO};text-decoration:none;font-size:14px;font-weight:800;text-transform:uppercase;letter-spacing:.04em;padding:15px 30px;border-radius:999px;">${boton}</a>
        </td></tr>

        <tr><td style="padding:22px 32px 0;">
          <p style="margin:0;font-size:12.5px;line-height:1.6;color:#8a8a90;">
            Si el botón no funciona, copia y pega esta dirección en tu navegador:<br>
            <span style="color:#44444a;word-break:break-all;">${enlace}</span>
          </p>
        </td></tr>

        ${pie ? `<tr><td style="padding:20px 32px 0;">
          <p style="margin:0;font-size:12.5px;line-height:1.6;color:#8a8a90;">${pie}</p>
        </td></tr>` : ''}

        <tr><td style="padding:28px 32px 30px;">
          <div style="border-top:1px solid #ececeb;padding-top:18px;">
            <p style="margin:0;font-size:11.5px;line-height:1.6;color:#a0a0a6;">
              ARGA Premium Cars® · Formación de importación de vehículos<br>
              Este correo se ha enviado automáticamente desde el campus.
            </p>
          </div>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body></html>`
}

function cliente() {
  const clave = process.env.RESEND_API_KEY
  if (!clave) return null
  return new Resend(clave)
}

/** Correo de alta: el alumno estrena cuenta y elige su contraseña. */
export async function enviarAlta(email: string, enlace: string, nombre?: string | null) {
  const resend = cliente()
  if (!resend) return { error: 'Falta configurar el envío de correo.' }

  const saludo = nombre?.trim() ? `Hola ${nombre.trim().split(' ')[0]},` : 'Hola,'
  const { error } = await resend.emails.send({
    from: REMITENTE,
    to: email,
    subject: 'Tu acceso al campus de ARGA Premium Cars',
    html: plantilla({
      titulo: 'Ya tienes acceso a la formación',
      cuerpo: `${saludo} tu cuenta del campus está lista. Elige una contraseña y entra cuando quieras: los módulos, los vídeos y todas las guías descargables te esperan dentro.`,
      boton: 'Elegir mi contraseña',
      enlace,
      pie: 'Este enlace caduca en 24 horas. Si se te pasa, pide uno nuevo desde «Recupera tu contraseña» en la pantalla de acceso.',
    }),
  })
  return error ? { error: error.message } : {}
}

/** Correo de recuperación de contraseña. */
export async function enviarRecuperacion(email: string, enlace: string) {
  const resend = cliente()
  if (!resend) return { error: 'Falta configurar el envío de correo.' }

  const { error } = await resend.emails.send({
    from: REMITENTE,
    to: email,
    subject: 'Recupera tu contraseña del campus',
    html: plantilla({
      titulo: 'Elige una contraseña nueva',
      cuerpo: 'Has pedido recuperar el acceso al campus. Pulsa el botón y podrás poner una contraseña nueva al momento.',
      boton: 'Poner contraseña nueva',
      enlace,
      pie: 'Si no has sido tú, puedes ignorar este correo: tu contraseña actual sigue funcionando.',
    }),
  })
  return error ? { error: error.message } : {}
}
