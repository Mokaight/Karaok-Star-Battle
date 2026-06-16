export function formatScore(score: number): string {
  return score.toString().padStart(2, '0')
}

export function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

export function formatDate(isoString: string): string {
  return new Intl.DateTimeFormat('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(isoString))
}

export function getRankSuffix(rank: number): string {
  return rank === 1 ? 'er' : 'ème'
}
