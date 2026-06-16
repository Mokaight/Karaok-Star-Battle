import { create } from 'zustand'
import type { Song } from '@/types'

interface SongStore {
  songs: Song[]
  isLoaded: boolean
  setSongs: (songs: Song[]) => void
  getSongById: (id: string) => Song | undefined
}

export const useSongStore = create<SongStore>((set, get) => ({
  songs: [],
  isLoaded: false,
  setSongs: (songs) => set({ songs, isLoaded: true }),
  getSongById: (id) => get().songs.find((s) => s.id === id),
}))
