import type { VercelRequest, VercelResponse } from '@vercel/node'
import ytdl from '@distube/ytdl-core'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const videoId = req.query.videoId as string
  if (!videoId || !/^[a-zA-Z0-9_-]{11}$/.test(videoId)) {
    return res.status(400).json({ error: 'Invalid videoId' })
  }

  try {
    const info = await ytdl.getInfo(`https://www.youtube.com/watch?v=${videoId}`)
    const format = ytdl.chooseFormat(info.formats, {
      filter: 'audioonly',
      quality: 'lowestaudio',
    })

    if (!format?.url) return res.status(404).json({ error: 'No audio format' })

    res.setHeader('Content-Type', format.mimeType?.split(';')[0] ?? 'audio/webm')
    res.setHeader('Cache-Control', 'no-store')
    res.setHeader('Access-Control-Allow-Origin', '*')

    ytdl(`https://www.youtube.com/watch?v=${videoId}`, { format }).pipe(res)
  } catch (err) {
    console.error('[yt-audio]', err)
    res.status(500).json({ error: 'Failed to fetch audio' })
  }
}
