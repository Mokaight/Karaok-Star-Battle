export interface Song {
  id: string
  title: string
  artist: string
  duration_sec: number
  youtube_video_id: string
  cover_url: string | null
  difficulty: 1 | 2 | 3
  is_active: boolean
  created_at: string
}
