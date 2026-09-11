'use client'

import { useEffect, useState } from 'react'

/**
 * Consentimiento de cookies (RGPD), con el mismo criterio que la web principal:
 * el Meta Pixel NO se carga hasta que se acepta, y la decisión se recuerda.
 * Se comparte la misma clave de almacenamiento que argapremiumcars.es.
 */
const CLAVE = 'arga_cookies_consent'
const PIXEL_ID = '1033012012713811'

declare global {
  interface Window { fbq?: (...args: unknown[]) => void; _argaPixelLoaded?: boolean }
}

function cargarPixel() {
  if (typeof window === 'undefined' || window._argaPixelLoaded) return
  window._argaPixelLoaded = true

  /* eslint-disable */
  ;(function (f: any, b: any, e: any, v: any, n?: any, t?: any, s?: any) {
    if (f.fbq) return
    n = f.fbq = function () { n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments) }
    if (!f._fbq) f._fbq = n
    n.push = n; n.loaded = true; n.version = '2.0'; n.queue = []
    t = b.createElement(e); t.async = true; t.src = v
    s = b.getElementsByTagName(e)[0]; s.parentNode.insertBefore(t, s)
  })(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js')
  /* eslint-enable */

  window.fbq?.('init', PIXEL_ID)
  window.fbq?.('track', 'PageView')
}

function leer(): string | null {
  try { return localStorage.getItem(CLAVE) } catch { return null }
}
function guardar(v: string) {
  try { localStorage.setItem(CLAVE, v) } catch {}
}

export default function Cookies() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const previo = leer()
    if (previo === 'granted') { cargarPixel(); return }
    if (previo === 'denied') return
    // Sin decisión: se enseña el aviso, sin cargar nada de terceros todavía.
    const t = setTimeout(() => setVisible(true), 600)
    return () => clearTimeout(t)
  }, [])

  if (!visible) return null

  function decidir(acepta: boolean) {
    guardar(acepta ? 'granted' : 'denied')
    if (acepta) cargarPixel()
    setVisible(false)
  }

  return (
    <div
      role="dialog"
      aria-live="polite"
      aria-label="Aviso de cookies"
      className="fixed inset-x-3 bottom-3 z-[60] mx-auto max-w-3xl rounded-2xl border border-white/14 bg-ink-2/97 p-5 shadow-[0_24px_60px_-20px_rgba(0,0,0,.9)] backdrop-blur-md sm:inset-x-5 sm:bottom-5 sm:p-6"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <p className="flex-1 text-[13.5px] leading-relaxed text-white/65">
          Usamos cookies propias para que el campus funcione y, si nos dejas, cookies de medición
          para saber qué contenidos ayudan más.{' '}
          <a href="https://argapremiumcars.es/cookies.html" target="_blank" rel="noopener"
             className="text-gold underline underline-offset-4">
            Más detalles
          </a>
          .
        </p>
        <div className="flex flex-none gap-2.5">
          <button
            onClick={() => decidir(false)}
            className="rounded-full border border-white/20 px-5 py-2.5 text-[13px] font-bold text-white/75 transition hover:border-white/40 hover:text-white"
          >
            Rechazar
          </button>
          <button
            onClick={() => decidir(true)}
            className="rounded-full bg-gradient-to-b from-gold-soft to-gold px-6 py-2.5 text-[13px] font-extrabold text-ink transition hover:-translate-y-0.5"
          >
            Aceptar
          </button>
        </div>
      </div>
    </div>
  )
}
