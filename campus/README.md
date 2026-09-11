# Campus ARGA

Plataforma de formación propia, sin Hotmart ni comisiones por venta.
Presupuesto **FC-2026-019**.

**En producción:** https://campus-arga.vercel.app (pendiente de subdominio propio)

## Stack

| Pieza | Elección | Por qué |
|---|---|---|
| App | Next.js 16 (App Router) en Vercel | Mismo sitio donde ya vive la web |
| Base de datos, login y PDFs | **Supabase** (Marketplace, plan gratuito, Frankfurt) | Postgres + cuentas + ficheros en un solo servicio y una sola factura |
| Vídeo | Bunny Stream | Reproductor propio, sin marcas de terceros y con bloqueo por dominio |

**No había nada que reutilizar:** `argapremiumcars.es` es HTML estático con una única función
para el formulario de contacto. Ni el blog ni el catálogo tienen base de datos.

## Base de datos

`profiles` · `enrollments` (quién tiene acceso) · `modules` · `lessons` · `lesson_files` ·
`lesson_progress` · `availability_slots` y `bookings` (mentorías).

Las ocho tablas llevan RLS activo. El contenido solo es visible con matrícula activa, cada
alumno solo ve sus propios datos y el rol de administrador vive en una tabla, nunca en los
metadatos del usuario (que el propio usuario puede editar).

Comprobado: alumno con acceso ve los 8 módulos; al retirarle el acceso pasa a ver 0; sin
sesión, 0; y un alumno consultando la tabla de perfiles solo obtiene el suyo.

Migraciones en `supabase/migrations/`. Para aplicarlas:

```bash
export $(grep -E '^POSTGRES_URL_NON_POOLING=' .env.local | sed 's/"//g')
psql "$POSTGRES_URL_NON_POOLING" -v ON_ERROR_STOP=1 -f supabase/migrations/0001_campus.sql
```

## Qué hay hecho

- **Acceso**: entrar con correo y contraseña, rutas protegidas, recuperación de contraseña.
- **Campus**: los 8 módulos con sus 20 clases, barra de avance, marcar clase como vista.
- **Clase**: reproductor de Bunny, descripción y PDF adjuntos.
- **Recursos**: todos los descargables juntos.
- **Mentorías**: calendario propio. ARGA abre tramos de 30 min desde el panel y el alumno
  reserva. Las tres del bonus se controlan solas: a la cuarta, la base de datos lo impide.
- **Dudas**: enlace al canal de la comunidad.
- **Panel**: resumen, alta manual de alumnos por invitación, dar y retirar acceso, cargar
  vídeos y PDF por clase, y gestión de huecos y reservas.

Los PDF viven en un bucket privado: la descarga comprueba el acceso y firma una URL que
caduca en 60 segundos, así un enlace copiado no sirve fuera del campus.

## Qué falta

1. **Bunny Stream**: crear la cuenta a nombre de ARGA, subir los vídeos y poner
   `NEXT_PUBLIC_BUNNY_LIBRARY_ID`. Hasta entonces cada clase muestra un aviso en su sitio.
2. **Pago con Stripe**: por decisión del cliente va lo último. El alta manual ya funciona.
3. **Correo de bienvenida** con Resend (la web ya lo usa).
4. **Subdominio** definitivo y quitar el `noindex`.
5. **Contenido**: vídeos, descripciones y los PDF de las guías.

## Cuentas de prueba

- Administrador: `felipegestion03@gmail.com` / `CampusArga2026!`
- Alumno: `alumno.prueba@argapremiumcars.es` / `Alumno2026!`

Cambiar ambas antes de abrirlo a alumnos reales.
