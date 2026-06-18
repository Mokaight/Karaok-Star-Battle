function cleanArtist(s: string): string {
  return s
    .replace(/\s*-?\s*Topic$/i, '')
    .replace(/VEVO$/i, '')
    .replace(/\s+Official$/i, '')
    .replace(/\s+Music$/i, '')
    .trim()
}

function cleanTitle(s: string): string {
  return s
    .replace(/\(.*?(official|video|audio|lyrics|clip|mv|music|hd|hq|ft\.|feat\.).*?\)/gi, '')
    .replace(/\[.*?\]/g, '')
    .replace(/\s*[–—]\s*/g, ' - ')  // em-dash / en-dash → tiret standard
    .replace(/\s+/g, ' ')
    .trim()
}

async function tryFetch(artist: string, title: string): Promise<string | null> {
  try {
    const res = await fetch(
      `https://api.lyrics.ovh/v1/${encodeURIComponent(artist)}/${encodeURIComponent(title)}`
    )
    if (!res.ok) return null
    const data = await res.json()
    return (data.lyrics as string) || null
  } catch {
    return null
  }
}

export async function fetchLyrics(artist: string, title: string): Promise<string | null> {
  const cleanedArtist = cleanArtist(artist)
  const cleanedTitle = cleanTitle(title)

  // Tentative 1 : artiste nettoyé + titre nettoyé
  let result = await tryFetch(cleanedArtist, cleanedTitle)
  if (result) return result

  // Tentative 2 : si le titre contient " - ", c'est "Artiste - Chanson"
  const dashIdx = cleanedTitle.indexOf(' - ')
  if (dashIdx > 0) {
    const parsedArtist = cleanedTitle.slice(0, dashIdx).trim()
    const parsedTitle = cleanedTitle.slice(dashIdx + 3).trim()
    result = await tryFetch(parsedArtist, cleanTitle(parsedTitle))
    if (result) return result
  }

  // Tentative 3 : valeurs brutes
  if (cleanedArtist !== artist || cleanedTitle !== title) {
    result = await tryFetch(artist, title)
    if (result) return result
  }

  return null
}
