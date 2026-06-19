import { useEffect, useState } from 'react'
import { useNavigate, useLocation, useParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ROUTES, songRoute } from '@/config/routes'
import { useAudioStore } from '@/stores/audioStore'
import { getSongById } from '@/services/songs.service'
import { fetchLyrics } from '@/services/lyrics.service'
import type { RecordingMode } from '@/types'

export function CountdownScreen() {
  const navigate = useNavigate()
  const location = useLocation()
  const { songId } = useParams<{ songId: string }>()
  const setRecordingContext = useAudioStore((s) => s.setRecordingContext)
  const [count, setCount] = useState(3)

  const state = location.state as { mode?: RecordingMode; opponentId?: string } | null
  const mode: RecordingMode = state?.mode ?? 'solo'
  const opponentId = state?.opponentId ?? null

  useEffect(() => {
    if (!songId) return
    setRecordingContext({ mode, songId, opponentId })
  }, [songId, mode, opponentId])

  // Pré-chargement des paroles pendant le countdown (API la plus lente)
  useEffect(() => {
    if (!songId) return
    getSongById(songId).then((song) => {
      if (song) fetchLyrics(song.artist, song.title)
    })
  }, [songId])

  useEffect(() => {
    if (count <= 0) {
      navigate(songRoute(ROUTES.RECORDING, songId!), { replace: true })
      return
    }
    const timer = setTimeout(() => setCount((c) => c - 1), 900)
    return () => clearTimeout(timer)
  }, [count, navigate, songId])

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-brand-text">
      <AnimatePresence mode="wait">
        <motion.div
          key={count}
          initial={{ scale: 0.3, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 1.5, opacity: 0 }}
          transition={{ type: 'spring', damping: 15, stiffness: 300 }}
          className="text-center"
        >
          {count > 0 ? (
            <span className="font-display text-white text-[120px] leading-none">{count}</span>
          ) : (
            <span className="font-display text-brand-rose text-6xl">C'est parti !</span>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
