import Cabecera from '@/components/cabecera'
import { exigirAcceso } from '@/lib/sesion'
import Formularios from './formularios'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Mi cuenta' }

export default async function Perfil() {
  const { perfil, esAdmin, user } = await exigirAcceso()

  return (
    <>
      <Cabecera esAdmin={esAdmin} />
      <main className="mx-auto max-w-2xl px-5 py-9 sm:py-12">
        <p className="text-[11px] font-bold uppercase tracking-[.2em] text-gold">Mi cuenta</p>
        <h1 className="mt-3 text-[clamp(24px,4.6vw,34px)] font-black leading-tight tracking-[-.035em]">
          Tus datos de acceso
        </h1>
        <p className="mt-3 text-[15px] text-white/55">
          Entras con <strong className="text-white">{user.email}</strong>. Ese correo no se puede
          cambiar desde aquí: si lo necesitas, escríbenos y lo hacemos nosotros.
        </p>

        <Formularios nombre={perfil?.full_name ?? ''} />
      </main>
    </>
  )
}
