import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { AppShell } from '@/components/shared/AppShell'
import { GradientButton } from '@/components/shared/GradientButton'
import { useAudioStore } from '@/stores/audioStore'
import { ROUTES, songRoute } from '@/config/routes'
import { useScoreCalculator } from '@/hooks/audio/useScoreCalculator'
import { submitScore } from '@/services/scores.service'
import { useAuthStore } from '@/stores/authStore'

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

  useEffect(() => {
    if (!recordingBlob) {
      navigate(songRoute(ROUTES.SONG_DETAIL, songId!), { replace: true })
      return
    }
    const url = URL.createObjectURL(recordingBlob)
    setAudioUrl(url)
    return () => URL.revokeObjectURL(url)
  }, [recordingBlob])

  const togglePlay = () => {
    if (!audioRef.current) return
    if (isPlaying) {
      audioRef.current.pause()
    } else {
      audioRef.current.play()
    }
    setIsPlaying(!isPlaying)
  }

  const handleValidate = async () => {
    if (!songId || !profile) return
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
    clearSession()
    navigate(songRoute(ROUTES.COUNTDOWN, songId!), { replace: true, state: { mode: 'solo' } })
  }

  return (
    <AppShell showNav={false}>
      <div className="flex flex-col h-full px-6 py-12 gap-6">
        <div className="text-center">
          <h1 className="font-display text-3xl text-brand-text">Réécoute</h1>
          <p className="text-brand-muted text-sm mt-1">Comment c'était ?</p>
        </div>

        {audioUrl && (
          <audio
            ref={audioRef}
            src={audioUrl}
            onEnded={() => setIsPlaying(false)}
          />
        )}

        {/* Bouton play/pause */}
        <div className="flex-1 flex items-center justify-center">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={togglePlay}
            className="w-28 h-28 rounded-full gradient-brand flex items-center justify-center text-5xl shadow-glow"
          >
            {isPlaying ? '⏸' : '▶️'}
          </motion.button>
        </div>

        <p className="text-center text-brand-muted text-sm font-sans">
          {isPlaying ? 'En cours...' : 'Appuie pour écouter ta voix'}
        </p>

        <div className="flex flex-col gap-3 mt-auto">
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
