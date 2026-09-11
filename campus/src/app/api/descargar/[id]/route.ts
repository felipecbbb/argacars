import { NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'

/**
 * Entrega un PDF del curso. El fichero vive en un bucket privado: aquí se
 * comprueba que quien pide tiene acceso y solo entonces se firma una URL
 * temporal. Así un enlace copiado caduca y no sirve fuera del campus.
 */
export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  // RLS ya limita lesson_files a quien tiene acceso activo: si no lo tiene, no hay fila.
  const { data: fichero } = await supabase
    .from('lesson_files')
    .select('storage_path, title')
    .eq('id', id)
    .maybeSingle()

  if (!fichero) return NextResponse.json({ error: 'No disponible' }, { status: 404 })

  const admin = createAdminClient()
  const { data, error } = await admin.storage
    .from('materiales')
    .createSignedUrl(fichero.storage_path, 60, { download: `${fichero.title}.pdf` })

  if (error || !data) return NextResponse.json({ error: 'No se pudo preparar la descarga' }, { status: 500 })

  return NextResponse.redirect(data.signedUrl)
}
