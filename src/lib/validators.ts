export function validateUsername(username: string): string | null {
  if (!username.trim()) return 'Le pseudo ne peut pas être vide'
  if (username.length < 2) return 'Le pseudo doit faire au moins 2 caractères'
  if (username.length > 20) return 'Le pseudo ne peut pas dépasser 20 caractères'
  if (!/^[a-zA-Z0-9_\-]+$/.test(username)) return 'Uniquement lettres, chiffres, _ et -'
  return null
}
