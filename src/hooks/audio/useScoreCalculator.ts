import { SCORING, scoreToStars } from '@/config/scoring'
import type { ScoreResult } from '@/types'

export function useScoreCalculator() {
  const calculate = (amplitudeHistory: number[]): ScoreResult => {
    if (amplitudeHistory.length === 0) {
      return { score: 0, stars: 1, volumeScore: 0, rhythmScore: 0 }
    }

    const singing = amplitudeHistory.filter((rms) => rms > SCORING.MIN_VOLUME_THRESHOLD)

    // 1. Présence : % du temps où le micro capte une voix
    const presenceScore = Math.round((singing.length / amplitudeHistory.length) * 100)

    // 2. Énergie : force vocale moyenne normalisée
    const avgEnergy = singing.length > 0
      ? singing.reduce((a, b) => a + b, 0) / singing.length
      : 0
    const energyScore = Math.min(100, Math.round((avgEnergy / SCORING.MAX_ENERGY_REF) * 100))

    // 3. Régularité : fluidité des transitions de volume (variance des deltas)
    //    Mesure comment le volume varie D'UN INSTANT À L'AUTRE — pas la variance globale
    //    qui pénaliserait les chanteurs expressifs.
    const deltas = amplitudeHistory
      .slice(1)
      .map((v, i) => Math.abs(v - amplitudeHistory[i]))
    const avgDelta = deltas.length > 0
      ? deltas.reduce((a, b) => a + b, 0) / deltas.length
      : 0
    const consistencyScore = Math.max(0, Math.round(100 - avgDelta * SCORING.DELTA_PENALTY))

    const score = Math.min(100, Math.round(
      presenceScore * SCORING.PRESENCE_WEIGHT +
      energyScore * SCORING.ENERGY_WEIGHT +
      consistencyScore * SCORING.CONSISTENCY_WEIGHT
    ))

    return {
      score,
      stars: scoreToStars(score),
      volumeScore: presenceScore,
      rhythmScore: consistencyScore,
    }
  }

  return { calculate }
}
