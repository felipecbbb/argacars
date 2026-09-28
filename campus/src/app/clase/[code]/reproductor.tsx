'use client'

import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

/** API player.js que expone el reproductor de Bunny (se carga de su CDN). */
type PlayerJs = {
  on: (evento: string, fn: (datos?: { seconds?: number; duration?: number }) => void) => void
  setCurrentTime: (s: number) => void
}
declare global {
  interface Window { playerjs?: { Player: new (el: HTMLIFrameElement) => PlayerJs } }
}

const SCRIPT = 'https://assets.mediadelivery.net/playerjs/player-0.1.0.min.js'
const GUARDAR_CADA_S = 15
const COMPLETA_A = 0.9 // a partir del 90 % se da la clase por vista (el final suele ser la despedida)

function cargarPlayerJs(): Promise<void> {
  if (window.playerjs) return Promise.resolve()
  return new Promise((ok, ko) => {
    const previo = document.querySelector<HTMLScriptElement>(`script[src="${SCRIPT}"]`)
    const s = previo ?? Object.assign(document.createElement('script'), { src: SCRIPT, async: true })
    s.addEventListener('load', () => ok())
    s.addEventListener('error', () => ko(new Error('No carga player.js')))
    if (!previo) document.head.appendChild(s)
  })
}

/**
 * Reproductor de Bunny Stream.
 * El vídeo se sirve desde la librería de ARGA con el dominio del campus en la
 * lista blanca, así que el enlace no funciona incrustado en otro sitio.
 * Va guardando por dónde va el alumno (para la barra de progreso y para
 * retomar donde lo dejó) y marca la clase como vista al llegar casi al final.
 */
export default function Reproductor({ videoId, lessonId, inicio = 0, yaVista = false }: {
  videoId: string | null
  lessonId: string
  inicio?: number
  yaVista?: boolean
}) {
  const libreria = process.env.NEXT_PUBLIC_BUNNY_LIBRARY_ID
  const marco = useRef<HTMLIFrameElement>(null)
  const router = useRouter()

  useEffect(() => {
    if (!videoId || !libreria || !marco.current) return
    let vivo = true
    let ultimoGuardado = -GUARDAR_CADA_S
    let completada = yaVista
    let duracion = 0
    const supabase = createClient()

    async function guardar(seconds: number, duration?: number) {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      await supabase.from('lesson_watch').upsert({
        user_id: user.id, lesson_id: lessonId,
        seconds: Math.floor(seconds),
        duration_secs: duration ? Math.round(duration) : null,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id,lesson_id' })

      if (!completada && duration && seconds / duration >= COMPLETA_A) {
        completada = true
        await supabase.from('lesson_progress')
          .upsert({ user_id: user.id, lesson_id: lessonId }, { onConflict: 'user_id,lesson_id' })
        router.refresh()
      }
    }

    cargarPlayerJs().then(() => {
      if (!vivo || !marco.current || !window.playerjs) return
      const player = new window.playerjs.Player(marco.current)
      player.on('ready', () => {
        // Retoma donde lo dejó, salvo que ya casi lo hubiera terminado
        if (inicio > 5) player.setCurrentTime(inicio)
        player.on('timeupdate', (d) => {
          if (d?.duration) duracion = d.duration
          if (!d?.seconds || d.seconds - ultimoGuardado < GUARDAR_CADA_S) return
          ultimoGuardado = d.seconds
          void guardar(d.seconds, d.duration)
        })
        player.on('ended', () => { if (duracion) void guardar(duracion, duracion) })
      })
    }).catch(() => { /* sin player.js el vídeo se ve igual; solo no se guarda el avance */ })

    return () => { vivo = false }
  }, [videoId, libreria, lessonId, inicio, yaVista, router])

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
        ref={marco}
        src={`https://iframe.mediadelivery.net/embed/${libreria}/${videoId}?autoplay=false&preload=true`}
        className="absolute inset-0 h-full w-full"
        allow="accelerometer; gyroscope; encrypted-media; picture-in-picture; fullscreen"
        allowFullScreen
        title="Vídeo de la clase"
      />
    </div>
  )
}
