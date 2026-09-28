import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { correoRecordatorio, type CitaCorreo } from '@/lib/correo-agenda'

/**
 * Recordatorio de cita el día antes. Lo llama el cron de Vercel cada hora
 * (vercel.json) con la cabecera Authorization: Bearer CRON_SECRET.
 * Avisa de las citas que empiezan en las próximas 24 h y aún no se avisaron,
 * salvo las reservadas hace menos de 2 h (acaban de recibir la confirmación).
 */
export async function GET(request: Request) {
  const secreto = process.env.CRON_SECRET
  if (!secreto || request.headers.get('authorization') !== `Bearer ${secreto}`) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const ahora = Date.now()
  const admin = createAdminClient()
  const { data: citas, error } = await admin.from('citas').select('*')
    .eq('estado', 'reservada').is('recordatorio_enviado_at', null)
    .gt('empieza', new Date(ahora).toISOString())
    .lte('empieza', new Date(ahora + 24 * 3_600_000).toISOString())
    .lte('created_at', new Date(ahora - 2 * 3_600_000).toISOString())
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  let enviados = 0
  for (const c of citas ?? []) {
    const r = await correoRecordatorio(c as CitaCorreo)
    if (!r.error) {
      await admin.from('citas').update({ recordatorio_enviado_at: new Date().toISOString() }).eq('id', c.id)
      enviados++
    }
  }
  return NextResponse.json({ ok: true, enviados })
}
