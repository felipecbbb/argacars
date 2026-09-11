import Cabecera from '@/components/cabecera'
import { exigirAcceso } from '@/lib/sesion'
import Reserva from './reserva'
import { anular } from './actions'

export const dynamic = 'force-dynamic'

const fmtFecha = new Intl.DateTimeFormat('es-ES', {
  weekday: 'long', day: 'numeric', month: 'long',
  timeZone: 'Europe/Madrid',
})
const fmtHora = new Intl.DateTimeFormat('es-ES', {
  hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Madrid',
})

export default async function Mentorias() {
  const { supabase, esAdmin, user } = await exigirAcceso()
  const ahora = new Date().toISOString()

  const [{ data: huecos }, { data: misReservas }] = await Promise.all([
    supabase.from('availability_slots').select('id, starts_at, ends_at, bookings(id, status)')
      .gte('starts_at', ahora).order('starts_at').limit(60),
    supabase.from('bookings').select('id, status, topic, availability_slots(starts_at, ends_at)')
      .eq('user_id', user.id).order('created_at', { ascending: false }),
  ])

  const vivas = (misReservas ?? []).filter((r) => r.status !== 'cancelled')
  const restantes = Math.max(0, 3 - vivas.length)

  // Un hueco está libre si no tiene reserva viva
  const libres = (huecos ?? []).filter((h) => {
    const reservas = (h.bookings ?? []) as { status: string }[]
    return !reservas.some((b) => b.status !== 'cancelled')
  })

  // Agrupados por día, que es como se elige una llamada
  const porDia = new Map<string, typeof libres>()
  for (const h of libres) {
    const clave = fmtFecha.format(new Date(h.starts_at))
    porDia.set(clave, [...(porDia.get(clave) ?? []), h])
  }

  return (
    <>
      <Cabecera esAdmin={esAdmin} />
      <main className="mx-auto max-w-4xl px-5 py-9 sm:py-12">
        <p className="text-[11px] font-bold uppercase tracking-[.2em] text-gold">Mentorías 1 a 1</p>
        <h1 className="mt-3 text-[clamp(24px,4.6vw,36px)] font-black leading-tight tracking-[-.035em]">
          30 minutos de llamada <span className="text-gold">privada con nosotros</span>
        </h1>
        <p className="mt-3 max-w-prose text-[15px] text-white/55">
          Tienes tres incluidas con la formación y no caducan. Elige el hueco que te venga bien.
        </p>

        <div className="mt-6 inline-flex items-center gap-3 rounded-full border border-gold/35 bg-gold/8 px-5 py-2.5">
          <span className="text-2xl font-black tabular-nums text-gold">{restantes}</span>
          <span className="text-sm text-white/70">
            {restantes === 1 ? 'mentoría disponible' : 'mentorías disponibles'} de 3
          </span>
        </div>

        {/* Mis reservas */}
        {vivas.length > 0 && (
          <section className="mt-9">
            <h2 className="text-[11px] font-bold uppercase tracking-[.16em] text-white/45">Tus llamadas</h2>
            <ul className="mt-3 space-y-2.5">
              {vivas.map((r) => {
                const slot = r.availability_slots as unknown as { starts_at: string; ends_at: string } | null
                if (!slot) return null
                const d = new Date(slot.starts_at)
                return (
                  <li key={r.id} className="flex flex-wrap items-center gap-x-4 gap-y-2 rounded-xl border border-white/12 bg-ink-3 px-5 py-4">
                    <div className="flex-1">
                      <p className="text-[15px] font-bold capitalize">{fmtFecha.format(d)}</p>
                      <p className="text-sm text-white/50">
                        {fmtHora.format(d)} – {fmtHora.format(new Date(slot.ends_at))} · hora peninsular
                      </p>
                      {r.topic && <p className="mt-1.5 text-sm text-white/45">«{r.topic}»</p>}
                    </div>
                    {r.status === 'done' ? (
                      <span className="rounded-full bg-white/8 px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-white/50">
                        Hecha
                      </span>
                    ) : (
                      <form action={anular}>
                        <input type="hidden" name="booking_id" value={r.id} />
                        <button className="rounded-full border border-white/18 px-4 py-2 text-[13px] font-semibold text-white/60 hover:border-red-400/50 hover:text-red-200">
                          Anular
                        </button>
                      </form>
                    )}
                  </li>
                )
              })}
            </ul>
          </section>
        )}

        {/* Huecos libres */}
        <section className="mt-10">
          <h2 className="text-[11px] font-bold uppercase tracking-[.16em] text-white/45">Huecos disponibles</h2>

          {restantes === 0 ? (
            <p className="mt-4 rounded-xl border border-white/10 bg-ink-3 px-5 py-5 text-sm text-white/55">
              Ya has usado tus tres mentorías. Si necesitas otra llamada, escríbenos por el canal de la comunidad.
            </p>
          ) : porDia.size === 0 ? (
            <div className="mt-4 rounded-2xl border border-dashed border-gold/35 bg-ink-3 p-8 text-center">
              <p className="text-[11px] font-bold uppercase tracking-[.16em] text-gold">Sin huecos ahora mismo</p>
              <p className="mt-2 text-[15px] font-semibold">Todavía no hay fechas abiertas</p>
              <p className="mt-1.5 text-sm text-white/45">Abrimos huecos nuevos cada semana. Vuelve a mirar en unos días.</p>
            </div>
          ) : (
            <Reserva porDia={Array.from(porDia.entries()).map(([dia, hs]) => ({
              dia,
              huecos: hs.map((h) => ({
                id: h.id,
                hora: `${fmtHora.format(new Date(h.starts_at))} – ${fmtHora.format(new Date(h.ends_at))}`,
              })),
            }))} />
          )}
        </section>
      </main>
    </>
  )
}
