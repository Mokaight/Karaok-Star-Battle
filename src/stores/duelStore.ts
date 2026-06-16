import { create } from 'zustand'
import type { Profile } from '@/types'

interface DuelStore {
  opponentProfile: Profile | null
  opponentBestScore: number | null
  opponentBestStars: number | null
  setOpponent: (profile: Profile, bestScore: number, bestStars: number) => void
  clearDuel: () => void
}

export const useDuelStore = create<DuelStore>((set) => ({
  opponentProfile: null,
  opponentBestScore: null,
  opponentBestStars: null,
  setOpponent: (opponentProfile, opponentBestScore, opponentBestStars) =>
    set({ opponentProfile, opponentBestScore, opponentBestStars }),
  clearDuel: () => set({ opponentProfile: null, opponentBestScore: null, opponentBestStars: null }),
}))
