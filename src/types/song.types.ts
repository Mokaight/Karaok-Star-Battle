export interface Song {
  id: string
  title: string
  artist: string
  duration_sec: number
  storage_path: string
  cover_url: string | null
  difficulty: 1 | 2 | 3
  is_active: boolean
  created_at: string
}
