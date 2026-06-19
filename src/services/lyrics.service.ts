export type LyricLine = { time: number; text: string }
export type LyricsResult = { plain: string; synced: LyricLine[] | null }

function parseLRC(lrc: string): LyricLine[] {
  const timeRegex = /^\[(\d{2}):(\d{2}\.\d+)\](.*)/
  return lrc
    .split('\n')
    .map((line) => {
      const m = line.match(timeRegex)
      if (!m) return null
      const time = parseFloat(m[1]) * 60 + parseFloat(m[2])
      return { time, text: m[3].trim() }
    })
    .filter((l): l is LyricLine => l !== null && l.text.length > 0)
    .sort((a, b) => a.time - b.time)
}

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
    // Contenu entre parenthèses ou crochets avec mots-clés
    .replace(/[\(\[].*?(official|video|audio|lyrics|clip|mv|music|hd|hq|ft\.|feat\.).*?[\)\]]/gi, '')
    // Suffixes sans parenthèses — couvre "Official Video", "Official Music Video Remastered", etc.
    .replace(/\s*[-–—|]?\s*official\b.*$/gi, '')
    // Normalise em-dash / en-dash
    .replace(/\s*[–—]\s*/g, ' - ')
    .replace(/\s+/g, ' ')
    .trim()
}

async function lrclibGet(artistName: string, trackName: string): Promise<LyricsResult | null> {
  try {
    const res = await fetch(
      `https://lrclib.net/api/get?artist_name=${encodeURIComponent(artistName)}&track_name=${encodeURIComponent(trackName)}`
    )
    if (!res.ok) return null
    const data = await res.json()
    if (!data.plainLyrics) return null
    return {
      plain: data.plainLyrics,
      synced: data.syncedLyrics ? parseLRC(data.syncedLyrics) : null,
    }
  } catch {
    return null
  }
}

async function lrclibSearch(query: string): Promise<LyricsResult | null> {
  try {
    const res = await fetch(
      `https://lrclib.net/api/search?q=${encodeURIComponent(query)}`
    )
    if (!res.ok) return null
    const results = await res.json()
    if (!Array.isArray(results) || results.length === 0) return null
    const first = results[0]
    if (!first.plainLyrics) return null
    return {
      plain: first.plainLyrics,
      synced: first.syncedLyrics ? parseLRC(first.syncedLyrics) : null,
    }
  } catch {
    return null
  }
}

// Cache module-level : survit aux navigations, évite les double-fetch
const lyricsCache = new Map<string, LyricsResult | null>()

export async function fetchLyrics(artist: string, title: string): Promise<LyricsResult | null> {
  const cacheKey = `${artist}__${title}`
  if (lyricsCache.has(cacheKey)) return lyricsCache.get(cacheKey) ?? null
  const cleanedArtist = cleanArtist(artist)
  const cleanedTitle = cleanTitle(title)

  // Tentative 1 : artiste nettoyé + titre nettoyé
  let result = await lrclibGet(cleanedArtist, cleanedTitle)

  // Tentative 2 : si le titre YouTube est "Artiste - Chanson", parser et retenter
  let parsedTitle: string | null = null
  if (!result) {
    const dashIdx = cleanedTitle.indexOf(' - ')
    if (dashIdx > 0) {
      const parsedArtist = cleanedTitle.slice(0, dashIdx).trim()
      parsedTitle = cleanTitle(cleanedTitle.slice(dashIdx + 3))
      result = await lrclibGet(parsedArtist, parsedTitle)
    }
  }

  // Tentative 3 : recherche full-text avec le titre complet nettoyé
  if (!result) result = await lrclibSearch(cleanedTitle)

  // Tentative 4 : recherche avec juste la chanson (sans artiste)
  if (!result && parsedTitle) result = await lrclibSearch(parsedTitle)

  lyricsCache.set(cacheKey, result)
  return result
}
