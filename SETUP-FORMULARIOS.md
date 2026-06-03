# Configuración de los formularios (Vercel + Resend)

Los formularios de `index.html` y `contacto.html` envían a `/api/contact`, que
manda un correo con diseño de marca a **info@argapremiumcars.es** con un botón
para responder por **WhatsApp** al teléfono del cliente.

Para que funcione hay que hacer 3 cosas (una sola vez):

## 1. Resend — crear cuenta y API key

1. Entra en https://resend.com y crea cuenta gratis (3.000 emails/mes).
2. Ve a **API Keys** → **Create API Key** → copia la clave (`re_...`).

## 2. Resend — verificar el dominio argapremiumcars.es

1. En Resend ve a **Domains** → **Add Domain** → escribe `argapremiumcars.es`.
2. Resend te dará **3 registros DNS** (un MX/TXT de tipo SPF, un par DKIM, etc.).
3. Entra en el panel DNS de tu dominio y **añade esos registros** tal cual.
4. Vuelve a Resend y pulsa **Verify** (puede tardar unos minutos).

> Mientras no esté verificado, puedes probar cambiando el remitente a
> `onboarding@resend.dev` (variable `FROM_EMAIL` en Vercel), pero solo podrás
> enviarte a ti mismo. Con el dominio verificado, envía desde
> `web@argapremiumcars.es`.

## 3. Vercel — desplegar y añadir variables

1. Entra en https://vercel.com con tu cuenta de GitHub.
2. **Add New → Project** → importa el repo `felipecbbb/argacars`.
3. Framework: **Other** (no toques nada, es web estática + función).
4. En **Settings → Environment Variables** añade:

   | Nombre            | Valor                                            |
   |-------------------|--------------------------------------------------|
   | `RESEND_API_KEY`  | la clave `re_...` del paso 1                      |
   | `FROM_EMAIL`      | `ARGA Premium Cars <web@argapremiumcars.es>`     |
   | `SITE_URL`        | `https://argapremiumcars.es`                     |

5. **Deploy**. Vercel instala las dependencias y publica la web + la función.
6. (Opcional) En **Settings → Domains** conecta `argapremiumcars.es` apuntando
   el dominio a Vercel.

## Probar

Rellena el formulario en la web desplegada. Debería llegar el correo a
info@argapremiumcars.es con el botón verde de WhatsApp y el de email.

## Notas

- El campo `company` es una trampa anti-spam (honeypot): está oculto y si un bot
  lo rellena, el envío se descarta en silencio.
- Para responder por email basta con darle a **Responder** en el correo: el
  remitente (reply-to) ya es el email del cliente.
- El botón de WhatsApp normaliza el teléfono: si el cliente pone 9 dígitos sin
  prefijo, se asume España (+34).
