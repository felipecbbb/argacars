import { Fragment } from 'react'

// [texto](https://…) o una dirección suelta https://…
const ENLACE = /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)|(https?:\/\/[^\s<]+[^\s<.,;:!?)»"'])/g

/**
 * Pinta el texto que escribe el admin (descripción de una clase) respetando los
 * saltos de línea y convirtiendo en enlace tanto [texto](url) como las
 * direcciones sueltas. Sin HTML: nada de lo escrito se interpreta como código.
 */
export default function TextoConEnlaces({ texto, className }: { texto: string; className?: string }) {
  const partes: React.ReactNode[] = []
  let desde = 0
  for (const m of texto.matchAll(ENLACE)) {
    const i = m.index ?? 0
    if (i > desde) partes.push(texto.slice(desde, i))
    const url = m[2] ?? m[3]
    const visible = m[1] ?? m[3]
    partes.push(
      <a key={i} href={url} target="_blank" rel="noopener noreferrer"
         className="break-words font-semibold text-gold underline underline-offset-4 hover:text-gold-soft">
        {visible}
      </a>
    )
    desde = i + m[0].length
  }
  if (desde < texto.length) partes.push(texto.slice(desde))

  return <div className={`whitespace-pre-line ${className ?? ''}`}>{partes.map((p, k) => <Fragment key={k}>{p}</Fragment>)}</div>
}
