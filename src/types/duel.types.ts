import type { Profile } from './auth.types'

export interface Duel {
  id: string
  challenger_id: string
  opponent_id: string
  song_id: string
  challenger_score_id: string | null
  opponent_score: number | null
  status: 'pending' | 'completed'
  created_at: string
  completed_at: string | null
}

export interface DuelContext {
  opponentProfile: Profile
  opponentBestScore: number
  opponentBestStars: number
  songId: string
}

export type DuelResult = 'victoire' | 'defaite' | 'egalite'
