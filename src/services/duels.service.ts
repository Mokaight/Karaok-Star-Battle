import { supabase } from '@/config/supabase'
import type { Duel } from '@/types'

export async function createDuel(
  challengerId: string,
  opponentId: string,
  songId: string
): Promise<Duel> {
  const { data, error } = await supabase
    .from('duels')
    .insert({
      challenger_id: challengerId,
      opponent_id: opponentId,
      song_id: songId,
      status: 'pending',
    })
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data
}

export async function completeDuel(duelId: string, challengerScoreId: string): Promise<void> {
  const { error } = await supabase
    .from('duels')
    .update({
      challenger_score_id: challengerScoreId,
      status: 'completed',
      completed_at: new Date().toISOString(),
    })
    .eq('id', duelId)

  if (error) throw new Error(error.message)
}

export async function getDuelById(duelId: string): Promise<Duel | null> {
  const { data, error } = await supabase
    .from('duels')
    .select('*')
    .eq('id', duelId)
    .single()

  if (error) return null
  return data
}
