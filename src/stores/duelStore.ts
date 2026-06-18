import { create } from 'zustand'
import type { Profile } from '@/types'

interface DuelStore {
  duelId: string | null
  opponentProfile: Profile | null
  opponentBestScore: number | null
  opponentBestStars: number | null
  setDuelId: (id: string) => void
  setOpponent: (profile: Profile, bestScore: number, bestStars: number) => void
  clearDuel: () => void
}

export const useDuelStore = create<DuelStore>((set) => ({
  duelId: null,
  opponentProfile: null,
  opponentBestScore: null,
  opponentBestStars: null,
  setDuelId: (duelId) => set({ duelId }),
  setOpponent: (opponentProfile, opponentBestScore, opponentBestStars) =>
    set({ opponentProfile, opponentBestScore, opponentBestStars }),
  clearDuel: () => set({
    duelId: null,
    opponentProfile: null,
    opponentBestScore: null,
    opponentBestStars: null,
  }),
}))
