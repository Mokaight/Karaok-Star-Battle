export function validateUsername(username: string): string | null {
  if (!username.trim()) return 'Le pseudo ne peut pas être vide'
  if (username.length < 2) return 'Le pseudo doit faire au moins 2 caractères'
  if (username.length > 20) return 'Le pseudo ne peut pas dépasser 20 caractères'
  if (!/^[a-zA-Z0-9_\-]+$/.test(username)) return 'Uniquement lettres, chiffres, _ et -'
  return null
}

export function extractYouTubeVideoId(url: string): string | null {
  const patterns = [
    /[?&]v=([a-zA-Z0-9_-]{11})/,
    /youtu\.be\/([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/,
  ]
  for (const pattern of patterns) {
    const match = url.match(pattern)
    if (match) return match[1]
  }
  return null
}
