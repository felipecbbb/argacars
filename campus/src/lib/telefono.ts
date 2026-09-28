/**
 * Deja un teléfono siempre igual para poder buscarlo al entrar: «+34600111222».
 * Sin prefijo se entiende España. Devuelve null si no parece un teléfono.
 */
export function normalizarTelefono(entrada: string): string | null {
  let t = entrada.trim().replace(/[\s().-]/g, '')
  if (t.startsWith('00')) t = `+${t.slice(2)}`
  if (/^[6789]\d{8}$/.test(t)) t = `+34${t}`
  return /^\+\d{8,15}$/.test(t) ? t : null
}
