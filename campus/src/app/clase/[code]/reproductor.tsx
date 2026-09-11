/**
 * Reproductor de Bunny Stream.
 * El vídeo se sirve desde la librería de ARGA con el dominio del campus en la
 * lista blanca, así que el enlace no funciona incrustado en otro sitio.
 */
export default function Reproductor({ videoId }: { videoId: string | null }) {
  const libreria = process.env.NEXT_PUBLIC_BUNNY_LIBRARY_ID

  if (!videoId || !libreria) {
    return (
      <div className="flex aspect-video items-center justify-center rounded-2xl border border-dashed border-gold/35 bg-ink-3 text-center">
        <div className="px-6">
          <p className="text-[11px] font-bold uppercase tracking-[.16em] text-gold">Pendiente</p>
          <p className="mt-2 text-[15px] font-semibold">El vídeo de esta clase aún no está subido</p>
          <p className="mt-1.5 text-sm text-white/45">
            Se sube desde el panel y aparece aquí automáticamente.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="relative aspect-video overflow-hidden rounded-2xl border border-white/12 bg-black">
      <iframe
        src={`https://iframe.mediadelivery.net/embed/${libreria}/${videoId}?autoplay=false&preload=true`}
        loading="lazy"
        className="absolute inset-0 h-full w-full"
        allow="accelerometer; gyroscope; encrypted-media; picture-in-picture; fullscreen"
        allowFullScreen
        title="Vídeo de la clase"
      />
    </div>
  )
}
