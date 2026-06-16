export type RecordingMode = 'solo' | 'duel'

export interface RecordingSession {
  mode: RecordingMode
  songId: string
  opponentId: string | null
  songUrl: string
}

export interface ScoreResult {
  score: number
  stars: 1 | 2 | 3 | 4 | 5
  volumeScore: number
  rhythmScore: number
}

export interface AudioEngineState {
  isReady: boolean
  isRecording: boolean
  progress: number
  error: string | null
}
