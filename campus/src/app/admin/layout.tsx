import Link from 'next/link'
import Cabecera from '@/components/cabecera'
import { exigirAdmin } from '@/lib/sesion'

export const dynamic = 'force-dynamic'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await exigirAdmin()
  return (
    <>
      <Cabecera esAdmin />
      <div className="mx-auto max-w-6xl px-5 py-8">
        <nav className="flex flex-wrap gap-2 border-b border-white/8 pb-5">
          {[
            ['/admin', 'Resumen'],
            ['/admin/alumnos', 'Alumnos'],
            ['/admin/contenido', 'Contenido'],
            ['/admin/mentorias', 'Mentorías'],
          ].map(([href, texto]) => (
            <Link key={href} href={href} className="rounded-full border border-white/12 px-4 py-2 text-[13px] font-semibold text-white/70 hover:border-gold/45 hover:text-white">
              {texto}
            </Link>
          ))}
        </nav>
        <div className="pt-7">{children}</div>
      </div>
    </>
  )
}
