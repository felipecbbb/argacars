import { createAdminClient } from '@/lib/supabase/server'
import AbrirHuecos from './abrir'
import { cerrarHueco, marcarHecha } from './actions'

const fmtF = new Intl.DateTimeFormat('es-ES', { weekday: 'short', day: '2-digit', month: 'short', timeZone: 'Europe/Madrid' })
const fmtH = new Intl.DateTimeFormat('es-ES', { hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Madrid' })

export default async function AdminMentorias() {
  const admin = createAdminClient()
  const ahora = new Date().toISOString()

  const [{ data: huecos }, { data: reservas }] = await Promise.all([
    admin.from('availability_slots').select('id, starts_at, ends_at, bookings(id, status)')
      .gte('starts_at', ahora).order('starts_at'),
    admin.from('bookings').select('id, status, topic, created_at, availability_slots(starts_at), profiles!bookings_user_id_fkey(full_name, email)')
      .neq('status', 'cancelled').order('created_at', { ascending: false }).limit(40),
  ])

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-[-.03em]">Mentorías</h1>
          <p className="mt-1.5 text-sm text-white/50">Abre huecos y mira quién ha reservado.</p>
        </div>
        <AbrirHuecos />
      </div>

      <section className="mt-8">
        <h2 className="text-[11px] font-bold uppercase tracking-[.16em] text-white/45">Reservas</h2>
        {(reservas?.length ?? 0) === 0 ? (
          <p className="mt-3 rounded-xl border border-white/10 bg-ink-3 px-5 py-5 text-sm text-white/45">
            Todavía no hay ninguna reservada.
          </p>
        ) : (
          <ul className="mt-3 space-y-2.5">
            {reservas!.map((r) => {
              const slot = r.availability_slots as unknown as { starts_at: string } | null
              const alumno = r.profiles as unknown as { full_name: string | null; email: string } | null
              return (
                <li key={r.id} className="flex flex-wrap items-center gap-x-5 gap-y-2 rounded-xl border border-white/12 bg-ink-3 px-5 py-4">
                  <div className="flex-1">
                    <p className="font-semibold">{alumno?.full_name || alumno?.email}</p>
                    <p className="text-sm text-white/50">
                      {slot ? `${fmtF.format(new Date(slot.starts_at))} · ${fmtH.format(new Date(slot.starts_at))}` : '—'}
                    </p>
                    {r.topic && <p className="mt-1 text-sm text-white/40">«{r.topic}»</p>}
                  </div>
                  {r.status === 'done' ? (
                    <span className="rounded-full bg-white/8 px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-white/45">Hecha</span>
                  ) : (
                    <form action={marcarHecha}>
                      <input type="hidden" name="booking_id" value={r.id} />
                      <button className="rounded-full border border-white/18 px-4 py-2 text-[12.5px] font-semibold text-white/70 hover:border-gold/50">
                        Marcar hecha
                      </button>
                    </form>
                  )}
                </li>
              )
            })}
          </ul>
        )}
      </section>

      <section className="mt-9">
        <h2 className="text-[11px] font-bold uppercase tracking-[.16em] text-white/45">Huecos abiertos</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {(huecos ?? []).map((h) => {
            const cogido = ((h.bookings ?? []) as { status: string }[]).some((b) => b.status !== 'cancelled')
            return (
              <div key={h.id} className={`flex items-center gap-2.5 rounded-xl border px-4 py-2.5 text-[13px] ${
                cogido ? 'border-gold/40 bg-gold/8' : 'border-white/12 bg-ink-3'
              }`}>
                <span className="font-semibold tabular-nums">
                  {fmtF.format(new Date(h.starts_at))} · {fmtH.format(new Date(h.starts_at))}
                </span>
                {cogido ? (
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gold">Reservado</span>
                ) : (
                  <form action={cerrarHueco}>
                    <input type="hidden" name="slot_id" value={h.id} />
                    <button className="text-white/35 hover:text-red-300" title="Quitar hueco">×</button>
                  </form>
                )}
              </div>
            )
          })}
          {(huecos?.length ?? 0) === 0 && (
            <p className="text-sm text-white/45">No hay huecos abiertos. Abre algunos para que los alumnos reserven.</p>
          )}
        </div>
      </section>
    </>
  )
}
