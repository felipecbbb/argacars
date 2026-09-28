'use client'

import Image from 'next/image'
import { useEffect, useState } from 'react'

/** Una tarjeta del carrusel: la foto vertical de una entrega o, si aún no hay, el texto de una reseña. */
export type Tarjeta =
  | { tipo: 'foto'; src: string; alt: string }
  | { tipo: 'texto'; autor: string; cuando: string; texto: string }

const CADA_MS = 4500

/**
 * Carrusel que va pasando solo, de uno en uno. Enseña dos tarjetas a la vez en
 * escritorio y una y media en móvil. Se para al pasar el ratón o al tocarlo.
 */
export default function CarruselResenas({ tarjetas }: { tarjetas: Tarjeta[] }) {
  const [i, setI] = useState(0)
  const [parado, setParado] = useState(false)
  const total = tarjetas.length

  useEffect(() => {
    if (parado || total < 3) return
    const t = setInterval(() => setI((n) => (n + 1) % total), CADA_MS)
    return () => clearInterval(t)
  }, [parado, total])

  if (total === 0) return null

  // Se duplica la lista para que al llegar al final siga sin salto visible.
  const cinta = [...tarjetas, ...tarjetas]

  return (
    <div
      className="relative min-w-0"
      onMouseEnter={() => setParado(true)}
      onMouseLeave={() => setParado(false)}
      onTouchStart={() => setParado(true)}
    >
      <div className="overflow-hidden">
        <ul
          className="flex gap-4 transition-transform duration-700 ease-[cubic-bezier(.2,.7,.2,1)] [--ancho:calc((100%-1rem)/1.35)] sm:[--ancho:calc((100%-1rem)/2)]"
          style={{ transform: `translateX(calc(${-i} * (var(--ancho) + 1rem)))` }}
        >
          {cinta.map((t, k) => (
            <li key={k} className={`w-[var(--ancho)] flex-none overflow-hidden rounded-2xl border border-ink/8 bg-white shadow-[0_18px_40px_-24px_rgba(0,0,0,.45)] ${
              t.tipo === 'foto' ? 'aspect-[9/16]' : 'min-h-[300px]'
            }`}
                aria-hidden={k >= total || undefined}>
              {t.tipo === 'foto' ? (
                <div className="relative h-full w-full">
                  <Image src={t.src} alt={t.alt} fill className="object-cover" sizes="(max-width: 640px) 75vw, 300px" />
                </div>
              ) : (
                <figure className="flex h-full min-h-[300px] flex-col p-6 sm:p-7">
                  <div className="flex items-center justify-between">
                    <span className="tracking-[.12em] text-[#f5b400]" aria-label="5 estrellas">★★★★★</span>
                    <GoogleG className="h-5 w-5" />
                  </div>
                  <blockquote className="mt-5 flex-1 text-[15.5px] leading-relaxed text-ink/80">«{t.texto}»</blockquote>
                  <figcaption className="mt-4 text-[13px] font-bold text-ink">
                    {t.autor} <span className="block font-normal text-ink/45">{t.cuando} · Google</span>
                  </figcaption>
                </figure>
              )}
            </li>
          ))}
        </ul>
      </div>

      {total > 2 && (
        <div className="mt-5 flex items-center justify-between gap-4">
          <div className="flex gap-1.5" role="tablist" aria-label="Elegir reseña">
            {tarjetas.map((_, k) => (
              <button key={k} role="tab" aria-selected={k === i % total} aria-label={`Reseña ${k + 1}`}
                      onClick={() => { setI(k); setParado(true) }}
                      className={`h-1.5 rounded-full transition-all ${k === i % total ? 'w-6 bg-ink' : 'w-1.5 bg-ink/20 hover:bg-ink/40'}`} />
            ))}
          </div>
          <div className="flex gap-2">
            <button onClick={() => { setI((n) => (n - 1 + total) % total); setParado(true) }} aria-label="Anterior"
                    className="grid h-10 w-10 place-items-center rounded-full border border-ink/15 text-ink/70 transition hover:border-ink/40 hover:text-ink">←</button>
            <button onClick={() => { setI((n) => (n + 1) % total); setParado(true) }} aria-label="Siguiente"
                    className="grid h-10 w-10 place-items-center rounded-full border border-ink/15 text-ink/70 transition hover:border-ink/40 hover:text-ink">→</button>
          </div>
        </div>
      )}
    </div>
  )
}

/** La «G» de Google. */
export function GoogleG({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" aria-hidden className={className}>
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
    </svg>
  )
}
