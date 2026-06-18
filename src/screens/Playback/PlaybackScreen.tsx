import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { AppShell } from '@/components/shared/AppShell'
import { GradientButton } from '@/components/shared/GradientButton'
import { useAudioStore } from '@/stores/audioStore'
import { useAuthStore } from '@/stores/authStore'
import { useYouTubePlayer } from '@/hooks/audio/useYouTubePlayer'
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
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
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
    return () => URL.revokeObjectURL(url)
  }, [recordingBlob])

  const { containerRef: ytContainerRef, isReady: ytReady, play: ytPlay, pause: ytPause } =
    useYouTubePlayer({
      videoId: song?.youtube_video_id ?? '',
      autoplay: 0,
      mute: 0,
      onEnded: () => {
        setIsPlaying(false)
        audioRef.current?.pause()
      },
    })

  const togglePlay = () => {
    if (!audioRef.current) return
    if (isPlaying) {
      audioRef.current.pause()
      ytPause()
      setIsPlaying(false)
    } else {
      // Les deux démarrent en synchrone dans le geste — Firefox/Safari l'acceptent
      audioRef.current.currentTime = 0
      audioRef.current.play()
      ytPlay()
      setIsPlaying(true)
    }
  }

  const handleValidate = async () => {
    if (!songId || !profile) return
    ytPause()
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
    ytPause()
    clearSession()
    navigate(songRoute(ROUTES.COUNTDOWN, songId!), { replace: true, state: { mode: 'solo' } })
  }

  return (
    <AppShell showNav={false}>
      <div className="flex flex-col h-full px-6 py-12 gap-4">
        <div className="text-center">
          <h1 className="font-display text-3xl text-brand-text">Réécoute</h1>
          <p className="text-brand-muted text-sm mt-1">
            {song?.artist} — {song?.title}
          </p>
        </div>

        {/* YouTube player synchronisé */}
        {song?.youtube_video_id && (
          <div className="rounded-2xl overflow-hidden bg-black relative flex-shrink-0" style={{ aspectRatio: '16/9' }}>
            <div
              ref={ytContainerRef}
              id="yt-playback"
              style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
            />
          </div>
        )}

        {audioUrl && (
          <audio
            ref={audioRef}
            src={audioUrl}
            onEnded={() => {
              setIsPlaying(false)
              ytPause()
            }}
          />
        )}

        {/* Bouton play/pause */}
        <div className="flex-1 flex flex-col items-center justify-center gap-4">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={togglePlay}
            disabled={!audioUrl || !ytReady}
            className="w-24 h-24 rounded-full gradient-brand flex items-center justify-center text-5xl shadow-glow disabled:opacity-50"
          >
            {isPlaying ? '⏸' : '▶️'}
          </motion.button>
          <p className="text-brand-muted text-xs font-sans">
            {!ytReady ? 'Chargement...' : isPlaying ? 'Voix + musique en cours' : 'Écoute ta voix sur la musique'}
          </p>
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
