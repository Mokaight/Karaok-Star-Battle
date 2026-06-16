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

export async function getSongAudioUrl(storagePath: string): Promise<string> {
  const { data, error } = await supabase.storage
    .from('songs')
    .createSignedUrl(storagePath, 3600)

  if (error || !data) throw new Error('Impossible de charger la chanson')
  return data.signedUrl
}
