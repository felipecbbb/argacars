import CabeceraAdmin from '@/components/cabecera-admin'
import { exigirAdmin } from '@/lib/sesion'

export const dynamic = 'force-dynamic'

export const metadata = { title: 'Administración' }

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await exigirAdmin()
  return (
    <>
      <CabeceraAdmin />
      <div className="mx-auto max-w-6xl px-5 py-8 sm:py-10">{children}</div>
    </>
  )
}
