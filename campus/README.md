# Campus ARGA

Plataforma de formación propia, sin Hotmart ni comisiones por venta.
Presupuesto **FC-2026-019**.

**En producción:** https://campus-arga.vercel.app (pendiente de subdominio propio)

## Rutas

| Ruta | Quién la ve |
|---|---|
| `/` | **La página de venta**: hero, el problema, la formación, quiénes somos, temario y bonus. Es estática y sale del CDN. Si ya has entrado, te lleva a `/campus` |
| `/campus` | El campus: continuación, avance y temario |
| `/entrar`, `/recuperar`, `/nueva-clave` | Acceso y contraseña |
| `/clase/[código]`, `/recursos`, `/mentorias`, `/dudas` | Contenido, solo con matrícula activa |
| `/admin/*` | Panel de administración, con su propia cabecera. Solo administradores |

**El administrador no cursa: gestiona.** Al entrar va directo a `/admin`, no al campus. Si quiere
comprobar cómo lo ve un alumno, usa «Ver como alumno» (`/campus?vista=alumno`), que muestra un
aviso y un enlace para volver al panel.

## Página principal, cabecera, pie y cookies

La raíz es la landing de venta montada desde el boceto del cliente. El copy editable está
separado del diseño en `src/lib/contenido-landing.ts`: se cambian módulos, bonus y textos sin
tocar el maquetado.

- **Cabecera** (`components/header.tsx`): fija, se vuelve opaca al bajar, con navegación por
  secciones, «Acceso alumnos» y el botón de venta. En móvil, menú a pantalla completa.
- **Pie** (`components/footer.tsx`): descripción, enlaces a las secciones y a la web principal,
  datos fiscales del titular y los tres enlaces legales.
- **Cookies** (`components/cookies.tsx`): mismo criterio que la web —el Meta Pixel no se carga
  hasta aceptar— y **la misma clave de almacenamiento** (`arga_cookies_consent`), así que quien
  ya decidió en argapremiumcars.es no vuelve a ver el aviso.

Los textos legales no se duplican: se enlazan a los de `argapremiumcars.es`, que son los
oficiales y ya están redactados.

## Rendimiento

Dos cosas lo lastraban y están corregidas:

1. **Las funciones corrían en Washington y la base de datos está en Frankfurt**: cada consulta
   cruzaba el Atlántico, y una página encadena varias. `vercel.json` fija ahora `regions: ["fra1"]`.
2. **Se comprobaba la sesión de más**: el proxy llamaba a Supabase en cada navegación y luego la
   página repetía la consulta. Ahora el proxy solo lee la cookie (sin red), `obtenerSesion()` va
   envuelta en `cache()` de React y perfil y matrícula vienen en una sola consulta.

Además la portada es estática, así que la primera impresión no depende de la base de datos.

Al tocar esto, ojo: **el proxy no autoriza, solo enruta**. Quien protege de verdad son las
páginas (`getUser()`) y las reglas RLS de la base.

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
- **Panel de administración**, con cabecera y navegación propias:
  - *Resumen*: cifras, un bloque de «qué falta» (clases sin vídeo, sin publicar, mentorías sin
    atender) y las últimas cuentas creadas.
  - *Alumnos*: listado con estado, alta manual por invitación, dar y retirar acceso.
  - *Clases y vídeos*: identificador de Bunny, descripción, publicar y adjuntar PDF por clase.
  - *Recursos*: subir, renombrar y borrar los descargables de la zona de recursos.
  - *Mentorías*: abrir huecos, ver reservas y marcarlas como hechas.

Los PDF viven en un bucket privado: la descarga comprueba el acceso y firma una URL que
caduca en 60 segundos, así un enlace copiado no sirve fuera del campus.

## Antes de abrirlo a alumnos reales

En el panel de Supabase (`vercel integration open supabase`), pestaña **Authentication**:

1. **URL Configuration** → *Site URL*: `https://campus-arga.vercel.app` (o el subdominio final)
   y añadir `https://campus-arga.vercel.app/auth/callback` a *Redirect URLs*. Sin esto, los
   enlaces de invitación y de recuperación que salen por correo apuntan a `localhost`.
2. **SMTP Settings** → conectar Resend (ya se usa en la web). El correo por defecto de Supabase
   está limitado a unos pocos envíos por hora: sirve para probar, no para dar de alta alumnos.

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
