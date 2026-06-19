import type { VercelRequest, VercelResponse } from '@vercel/node'

// Plusieurs instances Piped en fallback
const PIPED_INSTANCES = [
  'https://pipedapi.kavin.rocks',
  'https://piped-api.privacy.com.de',
  'https://api.piped.projectsegfau.lt',
]

interface PipedStream {
  url: string
  bitrate: number
  mimeType: string
}

interface PipedResponse {
  audioStreams?: PipedStream[]
  error?: string
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const videoId = req.query.videoId as string
  if (!videoId || !/^[a-zA-Z0-9_-]{11}$/.test(videoId)) {
    return res.status(400).json({ error: 'Invalid videoId' })
  }

  for (const instance of PIPED_INSTANCES) {
    try {
      const pipedRes = await fetch(`${instance}/streams/${videoId}`, {
        headers: { 'User-Agent': 'Mozilla/5.0' },
        signal: AbortSignal.timeout(8000),
      })
      if (!pipedRes.ok) continue

      const data = await pipedRes.json() as PipedResponse
      if (data.error) continue

      const audioStream = data.audioStreams
        ?.filter(s => s.url?.startsWith('http'))
        .sort((a, b) => a.bitrate - b.bitrate)[0]

      if (!audioStream) continue

      // Stream audio YouTube CDN → Vercel → client
      const audioRes = await fetch(audioStream.url, {
        headers: { 'User-Agent': 'Mozilla/5.0' },
        signal: AbortSignal.timeout(30000),
      })
      if (!audioRes.ok || !audioRes.body) continue

      res.setHeader('Content-Type', audioStream.mimeType.split(';')[0] || 'audio/mp4')
      res.setHeader('Cache-Control', 'no-store')
      res.setHeader('Access-Control-Allow-Origin', '*')

      const reader = audioRes.body.getReader()
      const pump = async (): Promise<void> => {
        const { done, value } = await reader.read()
        if (done) { res.end(); return }
        res.write(Buffer.from(value))
        return pump()
      }
      await pump()
      return

    } catch {
      continue
    }
  }

  console.error('[yt-audio] all Piped instances failed for', videoId)
  res.status(502).json({ error: 'audio_unavailable' })
}
