'use server'

import { revalidatePath } from 'next/cache'
import { createAdminClient } from '@/lib/supabase/server'
import { exigirAdmin } from '@/lib/sesion'

const BUCKET = 'materiales'

export async function subirRecurso(formData: FormData): Promise<string> {
  await exigirAdmin()

  const file = formData.get('file') as File | null
  const titulo = String(formData.get('title') ?? '').trim()
  const posicion = Number(formData.get('position') ?? 0)
  if (!file || file.size === 0) return 'No se ha elegido ningún archivo.'
  if (file.type !== 'application/pdf') return 'Solo se aceptan PDF.'

  const admin = createAdminClient()
  const ruta = `recursos/${Date.now()}-${file.name.replace(/[^\w.-]/g, '_')}`

  const { error: errSubida } = await admin.storage
    .from(BUCKET).upload(ruta, file, { contentType: 'application/pdf', upsert: false })
  if (errSubida) return `No se pudo subir: ${errSubida.message}`

  const { error } = await admin.from('lesson_files').insert({
    lesson_id: null,
    title: titulo || file.name.replace(/\.pdf$/i, ''),
    storage_path: ruta,
    size_bytes: file.size,
    position: posicion,
    is_resource: true,
  })

  revalidatePath('/admin/recursos')
  revalidatePath('/recursos')
  return error ? `Subido, pero no se registró: ${error.message}` : 'Recurso añadido.'
}

export async function renombrarRecurso(formData: FormData) {
  await exigirAdmin()
  const id = String(formData.get('id') ?? '')
  const titulo = String(formData.get('title') ?? '').trim()
  if (!id || !titulo) return

  const admin = createAdminClient()
  await admin.from('lesson_files').update({ title: titulo }).eq('id', id)
  revalidatePath('/admin/recursos')
  revalidatePath('/recursos')
}

export async function borrarRecurso(formData: FormData) {
  await exigirAdmin()
  const id = String(formData.get('id') ?? '')
  if (!id) return

  const admin = createAdminClient()
  // Primero el fichero del almacén y después la ficha, para no dejar huérfanos.
  const { data: ficha } = await admin
    .from('lesson_files').select('storage_path').eq('id', id).maybeSingle()
  if (ficha?.storage_path) await admin.storage.from(BUCKET).remove([ficha.storage_path])
  await admin.from('lesson_files').delete().eq('id', id)

  revalidatePath('/admin/recursos')
  revalidatePath('/recursos')
}

/** Guarda el orden en que quedaron los recursos tras arrastrarlos. */
export async function reordenarRecursos(ids: string[]): Promise<string> {
  await exigirAdmin()
  if (ids.length === 0) return 'Nada que ordenar.'

  const admin = createAdminClient()
  // Una actualización por fila: son pocas y así no hace falta un procedimiento.
  await Promise.all(
    ids.map((id, i) => admin.from('lesson_files').update({ position: i + 1 }).eq('id', id))
  )

  revalidatePath('/admin/recursos')
  revalidatePath('/recursos')
  return 'Orden guardado.'
}
