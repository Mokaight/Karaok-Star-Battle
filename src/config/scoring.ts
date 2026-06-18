export const SCORING = {
  // Poids des 3 composantes du score
  PRESENCE_WEIGHT: 0.5,   // % du temps à chanter
  ENERGY_WEIGHT: 0.3,     // force vocale
  CONSISTENCY_WEIGHT: 0.2, // fluidité des transitions
  // Seuils étoiles
  STARS_THRESHOLDS: [20, 40, 60, 80] as const,
  // Paramètres analyseur
  ANALYSER_FFT_SIZE: 256,
  ANALYSER_SMOOTHING: 0.8,
  SAMPLE_RATE_HZ: 60,
  MIN_VOLUME_THRESHOLD: 0.02,
  // Calibrage énergie et régularité
  MAX_ENERGY_REF: 0.25,  // RMS moyen d'une voix projetée normale
  DELTA_PENALTY: 800,    // multiplicateur de pénalité pour les à-coups
} as const

export function scoreToStars(score: number): 1 | 2 | 3 | 4 | 5 {
  if (score >= SCORING.STARS_THRESHOLDS[3]) return 5
  if (score >= SCORING.STARS_THRESHOLDS[2]) return 4
  if (score >= SCORING.STARS_THRESHOLDS[1]) return 3
  if (score >= SCORING.STARS_THRESHOLDS[0]) return 2
  return 1
}
