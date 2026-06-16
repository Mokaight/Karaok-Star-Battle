import { supabase } from '@/config/supabase'
import type { PlayerWithScore } from '@/types'

export async function getPlayersWithScore(songId: string, excludeUserId: string): Promise<PlayerWithScore[]> {
  // Récupère tous les profils sauf l'utilisateur courant
  const { data: profiles, error } = await supabase
    .from('profiles')
    .select('id, username, avatar_id')
    .neq('id', excludeUserId)
    .order('username')
    .limit(50)

  if (error || !profiles) return []

  // Pour chaque joueur, récupérer son meilleur score sur cette chanson
  const withScores = await Promise.all(
    profiles.map(async (p) => {
      const { data: score } = await supabase
        .from('scores')
        .select('score, stars')
        .eq('user_id', p.id)
        .eq('song_id', songId)
        .order('score', { ascending: false })
        .limit(1)
        .single()

      return {
        id: p.id,
        username: p.username,
        avatar_id: p.avatar_id,
        best_score: score?.score ?? null,
        best_stars: score?.stars ?? null,
      } as PlayerWithScore
    })
  )

  return withScores.sort((a, b) => (b.best_score ?? -1) - (a.best_score ?? -1))
}
