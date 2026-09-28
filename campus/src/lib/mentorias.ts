import { createAdminClient } from '@/lib/supabase/server'

export const MENTORIAS_INCLUIDAS = 3

/** Mentorías gastadas: las reservadas y las hechas (las canceladas se devuelven al saldo). */
export async function mentoriasUsadas(userId: string): Promise<number> {
  const { count } = await createAdminClient()
    .from('citas').select('id', { count: 'exact', head: true })
    .eq('tipo', 'mentoria').eq('user_id', userId).neq('estado', 'cancelada')
  return count ?? 0
}
