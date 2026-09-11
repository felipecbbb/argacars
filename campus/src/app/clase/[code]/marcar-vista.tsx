'use client'

import { useState, useTransition } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function MarcarVista({ lessonId, yaVista }: { lessonId: string; yaVista: boolean }) {
  const [vista, setVista] = useState(yaVista)
  const [pendiente, startTransition] = useTransition()
  const router = useRouter()

  async function alternar() {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    if (vista) {
      await supabase.from('lesson_progress').delete()
        .eq('user_id', user.id).eq('lesson_id', lessonId)
      setVista(false)
    } else {
      await supabase.from('lesson_progress')
        .upsert({ user_id: user.id, lesson_id: lessonId }, { onConflict: 'user_id,lesson_id' })
      setVista(true)
    }
    startTransition(() => router.refresh())
  }

  return (
    <button
      onClick={alternar}
      disabled={pendiente}
      className={`mt-5 inline-flex items-center gap-2.5 rounded-full px-5 py-3 text-[14px] font-bold transition disabled:opacity-60 ${
        vista
          ? 'border border-emerald-400/40 bg-emerald-500/12 text-emerald-200'
          : 'border border-white/18 text-white/80 hover:border-gold/50 hover:text-white'
      }`}
    >
      <span aria-hidden>{vista ? '✓' : '○'}</span>
      {vista ? 'Clase completada' : 'Marcar como vista'}
    </button>
  )
}
