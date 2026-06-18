import { supabase } from '@/config/supabase'
import type { PlayerWithScore, Profile, Score, Song } from '@/types'

export async function getPlayersWithScore(songId: string, excludeUserId: string): Promise<PlayerWithScore[]> {
  const { data: profiles, error } = await supabase
    .from('profiles')
    .select('id, username, avatar_id')
    .neq('id', excludeUserId)
    .order('username')
    .limit(50)

  if (error || !profiles || profiles.length === 0) return []

  const profileIds = profiles.map((p) => p.id)

  // Une seule requête pour tous les scores — élimine le N+1
  const { data: scores } = await supabase
    .from('scores')
    .select('user_id, score, stars')
    .eq('song_id', songId)
    .in('user_id', profileIds)
    .order('score', { ascending: false })

  // Map user_id → meilleur score (premier résultat = meilleur grâce au ORDER BY)
  const bestScoreMap = new Map<string, { score: number; stars: number }>()
  for (const s of scores ?? []) {
    if (!bestScoreMap.has(s.user_id)) {
      bestScoreMap.set(s.user_id, { score: s.score, stars: s.stars })
    }
  }

  return profiles
    .map((p) => ({
      id: p.id,
      username: p.username,
      avatar_id: p.avatar_id,
      best_score: bestScoreMap.get(p.id)?.score ?? null,
      best_stars: bestScoreMap.get(p.id)?.stars ?? null,
    } as PlayerWithScore))
    .sort((a, b) => (b.best_score ?? -1) - (a.best_score ?? -1))
}

export async function getPlayerProfile(playerId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', playerId)
    .single()

  if (error) return null
  return data
}

export async function getPlayerScores(playerId: string, limit = 10): Promise<(Score & { song: Song })[]> {
  const { data } = await supabase
    .from('scores')
    .select('*, songs(*)')
    .eq('user_id', playerId)
    .order('score', { ascending: false })
    .limit(limit)

  return (data ?? []).map((s: any) => ({ ...s, song: s.songs }))
}
