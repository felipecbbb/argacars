# Landing provisional · Recurso gratuito ARGA

Landing temporal para captar gente al grupo de WhatsApp. Es la versión mínima que pidió
Alex por audio (02/09/2026): logo, foto de fondo oscurecida, vídeo, botón y una línea.
La landing "tocha" con todo el copy vendrá después.

**En línea:** https://comunidad.argapremiumcars.es
(la URL de Vercel, https://landing-curso-smoky.vercel.app, sigue funcionando)

## Dominio

`argapremiumcars.es` usa los nameservers de Vercel (`ns1/ns2.vercel-dns.com`), así que el
subdominio se crea desde Vercel y **no hay que tocar Hostinger**: el registro DNS y el
certificado se generan solos.

```bash
cd landing-curso && vercel domains add comunidad.argapremiumcars.es
```

El `.com` está aparcado en Hostinger (nameservers `dns-parking.com`) y no pasa por Vercel.

## Estado

Completa y operativa. El botón apunta al grupo de WhatsApp
`https://chat.whatsapp.com/LjdNjRDenmoLtEz1I8I3NC` («4 OCTUBRE · 19:00 | ARGA Premium Cars»).
Si el grupo cambia o se regenera el enlace de invitación, hay que actualizar el `href` del
`<a class="cta">` y volver a desplegar.

## El vídeo (VSL)

El original venía en 4K vertical (2160x3840), HEVC, 259 MB y **con la imagen girada 90°
dentro del lienzo** (sin metadato de rotación, así que ningún reproductor lo corregía solo).
Se ha enderezado y transcodificado:

```bash
ffmpeg -i original.mp4 -vf "transpose=2,scale=1280:720:flags=lanczos" \
  -c:v libx264 -profile:v high -preset slow -crf 23 -maxrate 2200k -bufsize 4400k \
  -pix_fmt yuv420p -g 60 -c:a aac -b:a 128k -ac 2 -movflags +faststart assets/vsl.mp4
```

Resultado: `assets/vsl.mp4`, H.264 1280x720 horizontal, 55 s, 16 MB. El `+faststart` permite
que empiece a reproducirse mientras se descarga, y `preload="metadata"` evita bajarlo entero
al abrir la página. `assets/vsl-poster.jpg` es el frame del segundo 0,5.

## Autoplay con sonido

Alex lo pidió: que suene solo al entrar. **Ningún navegador lo permite** — Chrome, Safari y
Firefox bloquean el autoplay con audio salvo que el visitante ya tenga historial de
interacción con el dominio (Media Engagement Index). No hay forma de saltárselo desde el
código, le pasa igual a YouTube.

Lo que hace la landing, que es el patrón que usan las VSL que funcionan:

1. Intenta arrancar **con sonido**. Si el navegador lo permite (visitante recurrente), suena
   directamente y no aparece ninguna capa.
2. Si lo bloquea, arranca **silenciado** —eso sí está siempre permitido— en bucle, y muestra
   una capa dorada «Toca para activar el sonido».
3. Al primer toque en **cualquier** parte de la página, quita el mute, desactiva el bucle,
   **rebobina al segundo 0** para que no se pierda el arranque del discurso y muestra los
   controles.

Verificado en los dos escenarios con `--autoplay-policy` de Chrome.

Tras cualquier cambio: `vercel deploy --yes` desde esta carpeta.

## Assets

- `assets/logo-arga-blanco.png` — el logo en blanco (copia de `presentaciones/assets/logo.png`)
- `assets/hero-arga.jpg` — la foto del Urus y el G63, recomprimida desde `assets/img/life/hermanos.jpg`

La foto es vertical, así que en pantallas anchas se reencuadra (`object-position: center 58%`
a partir de 900px) para que entren los dos coches por los laterales en vez de solo el cielo.
