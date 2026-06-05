// === Configuración ===
const TO_EMAIL = 'info@argapremiumcars.com';
// Remitente: debe ser de un dominio verificado en Resend.
// Hasta verificar argapremiumcars.es puedes usar 'onboarding@resend.dev'.
const FROM_EMAIL = process.env.FROM_EMAIL || 'ARGA Premium Cars <web@argapremiumcars.es>';
const SITE_URL = process.env.SITE_URL || 'https://argapremiumcars.es';
const GOLD = '#c5a572';
const BLACK = '#0a0a0a';

// Convierte un teléfono a formato wa.me (solo dígitos, con prefijo país).
function toWhatsApp(raw) {
  let d = (raw || '').replace(/[^\d]/g, '');
  if (!d) return null;
  // Quita prefijo internacional 00 -> nada
  if (d.startsWith('00')) d = d.slice(2);
  // Número español sin prefijo (9 dígitos) -> añade 34
  if (d.length === 9) d = '34' + d;
  return d;
}

function esc(s) {
  return String(s || '')
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function buildHtml({ name, email, phone, message }) {
  const wa = toWhatsApp(phone);
  const firstName = (name || '').trim().split(/\s+/)[0] || '';
  const waMessage = `Hola ${firstName}, soy Alejandro de ARGA Premium Cars 👋\n\nHemos recibido tu solicitud de asesoramiento para nuestro servicio de importación de vehículo.`;
  const waLink = wa ? `https://wa.me/${wa}?text=${encodeURIComponent(waMessage)}` : null;

  const row = (label, value) => `
    <tr>
      <td style="padding:14px 0;border-bottom:1px solid #eee;font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:#9b9b9b;font-weight:600;width:120px;vertical-align:top;">${label}</td>
      <td style="padding:14px 0;border-bottom:1px solid #eee;font-size:16px;color:${BLACK};font-weight:600;">${value}</td>
    </tr>`;

  return `<!doctype html>
<html lang="es">
<body style="margin:0;padding:0;background:#f7f7f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Inter,Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f7f7f5;padding:32px 16px;">
    <tr><td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:20px;overflow:hidden;box-shadow:0 10px 40px rgba(0,0,0,.08);">

        <!-- Cabecera negra -->
        <tr>
          <td style="background:${BLACK};padding:32px 32px 28px;">
            <img src="${SITE_URL}/assets/img/logo.png" alt="ARGA Premium Cars" width="120" style="display:block;height:auto;margin-bottom:18px;">
            <div style="color:${GOLD};font-size:12px;letter-spacing:.14em;text-transform:uppercase;font-weight:700;">Nueva solicitud de coche</div>
            <div style="color:#ffffff;font-size:22px;font-weight:800;letter-spacing:-.01em;margin-top:6px;">${esc(name) || 'Nuevo contacto'} quiere importar un coche</div>
          </td>
        </tr>

        <!-- Datos -->
        <tr>
          <td style="padding:8px 32px 4px;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
              ${row('Nombre', esc(name) || '—')}
              ${row('Email', `<a href="mailto:${esc(email)}" style="color:${BLACK};text-decoration:none;">${esc(email) || '—'}</a>`)}
              ${row('Teléfono', esc(phone) || '—')}
              ${row('Qué busca', (esc(message) || '—').replace(/\n/g, '<br>'))}
            </table>
          </td>
        </tr>

        <!-- Botón WhatsApp -->
        ${waLink ? `
        <tr>
          <td style="padding:24px 32px 8px;" align="center">
            <a href="${waLink}" style="display:inline-block;background:#25D366;color:#ffffff;text-decoration:none;font-weight:700;font-size:16px;padding:16px 28px;border-radius:999px;">
              💬 Responder por WhatsApp
            </a>
          </td>
        </tr>` : ''}

        <!-- Botón email -->
        <tr>
          <td style="padding:8px 32px 28px;" align="center">
            <a href="mailto:${esc(email)}?subject=${encodeURIComponent('Tu coche con ARGA Premium Cars')}" style="display:inline-block;background:${BLACK};color:#ffffff;text-decoration:none;font-weight:700;font-size:15px;padding:14px 26px;border-radius:999px;">
              Responder por email
            </a>
          </td>
        </tr>

        <!-- Pie -->
        <tr>
          <td style="background:#f7f7f5;padding:20px 32px;text-align:center;font-size:12px;color:#9b9b9b;">
            Enviado desde el formulario de <a href="${SITE_URL}" style="color:${GOLD};text-decoration:none;">argapremiumcars.es</a>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

async function handler(req, res) {
  const { Resend } = require('resend');
  if (req.method !== 'POST') {
    res.status(405).json({ ok: false, error: 'Method not allowed' });
    return;
  }

  if (!process.env.RESEND_API_KEY) {
    res.status(500).json({ ok: false, error: 'Falta RESEND_API_KEY' });
    return;
  }

  try {
    let body = req.body;
    if (typeof body === 'string') body = JSON.parse(body || '{}');
    if (!body) body = {};

    const name = (body.name || '').toString().trim();
    const email = (body.email || '').toString().trim();
    const phone = (body.phone || '').toString().trim();
    const message = (body.message || '').toString().trim();

    // Honeypot anti-spam (campo oculto que un bot rellenaría)
    if (body.company) {
      res.status(200).json({ ok: true });
      return;
    }

    if (!name || !email || !phone) {
      res.status(400).json({ ok: false, error: 'Faltan campos obligatorios' });
      return;
    }

    const resend = new Resend(process.env.RESEND_API_KEY);
    const { error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: TO_EMAIL,
      replyTo: email,
      subject: `Nueva solicitud — ${name} (${phone})`,
      html: buildHtml({ name, email, phone, message }),
    });

    if (error) {
      res.status(502).json({ ok: false, error: error.message || 'Error al enviar' });
      return;
    }

    res.status(200).json({ ok: true });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message || 'Error inesperado' });
  }
}

module.exports = handler;
module.exports.buildHtml = buildHtml;
module.exports.toWhatsApp = toWhatsApp;
