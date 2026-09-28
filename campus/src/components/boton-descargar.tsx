/** Botón «Descargar» con su círculo y flecha, para que se vea claro dónde pulsar. */
export default function BotonDescargar({ claro = false }: { claro?: boolean }) {
  return (
    <span className={`inline-flex flex-none items-center gap-2 text-[12.5px] font-bold ${claro ? 'text-ink' : 'text-gold'}`}>
      <span className="hidden sm:inline">Descargar</span>
      <span aria-hidden className={`grid h-8 w-8 place-items-center rounded-full border ${
        claro ? 'border-ink/25' : 'border-gold/50 bg-gold/10 transition group-hover:bg-gold group-hover:text-ink'
      }`}>
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 4v11m0 0-4.5-4.5M12 15l4.5-4.5M5 20h14" />
        </svg>
      </span>
    </span>
  )
}
