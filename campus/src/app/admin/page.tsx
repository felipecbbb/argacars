import { createAdminClient } from '@/lib/supabase/server'

export default async function Resumen() {
  const admin = createAdminClient()

  const [alumnos, activos, lecciones, conVideo, reservas] = await Promise.all([
    admin.from('profiles').select('id', { count: 'exact', head: true }),
    admin.from('enrollments').select('id', { count: 'exact', head: true }).eq('status', 'active'),
    admin.from('lessons').select('id', { count: 'exact', head: true }),
    admin.from('lessons').select('id', { count: 'exact', head: true }).not('video_id', 'is', null),
    admin.from('bookings').select('id', { count: 'exact', head: true }).eq('status', 'booked'),
  ])

  const tarjetas = [
    { v: activos.count ?? 0, l: 'alumnos con acceso activo' },
    { v: alumnos.count ?? 0, l: 'cuentas creadas' },
    { v: `${conVideo.count ?? 0}/${lecciones.count ?? 0}`, l: 'clases con vídeo subido' },
    { v: reservas.count ?? 0, l: 'mentorías por atender' },
  ]

  return (
    <>
      <h1 className="text-2xl font-black tracking-[-.03em]">Resumen</h1>
      <div className="mt-6 grid gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
        {tarjetas.map((t) => (
          <div key={t.l} className="rounded-2xl border border-white/12 bg-ink-3 p-6">
            <p className="text-[34px] font-black leading-none tracking-[-.04em] text-gold tabular-nums">{t.v}</p>
            <p className="mt-2.5 text-[13px] leading-snug text-white/50">{t.l}</p>
          </div>
        ))}
      </div>
    </>
  )
}
