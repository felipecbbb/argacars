import Cabecera from '@/components/cabecera'
import { exigirAcceso } from '@/lib/sesion'
import Formularios from './formularios'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Mi cuenta' }

export default async function Perfil() {
  const { supabase, perfil, esAdmin, user } = await exigirAcceso()

  // select('*') para no depender de que la columna address (migración 0005) ya exista.
  const { data: datos } = await supabase.from('profiles').select('*').eq('id', user.id).maybeSingle()

  return (
    <>
      <Cabecera esAdmin={esAdmin} />
      <main className="mx-auto max-w-2xl px-5 py-9 sm:py-12">
        <p className="text-[11px] font-bold uppercase tracking-[.2em] text-gold">Mi cuenta</p>
        <h1 className="mt-3 text-[clamp(24px,4.6vw,34px)] font-black leading-tight tracking-[-.035em]">
          Tus datos
        </h1>

        <Formularios
          correo={user.email ?? ''}
          nombre={perfil?.full_name ?? ''}
          telefono={(datos?.phone as string | null) ?? ''}
          direccion={(datos?.address as string | null | undefined) ?? ''}
        />
      </main>
    </>
  )
}
