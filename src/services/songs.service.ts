import { supabase } from '@/config/supabase'
import type { Song } from '@/types'

export async function getSongs(): Promise<Song[]> {
  const { data, error } = await supabase
    .from('songs')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: true })

  if (error) throw new Error(error.message)
  return data ?? []
}

export async function getSongById(id: string): Promise<Song | null> {
  const { data, error } = await supabase
    .from('songs')
    .select('*')
    .eq('id', id)
    .single()

  if (error) return null
  return data
}

export function getYouTubeThumbnail(videoId: string): string {
  return `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`
}

export async function upsertSongByVideoId(videoId: string): Promise<Song> {
  // Chanson déjà connue ?
  const { data: existing } = await supabase
    .from('songs')
    .select('*')
    .eq('youtube_video_id', videoId)
    .maybeSingle()

  if (existing) return existing

  // Récupère le titre réel via oEmbed YouTube (sans clé API)
  let title = 'Chanson YouTube'
  let artist = 'Artiste inconnu'
  try {
    const res = await fetch(
      `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`
    )
    if (res.ok) {
      const meta = await res.json()
      title = meta.title ?? title
      artist = meta.author_name ?? artist
    }
  } catch {}

  const { data, error } = await supabase
    .from('songs')
    .insert({ title, artist, duration_sec: 0, youtube_video_id: videoId, difficulty: 2, is_active: true })
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data
}

export function getYouTubeEmbedUrl(videoId: string): string {
  return `https://www.youtube.com/embed/${videoId}?enablejsapi=1&playsinline=1&rel=0&modestbranding=1&controls=0&disablekb=1`
}
