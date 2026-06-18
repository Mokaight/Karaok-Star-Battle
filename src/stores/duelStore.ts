import { create } from 'zustand'
import type { Profile } from '@/types'

interface DuelStore {
  duelId: string | null
  opponentProfile: Profile | null
  opponentBestScore: number | null
  opponentBestStars: number | null
  isResponding: boolean
  setDuelId: (id: string) => void
  setOpponent: (profile: Profile, bestScore: number, bestStars: number) => void
  setResponding: (duelId: string, challenger: Profile, score: number, stars: number) => void
  clearDuel: () => void
}

export const useDuelStore = create<DuelStore>((set) => ({
  duelId: null,
  opponentProfile: null,
  opponentBestScore: null,
  opponentBestStars: null,
  isResponding: false,
  setDuelId: (duelId) => set({ duelId }),
  setOpponent: (opponentProfile, opponentBestScore, opponentBestStars) =>
    set({ opponentProfile, opponentBestScore, opponentBestStars }),
  setResponding: (duelId, opponentProfile, opponentBestScore, opponentBestStars) =>
    set({ duelId, opponentProfile, opponentBestScore, opponentBestStars, isResponding: true }),
  clearDuel: () => set({
    duelId: null,
    opponentProfile: null,
    opponentBestScore: null,
    opponentBestStars: null,
    isResponding: false,
  }),
}))
