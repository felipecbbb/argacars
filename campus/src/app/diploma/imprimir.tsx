'use client'

export default function Imprimir() {
  return (
    <button onClick={() => window.print()}
            className="rounded-full bg-gradient-to-b from-gold-soft to-gold px-7 py-3.5 text-[14px] font-extrabold uppercase tracking-wide text-ink">
      Descargar en PDF
    </button>
  )
}
