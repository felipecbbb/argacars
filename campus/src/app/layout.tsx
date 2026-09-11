import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Cookies from '@/components/cookies'

const inter = Inter({ subsets: ['latin'], weight: ['400', '500', '600', '700', '800', '900'] })

export const metadata: Metadata = {
  title: {
    default: 'ARGA Premium Cars · Formación de importación de vehículos',
    template: '%s · ARGA Premium Cars',
  },
  description: 'Formación de importación de vehículos de ARGA Premium Cars.',
  robots: { index: false, follow: false },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className={`${inter.className} min-h-dvh bg-ink text-white antialiased`}>
        {children}
        <Cookies />
      </body>
    </html>
  )
}
