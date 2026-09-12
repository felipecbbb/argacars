import { createAdminClient } from '@/lib/supabase/server'
import Acciones from './acciones'
import { comoLista } from '@/lib/sesion'

const fmt = new Intl.DateTimeFormat('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })

export default async function Alumnos() {
  const admin = createAdminClient()
  const { data: perfiles } = await admin
    .from('profiles')
    .select('id, email, full_name, role, created_at, enrollments(status, source, purchased_at)')
    .order('created_at', { ascending: false })

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-[-.03em]">Alumnos</h1>
          <p className="mt-1.5 text-sm text-white/50">Quién ha comprado y quién tiene el acceso abierto.</p>
        </div>
        <Acciones modo="alta" />
      </div>

      <div className="mt-7 overflow-x-auto rounded-2xl border border-white/12">
        <table className="w-full min-w-[680px] text-left text-sm">
          <thead className="bg-ink-3 text-[11px] uppercase tracking-wider text-white/45">
            <tr>
              <th className="px-5 py-3.5 font-bold">Alumno</th>
              <th className="px-5 py-3.5 font-bold">Alta</th>
              <th className="px-5 py-3.5 font-bold">Acceso</th>
              <th className="px-5 py-3.5 font-bold">Origen</th>
              <th className="px-5 py-3.5" />
            </tr>
          </thead>
          <tbody className="divide-y divide-white/6">
            {(perfiles ?? []).map((p) => {
              const m = comoLista(p.enrollments as never)[0] as { status: string; source: string } | undefined
              const activo = m?.status === 'active'
              return (
                <tr key={p.id}>
                  <td className="px-5 py-4">
                    <p className="font-semibold">{p.full_name || '—'}</p>
                    <p className="text-white/45">{p.email}</p>
                  </td>
                  <td className="px-5 py-4 text-white/55">{fmt.format(new Date(p.created_at))}</td>
                  <td className="px-5 py-4">
                    <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider ${
                      activo ? 'bg-emerald-500/15 text-emerald-300' : 'bg-white/8 text-white/45'
                    }`}>
                      {activo ? 'Activo' : p.role === 'admin' ? 'Admin' : 'Sin acceso'}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-white/45">{m?.source ?? '—'}</td>
                  <td className="px-5 py-4 text-right">
                    <Acciones modo="alternar" userId={p.id} activo={activo} />
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </>
  )
}
