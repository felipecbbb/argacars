'use server'

import { cancelarCita, reprogramarCita, type ResultadoCita } from '@/lib/reservar-cita'

const esToken = (t: string) => /^[0-9a-f-]{36}$/i.test(t)

export async function cancelarDesdeEnlace(_prev: ResultadoCita, fd: FormData): Promise<ResultadoCita> {
  const token = String(fd.get('token') ?? '')
  if (!esToken(token)) return { error: 'Enlace no válido.' }
  return cancelarCita({ token }, 'cliente')
}

export async function cambiarDesdeEnlace(_prev: ResultadoCita, fd: FormData): Promise<ResultadoCita> {
  const token = String(fd.get('token') ?? '')
  if (!esToken(token)) return { error: 'Enlace no válido.' }
  return reprogramarCita(token, String(fd.get('empieza') ?? ''), String(fd.get('zona') ?? ''))
}
