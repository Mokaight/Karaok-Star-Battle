import { SCORING, scoreToStars } from '@/config/scoring'
import type { ScoreResult } from '@/types'

export function useScoreCalculator() {
  const calculate = (amplitudeHistory: number[]): ScoreResult => {
    if (amplitudeHistory.length === 0) {
      return { score: 0, stars: 1, volumeScore: 0, rhythmScore: 0 }
    }

    // Score volume : % du temps où le micro dépasse le seuil minimum
    const singing = amplitudeHistory.filter((rms) => rms > SCORING.MIN_VOLUME_THRESHOLD)
    const volumeScore = Math.round((singing.length / amplitudeHistory.length) * 100)

    // Score rythme : régularité (moins de variance = meilleur)
    const mean = singing.reduce((a, b) => a + b, 0) / (singing.length || 1)
    const variance = singing.reduce((acc, v) => acc + Math.pow(v - mean, 2), 0) / (singing.length || 1)
    const stdDev = Math.sqrt(variance)
    const rhythmScore = Math.max(0, Math.round(100 - stdDev * 500))

    const score = Math.min(100, Math.round(
      volumeScore * SCORING.VOLUME_WEIGHT + rhythmScore * SCORING.RHYTHM_WEIGHT
    ))

    return {
      score,
      stars: scoreToStars(score),
      volumeScore,
      rhythmScore,
    }
  }

  return { calculate }
}
