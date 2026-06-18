import { supabase } from '@/config/supabase'
import type { Duel } from '@/types'

export async function createDuel(
  challengerId: string,
  opponentId: string,
  songId: string
): Promise<Duel> {
  const { data, error } = await supabase
    .from('duels')
    .insert({ challenger_id: challengerId, opponent_id: opponentId, song_id: songId, status: 'pending' })
    .select()
    .single()
  if (error) throw new Error(error.message)
  return data
}

/** Challenger a fini — on attend la réponse de l'adversaire */
export async function setChallengersScore(duelId: string, challengerScoreId: string): Promise<void> {
  const { error } = await supabase
    .from('duels')
    .update({ challenger_score_id: challengerScoreId, status: 'waiting_response' })
    .eq('id', duelId)
  if (error) throw new Error(error.message)
}

/** Alias rétro-compat — utilisé dans DuelResultScreen côté challenger */
export const completeDuel = setChallengersScore

/** L'adversaire a répondu — duel terminé */
export async function respondToDuel(duelId: string, opponentScoreId: string): Promise<void> {
  const { error } = await supabase
    .from('duels')
    .update({ opponent_score_id: opponentScoreId, status: 'completed', completed_at: new Date().toISOString() })
    .eq('id', duelId)
  if (error) throw new Error(error.message)
}

export async function getDuelById(duelId: string): Promise<Duel | null> {
  const { data, error } = await supabase.from('duels').select('*').eq('id', duelId).single()
  if (error) return null
  return data
}

// ─── Types pour l'affichage ────────────────────────────────────────────────

export type PendingDuel = {
  id: string
  song_id: string
  challenger_id: string
  challenger_score_id: string | null
  created_at: string
  song: { id: string; title: string; artist: string; youtube_video_id: string } | null
  challenger: { id: string; username: string; avatar_id: number } | null
  challengerScore: { score: number; stars: number } | null
}

export type HistoryDuel = {
  id: string
  song_id: string
  challenger_id: string
  opponent_id: string
  challenger_score_id: string | null
  opponent_score_id: string | null
  completed_at: string | null
  song: { title: string; artist: string } | null
  myScore: number | null
  theirScore: number | null
}

/** Duels en attente de ma réponse (je suis l'adversaire) */
export async function getPendingDuels(userId: string): Promise<PendingDuel[]> {
  const { data: duels } = await supabase
    .from('duels')
    .select('id, song_id, challenger_id, challenger_score_id, created_at')
    .eq('opponent_id', userId)
    .eq('status', 'waiting_response')
    .order('created_at', { ascending: false })

  if (!duels?.length) return []

  const songIds = [...new Set(duels.map((d) => d.song_id))]
  const challengerIds = [...new Set(duels.map((d) => d.challenger_id))]
  const scoreIds = duels.map((d) => d.challenger_score_id).filter(Boolean) as string[]

  const [{ data: songs }, { data: challengers }, { data: scores }] = await Promise.all([
    supabase.from('songs').select('id, title, artist, youtube_video_id').in('id', songIds),
    supabase.from('profiles').select('id, username, avatar_id').in('id', challengerIds),
    scoreIds.length
      ? supabase.from('scores').select('id, score, stars').in('id', scoreIds)
      : Promise.resolve({ data: [] }),
  ])

  return duels.map((d) => ({
    ...d,
    song: (songs ?? []).find((s) => s.id === d.song_id) ?? null,
    challenger: (challengers ?? []).find((c) => c.id === d.challenger_id) ?? null,
    challengerScore: (scores ?? []).find((s) => s.id === d.challenger_score_id) ?? null,
  }))
}

/** Historique des duels terminés de l'utilisateur */
export async function getDuelHistory(userId: string, limit = 10): Promise<HistoryDuel[]> {
  const { data: duels } = await supabase
    .from('duels')
    .select('id, song_id, challenger_id, opponent_id, challenger_score_id, opponent_score_id, completed_at')
    .or(`challenger_id.eq.${userId},opponent_id.eq.${userId}`)
    .eq('status', 'completed')
    .order('completed_at', { ascending: false })
    .limit(limit)

  if (!duels?.length) return []

  const songIds = [...new Set(duels.map((d) => d.song_id))]
  const scoreIds = [...new Set(
    duels.flatMap((d) => [d.challenger_score_id, d.opponent_score_id]).filter(Boolean) as string[]
  )]

  const [{ data: songs }, { data: scores }] = await Promise.all([
    supabase.from('songs').select('id, title, artist').in('id', songIds),
    scoreIds.length
      ? supabase.from('scores').select('id, score').in('id', scoreIds)
      : Promise.resolve({ data: [] }),
  ])

  return duels.map((d) => {
    const isChallenger = d.challenger_id === userId
    const myScoreId = isChallenger ? d.challenger_score_id : d.opponent_score_id
    const theirScoreId = isChallenger ? d.opponent_score_id : d.challenger_score_id
    const scoreMap = Object.fromEntries((scores ?? []).map((s) => [s.id, s.score]))
    return {
      ...d,
      song: (songs ?? []).find((s) => s.id === d.song_id) ?? null,
      myScore: myScoreId ? (scoreMap[myScoreId] ?? null) : null,
      theirScore: theirScoreId ? (scoreMap[theirScoreId] ?? null) : null,
    }
  })
}

/** Nombre de défis en attente (pour le badge BottomNav) */
export async function getPendingDuelsCount(userId: string): Promise<number> {
  const { count } = await supabase
    .from('duels')
    .select('id', { count: 'exact', head: true })
    .eq('opponent_id', userId)
    .eq('status', 'waiting_response')
  return count ?? 0
}
