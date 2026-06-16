import { create } from 'zustand'
import type { RecordingMode } from '@/types'

interface AudioStore {
  mode: RecordingMode | null
  songId: string | null
  opponentId: string | null
  recordingBlob: Blob | null
  durationMs: number
  amplitudeHistory: number[]
  setRecordingContext: (ctx: { mode: RecordingMode; songId: string; opponentId: string | null }) => void
  setRecordingBlob: (blob: Blob | null) => void
  appendAmplitude: (rms: number) => void
  clearSession: () => void
}

export const useAudioStore = create<AudioStore>((set) => ({
  mode: null,
  songId: null,
  opponentId: null,
  recordingBlob: null,
  durationMs: 0,
  amplitudeHistory: [],
  setRecordingContext: (ctx) => set({ ...ctx, amplitudeHistory: [], recordingBlob: null }),
  setRecordingBlob: (blob) => set({ recordingBlob: blob }),
  appendAmplitude: (rms) => set((s) => ({ amplitudeHistory: [...s.amplitudeHistory, rms] })),
  clearSession: () => set({
    mode: null,
    songId: null,
    opponentId: null,
    recordingBlob: null,
    durationMs: 0,
    amplitudeHistory: [],
  }),
}))
