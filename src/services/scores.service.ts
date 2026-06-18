import { supabase } from '@/config/supabase'
import type { Score, LeaderboardEntry } from '@/types'

export async function submitScore(
  songId: string,
  score: number,
  stars: number,
  isDuel = false
): Promise<Score> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Non authentifié')

  const { data, error } = await supabase
    .from('scores')
    .insert({ user_id: user.id, song_id: songId, score, stars, is_duel: isDuel })
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data
}

export async function getLeaderboard(songId: string, limit = 20): Promise<LeaderboardEntry[]> {
  const { data, error } = await supabase
    .from('scores')
    .select('score, stars, user_id, profiles!inner(username, avatar_id)')
    .eq('song_id', songId)
    .order('score', { ascending: false })
    .limit(limit * 20)

  if (error || !data) return []

  // Dédoublonner par user_id, garder le meilleur score
  const best = new Map<string, LeaderboardEntry>()
  for (const row of data) {
    const p = (row.profiles as unknown) as { username: string; avatar_id: number }
    if (!best.has(row.user_id)) {
      best.set(row.user_id, {
        rank: 0,
        user_id: row.user_id,
        username: p.username,
        avatar_id: p.avatar_id,
        score: row.score,
        stars: row.stars as 1 | 2 | 3 | 4 | 5,
      })
    }
  }

  return Array.from(best.values())
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((entry, i) => ({ ...entry, rank: i + 1 }))
}

export async function getRecentSongsForUser(userId: string, limit = 10): Promise<import('@/types').Song[]> {
  const { data } = await supabase
    .from('scores')
    .select('song_id, created_at, songs(*)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit * 3)

  if (!data) return []

  const seen = new Set<string>()
  const songs: import('@/types').Song[] = []
  for (const row of data) {
    if (!seen.has(row.song_id) && row.songs) {
      seen.add(row.song_id)
      songs.push(row.songs as unknown as import('@/types').Song)
    }
    if (songs.length >= limit) break
  }
  return songs
}

export async function getBestScoreForUser(userId: string, songId: string): Promise<{ score: number; stars: number } | null> {
  const { data, error } = await supabase
    .from('scores')
    .select('score, stars')
    .eq('user_id', userId)
    .eq('song_id', songId)
    .order('score', { ascending: false })
    .limit(1)
    .single()

  if (error || !data) return null
  return data
}
