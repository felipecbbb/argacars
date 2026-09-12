import { createAdminClient } from '@/lib/supabase/server'
import SubirRecurso from './subir'
import Lista from './lista'

export const metadata = { title: 'Recursos' }

export default async function AdminRecursos() {
  const admin = createAdminClient()
  const { data } = await admin
    .from('lesson_files')
    .select('id, title, size_bytes, position, lessons(code)')
    .eq('is_resource', true)
    .order('position')

  const recursos = (data ?? []).map((r) => ({
    id: r.id as string,
    title: r.title as string,
    size_bytes: r.size_bytes as number | null,
    clase: (r.lessons as unknown as { code: string } | null)?.code ?? null,
  }))

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-[-.03em]">Recursos descargables</h1>
          <p className="mt-1.5 text-sm text-white/50">
            Las guías y plantillas que el alumno ve en su zona de recursos. Arrástralos para
            cambiar el orden en que los verá.
          </p>
        </div>
        <SubirRecurso siguiente={recursos.length + 1} />
      </div>

      {recursos.length === 0 ? (
        <p className="mt-8 rounded-2xl border border-dashed border-gold/35 bg-ink-3 p-8 text-center text-sm text-white/50">
          Todavía no hay recursos. Sube el primero con el botón de arriba.
        </p>
      ) : (
        <Lista inicial={recursos} />
      )}
    </>
  )
}
