import { useEffect } from 'react'
import { useSongStore } from '@/stores/songStore'
import { getSongs } from '@/services/songs.service'

export function useSongs() {
  const { songs, isLoaded, setSongs } = useSongStore()

  useEffect(() => {
    if (isLoaded) return
    getSongs().then(setSongs).catch(console.error)
  }, [isLoaded])

  return { songs, isLoaded }
}
