export const SCORING = {
  VOLUME_WEIGHT: 0.6,
  RHYTHM_WEIGHT: 0.4,
  STARS_THRESHOLDS: [20, 40, 60, 80] as const,
  ANALYSER_FFT_SIZE: 256,
  ANALYSER_SMOOTHING: 0.8,
  SAMPLE_RATE_HZ: 60,
  MIN_VOLUME_THRESHOLD: 0.02,
} as const

export function scoreToStars(score: number): 1 | 2 | 3 | 4 | 5 {
  if (score >= SCORING.STARS_THRESHOLDS[3]) return 5
  if (score >= SCORING.STARS_THRESHOLDS[2]) return 4
  if (score >= SCORING.STARS_THRESHOLDS[1]) return 3
  if (score >= SCORING.STARS_THRESHOLDS[0]) return 2
  return 1
}
