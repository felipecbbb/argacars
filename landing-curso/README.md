# Landing provisional · Recurso gratuito ARGA

Landing temporal para captar gente al grupo de WhatsApp. Es la versión mínima que pidió
Alex por audio (02/09/2026): logo, foto de fondo oscurecida, vídeo, botón y una línea.
La landing "tocha" con todo el copy vendrá después.

**En línea:** https://landing-curso-smoky.vercel.app

## Falta una cosa (la envía Alex)

- **El enlace de la comunidad de WhatsApp.** Sustituye el `href="#"` del `<a class="cta">`.
  Está señalado con un comentario en el HTML.

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

Tras cualquier cambio: `vercel deploy --yes` desde esta carpeta.

## Assets

- `assets/logo-arga-blanco.png` — el logo en blanco (copia de `presentaciones/assets/logo.png`)
- `assets/hero-arga.jpg` — la foto del Urus y el G63, recomprimida desde `assets/img/life/hermanos.jpg`

La foto es vertical, así que en pantallas anchas se reencuadra (`object-position: center 58%`
a partir de 900px) para que entren los dos coches por los laterales en vez de solo el cielo.
