import type { VercelRequest, VercelResponse } from '@vercel/node'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const videoId = req.query.videoId as string
  if (!videoId || !/^[a-zA-Z0-9_-]{11}$/.test(videoId)) {
    return res.status(400).json({ error: 'Invalid videoId' })
  }

  try {
    // cobalt.tools : API open-source qui gère le contournement bot YouTube
    const cobaltRes = await fetch('https://api.cobalt.tools/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        url: `https://www.youtube.com/watch?v=${videoId}`,
        downloadMode: 'audio',
        audioFormat: 'best',
      }),
    })

    const data = await cobaltRes.json() as { status: string; url?: string; error?: { code: string } }

    if (!data.url || !['redirect', 'tunnel', 'stream'].includes(data.status)) {
      console.error('[yt-audio] cobalt error:', data)
      return res.status(502).json({ error: data.error?.code ?? 'cobalt_failed' })
    }

    // Stream l'audio depuis cobalt vers le client
    const audioRes = await fetch(data.url)
    if (!audioRes.ok) throw new Error(`upstream ${audioRes.status}`)

    res.setHeader('Content-Type', audioRes.headers.get('Content-Type') ?? 'audio/mp4')
    res.setHeader('Cache-Control', 'no-store')
    res.setHeader('Access-Control-Allow-Origin', '*')

    if (audioRes.body) {
      const reader = audioRes.body.getReader()
      const pump = async () => {
        const { done, value } = await reader.read()
        if (done) { res.end(); return }
        res.write(Buffer.from(value))
        await pump()
      }
      await pump()
    } else {
      res.end()
    }
  } catch (err) {
    console.error('[yt-audio]', err)
    res.status(500).json({ error: String(err) })
  }
}
