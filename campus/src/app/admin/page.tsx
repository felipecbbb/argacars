import Link from 'next/link'
import { createAdminClient } from '@/lib/supabase/server'

export const metadata = { title: 'Resumen' }

const fmt = new Intl.DateTimeFormat('es-ES', { day: '2-digit', month: 'short', timeZone: 'Europe/Madrid' })

export default async function Resumen() {
  const admin = createAdminClient()

  const [activos, cuentas, lecciones, conVideo, publicadas, recursos, porAtender, ultimos] =
    await Promise.all([
      admin.from('enrollments').select('id', { count: 'exact', head: true }).eq('status', 'active'),
      admin.from('profiles').select('id', { count: 'exact', head: true }),
      admin.from('lessons').select('id', { count: 'exact', head: true }),
      admin.from('lessons').select('id', { count: 'exact', head: true }).not('video_id', 'is', null),
      admin.from('lessons').select('id', { count: 'exact', head: true }).eq('published', true),
      admin.from('lesson_files').select('id', { count: 'exact', head: true }).eq('is_resource', true),
      admin.from('bookings').select('id', { count: 'exact', head: true }).eq('status', 'booked'),
      admin.from('profiles').select('full_name, email, created_at').order('created_at', { ascending: false }).limit(5),
    ])

  const nLecciones = lecciones.count ?? 0
  const nVideo = conVideo.count ?? 0
  const sinVideo = Math.max(0, nLecciones - nVideo)

  const cifras = [
    { v: activos.count ?? 0, l: 'alumnos con acceso activo', href: '/admin/alumnos' },
    { v: `${nVideo}/${nLecciones}`, l: 'clases con vídeo subido', href: '/admin/contenido' },
    { v: recursos.count ?? 0, l: 'recursos descargables', href: '/admin/recursos' },
    { v: porAtender.count ?? 0, l: 'mentorías por atender', href: '/admin/mentorias' },
  ]

  // Lo que impide abrir el campus con todo listo
  const pendientes: { texto: string; href: string; grave?: boolean }[] = []
  if (sinVideo > 0) pendientes.push({
    texto: `${sinVideo} ${sinVideo === 1 ? 'clase' : 'clases'} sin vídeo subido`,
    href: '/admin/contenido', grave: true,
  })
  if ((publicadas.count ?? 0) < nLecciones) pendientes.push({
    texto: `${nLecciones - (publicadas.count ?? 0)} clases sin publicar`,
    href: '/admin/contenido',
  })
  if ((porAtender.count ?? 0) > 0) pendientes.push({
    texto: `${porAtender.count} ${porAtender.count === 1 ? 'mentoría' : 'mentorías'} reservadas sin atender`,
    href: '/admin/mentorias',
  })

  return (
    <>
      <h1 className="text-2xl font-black tracking-[-.03em]">Resumen</h1>
      <p className="mt-1.5 text-sm text-white/50">El estado del campus de un vistazo.</p>

      {/* Cifras */}
      <div className="mt-7 grid gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
        {cifras.map((c) => (
          <Link key={c.l} href={c.href}
                className="rounded-2xl border border-white/12 bg-ink-3 p-6 transition hover:border-gold/40">
            <p className="text-[34px] font-black leading-none tracking-[-.04em] text-gold tabular-nums">{c.v}</p>
            <p className="mt-2.5 text-[13px] leading-snug text-white/50">{c.l}</p>
          </Link>
        ))}
      </div>

      <div className="mt-4 grid gap-3.5 lg:grid-cols-2">
        {/* Pendientes */}
        <section className="rounded-2xl border border-white/12 bg-ink-3 p-6">
          <h2 className="text-[11px] font-bold uppercase tracking-[.16em] text-white/45">Qué falta</h2>
          {pendientes.length === 0 ? (
            <p className="mt-4 rounded-xl border border-emerald-400/30 bg-emerald-500/10 px-4 py-3.5 text-sm text-emerald-100">
              Todo al día: las clases tienen vídeo, están publicadas y no hay mentorías sin atender.
            </p>
          ) : (
            <ul className="mt-4 space-y-2.5">
              {pendientes.map((p) => (
                <li key={p.texto}>
                  <Link href={p.href}
                        className="flex items-center gap-3 rounded-xl border border-white/10 bg-ink px-4 py-3.5 text-[14px] transition hover:border-gold/40">
                    <span aria-hidden className={p.grave ? 'text-gold' : 'text-white/35'}>●</span>
                    <span className="flex-1">{p.texto}</span>
                    <span aria-hidden className="text-white/25">›</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Últimas cuentas */}
        <section className="rounded-2xl border border-white/12 bg-ink-3 p-6">
          <div className="flex items-baseline justify-between gap-3">
            <h2 className="text-[11px] font-bold uppercase tracking-[.16em] text-white/45">Últimas cuentas</h2>
            <span className="text-[12px] text-white/35 tabular-nums">{cuentas.count ?? 0} en total</span>
          </div>
          {(ultimos.data?.length ?? 0) === 0 ? (
            <p className="mt-4 text-sm text-white/45">Todavía no hay cuentas creadas.</p>
          ) : (
            <ul className="mt-4 divide-y divide-white/6">
              {ultimos.data!.map((u) => (
                <li key={u.email} className="flex items-center justify-between gap-4 py-3 text-[14px]">
                  <span className="min-w-0 flex-1 truncate">
                    {u.full_name || u.email}
                    {u.full_name && <span className="text-white/35"> · {u.email}</span>}
                  </span>
                  <span className="flex-none text-[12.5px] text-white/35">{fmt.format(new Date(u.created_at))}</span>
                </li>
              ))}
            </ul>
          )}
          <Link href="/admin/alumnos" className="mt-4 inline-block text-[13px] font-semibold text-gold underline underline-offset-4">
            Gestionar alumnos
          </Link>
        </section>
      </div>
    </>
  )
}
