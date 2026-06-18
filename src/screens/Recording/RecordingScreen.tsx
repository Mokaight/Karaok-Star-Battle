import { useEffect, useCallback, useState, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAudioEngine } from '@/hooks/audio/useAudioEngine'
import { useAudioStore } from '@/stores/audioStore'
import { useDuelStore } from '@/stores/duelStore'
import { getSongById } from '@/services/songs.service'
import { fetchLyrics } from '@/services/lyrics.service'
import type { LyricsResult } from '@/services/lyrics.service'
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
  const [lyrics, setLyrics] = useState<LyricsResult | null | undefined>(undefined)
  const [currentLineIdx, setCurrentLineIdx] = useState(0)
  const lyricsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!songId) return
    getSongById(songId).then((s) => {
      setSong(s)
      if (s) fetchLyrics(s.artist, s.title).then(setLyrics)
    })
  }, [songId])

  const handleSongEnded = useCallback(() => {
    const nextRoute = mode === 'duel'
      ? songRoute(ROUTES.DUEL_RESULT, songId!)
      : songRoute(ROUTES.PLAYBACK, songId!)
    navigate(nextRoute, { replace: true })
  }, [mode, songId, navigate])

  const { ytContainerRef, canvasRef, ytReady, isStarted, micError, start, forceStop, cleanup, requestPermission, getCurrentTime, getDuration } =
    useAudioEngine({
      videoId: song?.youtube_video_id ?? '',
      onSongEnded: handleSongEnded,
    })

  useEffect(() => {
    requestPermission()
  }, [requestPermission])

  const isReadyToStart = ytReady && song !== null && !isStarted

  useEffect(() => {
    if (!isStarted) return
    const interval = setInterval(() => {
      const duration = getDuration()
      const current = getCurrentTime()
      if (duration > 0) setProgress(current / duration)
      // Mise à jour ligne courante pour paroles synchronisées
      if (lyrics?.synced) {
        const idx = lyrics.synced.reduce((acc, l, i) => (l.time <= current ? i : acc), 0)
        setCurrentLineIdx(idx)
      }
    }, 250)
    return () => clearInterval(interval)
  }, [isStarted, getCurrentTime, getDuration, lyrics])

  // Auto-scroll vers la ligne courante
  useEffect(() => {
    if (!lyricsRef.current) return
    const active = lyricsRef.current.querySelector<HTMLElement>('[data-active="true"]')
    active?.scrollIntoView({ block: 'center' })
  }, [currentLineIdx])

  const handleAbandon = () => {
    cleanup()
    clearSession()
    clearDuel()
    navigate(songRoute(ROUTES.SONG_DETAIL, songId!), { replace: true })
  }

  return (
    <div className="fixed inset-0 bg-brand-text flex flex-col">

      {/* Header */}
      <div className="px-6 pt-12 pb-3 text-center flex-shrink-0">
        <p className="text-white/60 text-sm font-sans truncate">{song?.artist}</p>
        <h1 className="font-display text-white text-xl truncate">{song?.title ?? '...'}</h1>
        {mode === 'duel' && (
          <p className="text-brand-rose/80 text-xs font-sans mt-1">⚔️ Mode duel</p>
        )}
      </div>

      {/* Barre de progression */}
      <div className="px-6 pb-3 flex-shrink-0">
        <div className="h-1.5 bg-white/20 rounded-full overflow-hidden">
          <motion.div
            className="h-full gradient-brand rounded-full"
            animate={{ width: `${progress * 100}%` }}
            transition={{ duration: 0.4 }}
          />
        </div>
      </div>

      {/* YouTube player — visible, wrapper conserve les dimensions quand YouTube remplace le div */}
      <div className="px-4 flex-shrink-0">
        <div className="w-full rounded-2xl overflow-hidden bg-black relative" style={{ aspectRatio: '16/9' }}>
          <div
            ref={ytContainerRef}
            id="yt-player"
            style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
          />
        </div>
      </div>

      {/* Zone principale */}
      <div className="flex-1 flex flex-col overflow-hidden px-6 pt-3 min-h-0">
        {!isStarted ? (
          <div className="flex-1 flex items-center justify-center">
            {micError ? (
              <p className="text-red-400 font-sans text-sm text-center">{micError}</p>
            ) : isReadyToStart ? (
              <motion.button
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: [1, 1.08, 1] }}
                transition={{ repeat: Infinity, duration: 1.2 }}
                whileTap={{ scale: 0.88 }}
                onClick={start}
                className="w-20 h-20 rounded-full gradient-brand flex items-center justify-center text-5xl shadow-lg"
              >
                🎤
              </motion.button>
            ) : (
              <div className="text-center">
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ repeat: Infinity, duration: 1 }}
                  className="text-5xl mb-3"
                >
                  🎵
                </motion.div>
                <p className="text-white/50 text-sm font-sans">Chargement...</p>
              </div>
            )}
          </div>
        ) : (
          <>
            {/* Waveform */}
            <canvas
              ref={canvasRef}
              width={340}
              height={48}
              className="w-full rounded-xl bg-white/5 flex-shrink-0 mb-3"
            />

            {/* Paroles */}
            {lyrics === undefined ? (
              <div className="flex-1 flex items-center justify-center">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                  className="w-5 h-5 border-2 border-white/20 border-t-white/50 rounded-full"
                />
              </div>
            ) : lyrics === null ? (
              <div className="flex-1 flex items-center justify-center">
                <p className="text-white/30 text-xs font-sans text-center">Paroles non disponibles</p>
              </div>
            ) : lyrics.synced ? (
              <div ref={lyricsRef} className="flex-1 overflow-y-auto no-scrollbar min-h-0">
                {lyrics.synced.map((line, i) => (
                  <p
                    key={i}
                    data-active={i === currentLineIdx}
                    className={`font-sans leading-8 text-center transition-all duration-300 ${
                      i === currentLineIdx
                        ? 'text-white text-base font-semibold'
                        : Math.abs(i - currentLineIdx) <= 2
                        ? 'text-white/50 text-sm'
                        : 'text-white/20 text-sm'
                    }`}
                  >
                    {line.text}
                  </p>
                ))}
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto no-scrollbar min-h-0">
                <p className="text-white/75 text-sm font-sans leading-7 whitespace-pre-wrap pb-4">
                  {lyrics.plain}
                </p>
              </div>
            )}
          </>
        )}
      </div>

      {/* Actions bas d'écran */}
      <div className="px-6 pb-10 pt-2 flex flex-col gap-2 flex-shrink-0">
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
