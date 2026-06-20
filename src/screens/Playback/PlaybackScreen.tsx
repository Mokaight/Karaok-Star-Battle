import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { AppShell } from '@/components/shared/AppShell'
import { GradientButton } from '@/components/shared/GradientButton'
import { useAudioStore } from '@/stores/audioStore'
import { useAuthStore } from '@/stores/authStore'
import { getSongById } from '@/services/songs.service'
import { ROUTES, songRoute } from '@/config/routes'
import { useScoreCalculator } from '@/hooks/audio/useScoreCalculator'
import { submitScore } from '@/services/scores.service'
import type { Song } from '@/types'

export function PlaybackScreen() {
  const { songId } = useParams<{ songId: string }>()
  const navigate = useNavigate()
  const { recordingBlob, amplitudeHistory, clearSession } = useAudioStore()
  const profile = useAuthStore((s) => s.profile)
  const { calculate } = useScoreCalculator()
  // L'élément <audio> est toujours dans le DOM — évite les problèmes de ref timing
  const audioRef = useRef<HTMLAudioElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [audioReady, setAudioReady] = useState(false)
  const [audioError, setAudioError] = useState<string | null>(null)
  const [song, setSong] = useState<Song | null>(null)

  useEffect(() => {
    if (songId) getSongById(songId).then(setSong)
  }, [songId])

  useEffect(() => {
    if (!recordingBlob) {
      navigate(songRoute(ROUTES.SONG_DETAIL, songId!), { replace: true })
      return
    }
    const url = URL.createObjectURL(recordingBlob)
    setAudioUrl(url)
    setAudioReady(false)
    setAudioError(null)
    return () => URL.revokeObjectURL(url)
  }, [recordingBlob])

  const togglePlay = () => {
    const audio = audioRef.current
    if (!audio || !audioReady) return

    if (isPlaying) {
      audio.pause()
      setIsPlaying(false)
    } else {
      // Revenir au début seulement si la lecture est terminée
      if (audio.ended) audio.currentTime = 0

      audio.play()
        .then(() => setIsPlaying(true))
        .catch((err) => {
          console.error('[PlaybackScreen] audio.play() failed:', err)
          setAudioError('Impossible de lire l\'enregistrement — ' + (err?.message ?? String(err)))
        })
    }
  }

  const handleValidate = async () => {
    if (!songId || !profile) return
    audioRef.current?.pause()
    setIsPlaying(false)
    setIsSubmitting(true)
    const { score, stars } = calculate(amplitudeHistory)
    try {
      await submitScore(songId, score, stars, false)
    } catch (e) {
      console.error(e)
    }
    clearSession()
    navigate(songRoute(ROUTES.RESULT, songId), { replace: true, state: { score, stars } })
  }

  const handleRetry = () => {
    audioRef.current?.pause()
    setIsPlaying(false)
    clearSession()
    navigate(songRoute(ROUTES.COUNTDOWN, songId!), { replace: true, state: { mode: 'solo' } })
  }

  const thumbnailUrl = song?.youtube_video_id
    ? `https://img.youtube.com/vi/${song.youtube_video_id}/hqdefault.jpg`
    : null

  return (
    <AppShell showNav={false}>
      {/* Élément audio toujours dans le DOM — ref immédiatement disponible */}
      <audio
        ref={audioRef}
        src={audioUrl ?? undefined}
        preload="auto"
        onCanPlay={() => setAudioReady(true)}
        onEnded={() => setIsPlaying(false)}
        onError={() => setAudioError('Format audio non supporté par ce navigateur')}
      />

      <div className="flex flex-col h-full px-6 py-12 gap-4">
        <div className="text-center">
          <h1 className="font-display text-3xl text-brand-text">Réécoute</h1>
          <p className="text-brand-muted text-sm mt-1">
            {song?.artist} — {song?.title}
          </p>
        </div>

        {/* Miniature YouTube — non cliquable */}
        {thumbnailUrl && (
          <div className="rounded-2xl overflow-hidden bg-black relative flex-shrink-0" style={{ aspectRatio: '16/9' }}>
            <img
              src={thumbnailUrl}
              alt={song?.title}
              className="w-full h-full object-cover pointer-events-none select-none"
              draggable={false}
            />
          </div>
        )}

        {/* Bouton play/pause */}
        <div className="flex-1 flex flex-col items-center justify-center gap-4">
          {audioError ? (
            <p className="text-red-400 text-sm text-center font-sans px-4">{audioError}</p>
          ) : (
            <>
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={togglePlay}
                disabled={!audioReady}
                className="w-24 h-24 rounded-full gradient-brand flex items-center justify-center text-5xl shadow-glow disabled:opacity-40"
              >
                {isPlaying ? '⏸' : '▶️'}
              </motion.button>
              <p className="text-brand-muted text-xs font-sans">
                {!audioReady
                  ? 'Préparation…'
                  : isPlaying
                  ? 'Écoute en cours…'
                  : 'Écoute ta voix'}
              </p>
            </>
          )}
        </div>

        <div className="flex flex-col gap-3">
          <GradientButton onClick={handleValidate} isLoading={isSubmitting}>
            ✅ Valider et voir mon score
          </GradientButton>
          <button
            onClick={handleRetry}
            className="w-full py-4 rounded-3xl font-display text-brand-muted border-2 border-brand-muted/20 bg-white active:scale-95 transition-transform"
          >
            🔄 Recommencer
          </button>
        </div>
      </div>
    </AppShell>
  )
}
