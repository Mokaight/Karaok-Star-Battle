import { useEffect, useCallback, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAudioEngine } from '@/hooks/audio/useAudioEngine'
import { useAudioStore } from '@/stores/audioStore'
import { useDuelStore } from '@/stores/duelStore'
import { getSongById } from '@/services/songs.service'
import { ROUTES, songRoute } from '@/config/routes'
import type { Song } from '@/types'

export function RecordingScreen() {
  const { songId } = useParams<{ songId: string }>()
  const navigate = useNavigate()
  const mode = useAudioStore((s) => s.mode)
  const { clearSession } = useAudioStore()
  const { clearDuel } = useDuelStore()
  const [song, setSong] = useState<Song | null>(null)
  const [progress, setProgress] = useState(0)
  const [confirmAbandon, setConfirmAbandon] = useState(false)

  useEffect(() => {
    if (songId) getSongById(songId).then(setSong)
  }, [songId])

  const handleSongEnded = useCallback(() => {
    const nextRoute = mode === 'duel'
      ? songRoute(ROUTES.DUEL_RESULT, songId!)
      : songRoute(ROUTES.PLAYBACK, songId!)
    navigate(nextRoute, { replace: true })
  }, [mode, songId, navigate])

  const { ytContainerRef, canvasRef, ytReady, isStarted, micError, start, forceStop, cleanup, requestPermission } =
    useAudioEngine({
      videoId: song?.youtube_video_id ?? '',
      onSongEnded: handleSongEnded,
    })

  useEffect(() => {
    requestPermission()
  }, [requestPermission])

  useEffect(() => {
    if (ytReady && song && !isStarted) {
      start()
    }
  }, [ytReady, song, isStarted, start])

  useEffect(() => {
    if (!isStarted || !song || song.duration_sec === 0) return
    const interval = setInterval(() => {
      setProgress((p) => Math.min(1, p + 1 / song.duration_sec))
    }, 1000)
    return () => clearInterval(interval)
  }, [isStarted, song])

  const handleAbandon = () => {
    cleanup()
    clearSession()
    clearDuel()
    navigate(songRoute(ROUTES.SONG_DETAIL, songId!), { replace: true })
  }

  return (
    <div className="fixed inset-0 bg-brand-text flex flex-col">
      {/* Player YouTube masqué visuellement mais actif */}
      <div className="absolute opacity-0 pointer-events-none w-1 h-1 overflow-hidden">
        <div ref={ytContainerRef} id="yt-player" />
      </div>

      {/* Header */}
      <div className="px-6 pt-12 pb-4 text-center">
        <p className="text-white/60 text-sm font-sans">{song?.artist}</p>
        <h1 className="font-display text-white text-2xl">{song?.title ?? '...'}</h1>
        {mode === 'duel' && (
          <p className="text-brand-rose/80 text-xs font-sans mt-1">⚔️ Mode duel</p>
        )}
      </div>

      {/* Barre de progression */}
      <div className="px-6">
        <div className="h-1.5 bg-white/20 rounded-full overflow-hidden">
          <motion.div
            className="h-full gradient-brand rounded-full"
            animate={{ width: `${progress * 100}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>

      {/* Waveform */}
      <div className="flex-1 flex items-center justify-center px-6">
        {!isStarted ? (
          <div className="text-center">
            {micError ? (
              <p className="text-red-400 font-sans text-sm">{micError}</p>
            ) : (
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ repeat: Infinity, duration: 1 }}
                className="text-6xl"
              >
                🎤
              </motion.div>
            )}
            <p className="text-white/50 text-sm mt-3 font-sans">Chargement...</p>
          </div>
        ) : (
          <canvas
            ref={canvasRef}
            width={340}
            height={160}
            className="w-full max-w-[340px] rounded-3xl bg-white/5"
          />
        )}
      </div>

      {/* Micro pulsant */}
      {isStarted && (
        <div className="flex justify-center py-4">
          <motion.div
            animate={{ scale: [1, 1.08, 1] }}
            transition={{ repeat: Infinity, duration: 0.8 }}
            className="w-16 h-16 rounded-full bg-brand-rose/30 flex items-center justify-center text-3xl"
          >
            🎤
          </motion.div>
        </div>
      )}

      {/* Actions bas d'écran */}
      <div className="px-6 pb-12 flex flex-col gap-2">
        {mode === 'solo' && isStarted && (
          <button
            onClick={forceStop}
            className="w-full py-4 rounded-3xl font-display text-white border-2 border-white/30 active:scale-95 transition-transform"
          >
            ⏹ Terminer
          </button>
        )}

        {mode === 'duel' && isStarted && (
          <AnimatePresence mode="wait">
            {confirmAbandon ? (
              <motion.div
                key="confirm"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                className="flex gap-3"
              >
                <button
                  onClick={handleAbandon}
                  className="flex-1 py-3 rounded-3xl font-display text-brand-rose border-2 border-brand-rose/60 active:scale-95 transition-transform text-sm"
                >
                  Confirmer l'abandon
                </button>
                <button
                  onClick={() => setConfirmAbandon(false)}
                  className="flex-1 py-3 rounded-3xl font-display text-white/60 border-2 border-white/20 active:scale-95 transition-transform text-sm"
                >
                  Continuer
                </button>
              </motion.div>
            ) : (
              <motion.button
                key="abandon"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                onClick={() => setConfirmAbandon(true)}
                className="w-full py-3 rounded-3xl font-display text-white/40 border border-white/15 text-sm active:scale-95 transition-transform"
              >
                Abandonner le duel
              </motion.button>
            )}
          </AnimatePresence>
        )}
      </div>
    </div>
  )
}
