'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function FormularioNuevaClave() {
  const router = useRouter()
  const [listo, setListo] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [enviando, setEnviando] = useState(false)

  useEffect(() => {
    const supabase = createClient()
    // El enlace del correo deja la sesión abierta al pasar por /auth/callback.
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) setListo(true)
      else setError('El enlace ha caducado o ya se ha usado. Pide otro desde «Recuperar contraseña».')
    })
  }, [])

  async function enviar(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    const clave = String(fd.get('password') ?? '')
    const repetir = String(fd.get('password2') ?? '')

    if (clave.length < 8) return setError('La contraseña necesita ocho caracteres como mínimo.')
    if (clave !== repetir) return setError('Las dos contraseñas no coinciden.')

    setEnviando(true)
    setError(null)
    const supabase = createClient()
    const { error } = await supabase.auth.updateUser({ password: clave })
    setEnviando(false)

    if (error) return setError('No se ha podido guardar. Prueba con otra contraseña.')
    router.push('/')
    router.refresh()
  }

  if (error && !listo) {
    return (
      <p role="alert" className="mt-7 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-4 text-sm leading-relaxed text-red-200">
        {error}
      </p>
    )
  }

  return (
    <form onSubmit={enviar} className="mt-7">
      <label className="block text-xs font-semibold uppercase tracking-wider text-white/50">
        Nueva contraseña
        <input
          name="password" type="password" autoComplete="new-password" required minLength={8}
          placeholder="Mínimo 8 caracteres"
          className="mt-2 w-full rounded-xl border border-white/12 bg-ink px-4 py-3.5 text-[15px] font-normal normal-case tracking-normal text-white placeholder:text-white/25 focus:border-gold/60"
        />
      </label>

      <label className="mt-5 block text-xs font-semibold uppercase tracking-wider text-white/50">
        Repítela
        <input
          name="password2" type="password" autoComplete="new-password" required minLength={8}
          placeholder="••••••••"
          className="mt-2 w-full rounded-xl border border-white/12 bg-ink px-4 py-3.5 text-[15px] font-normal normal-case tracking-normal text-white placeholder:text-white/25 focus:border-gold/60"
        />
      </label>

      {error && (
        <p role="alert" className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {error}
        </p>
      )}

      <button
        type="submit" disabled={enviando || !listo}
        className="mt-6 w-full rounded-full bg-gradient-to-b from-gold-soft to-gold px-6 py-4 text-[15px] font-extrabold uppercase tracking-wide text-ink disabled:opacity-60"
      >
        {enviando ? 'Guardando…' : 'Guardar y entrar'}
      </button>
    </form>
  )
}
