'use server'

import { revalidatePath } from 'next/cache'
import { createAdminClient } from '@/lib/supabase/server'
import { exigirAdmin } from '@/lib/sesion'

export async function guardarLeccion(id: string, formData: FormData): Promise<string> {
  await exigirAdmin()
  const admin = createAdminClient()

  const { error } = await admin.from('lessons').update({
    video_id: String(formData.get('video_id') ?? '').trim() || null,
    description: String(formData.get('description') ?? '').trim() || null,
    published: formData.get('published') === 'on',
  }).eq('id', id)

  revalidatePath('/admin/contenido')
  revalidatePath('/')
  return error ? `No se pudo guardar: ${error.message}` : 'Guardado.'
}

export async function subirPdf(lessonId: string, formData: FormData): Promise<string> {
  await exigirAdmin()

  const file = formData.get('file') as File | null
  const titulo = String(formData.get('title') ?? '').trim()
  if (!file || file.size === 0) return 'No se ha elegido ningún archivo.'
  if (file.type !== 'application/pdf') return 'Solo se aceptan PDF.'

  const admin = createAdminClient()
  const ruta = `lecciones/${lessonId}/${Date.now()}-${file.name.replace(/[^\w.-]/g, '_')}`

  const { error: errSubida } = await admin.storage
    .from('materiales')
    .upload(ruta, file, { contentType: 'application/pdf', upsert: false })

  if (errSubida) return `No se pudo subir: ${errSubida.message}`

  const { error } = await admin.from('lesson_files').insert({
    lesson_id: lessonId,
    title: titulo || file.name.replace(/\.pdf$/i, ''),
    storage_path: ruta,
    size_bytes: file.size,
    is_resource: formData.get('is_resource') === 'on',
  })

  revalidatePath('/admin/contenido')
  revalidatePath('/recursos')
  return error ? `Subido, pero no se registró: ${error.message}` : 'PDF subido.'
}
