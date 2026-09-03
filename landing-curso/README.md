# Landing provisional · Recurso gratuito ARGA

Landing temporal para captar gente al grupo de WhatsApp. Es la versión mínima que pidió
Alex por audio (02/09/2026): logo, foto de fondo oscurecida, vídeo, botón y una línea.
La landing "tocha" con todo el copy vendrá después.

**En línea:** https://landing-curso-smoky.vercel.app

## Faltan dos cosas (las envía Alex)

1. **El vídeo** (~2 min). Déjalo en `assets/video.mp4`, borra el bloque `<div class="ph">…</div>`
   y descomenta la línea `<video>` que hay justo encima. Está señalado con un comentario.
2. **El enlace de la comunidad de WhatsApp.** Sustituye el `href="#"` del `<a class="cta">`.
   También señalado con un comentario.

Tras cualquier cambio: `vercel deploy --yes` desde esta carpeta.

## Assets

- `assets/logo-arga-blanco.png` — el logo en blanco (copia de `presentaciones/assets/logo.png`)
- `assets/hero-arga.jpg` — la foto del Urus y el G63, recomprimida desde `assets/img/life/hermanos.jpg`

La foto es vertical, así que en pantallas anchas se reencuadra (`object-position: center 58%`
a partir de 900px) para que entren los dos coches por los laterales en vez de solo el cielo.
