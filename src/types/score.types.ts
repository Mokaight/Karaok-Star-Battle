export interface Score {
  id: string
  user_id: string
  song_id: string
  score: number
  stars: 1 | 2 | 3 | 4 | 5
  is_duel: boolean
  created_at: string
}

export interface LeaderboardEntry {
  rank: number
  user_id: string
  username: string
  avatar_id: number
  score: number
  stars: 1 | 2 | 3 | 4 | 5
}

export interface PlayerWithScore {
  id: string
  username: string
  avatar_id: number
  best_score: number | null
  best_stars: number | null
}
