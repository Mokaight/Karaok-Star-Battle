import { useEffect, useState } from 'react'
import { useNavigate, useParams, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { AppShell } from '@/components/shared/AppShell'
import { PageTransition } from '@/components/shared/PageTransition'
import { StarRating } from '@/components/shared/StarRating'
import { GradientButton } from '@/components/shared/GradientButton'
import { useAudioStore } from '@/stores/audioStore'
import { useAuthStore } from '@/stores/authStore'
import { useScoreCalculator } from '@/hooks/audio/useScoreCalculator'
import { submitScore } from '@/services/scores.service'
import { ROUTES, songRoute } from '@/config/routes'

export function ResultScreen() {
  const { songId } = useParams<{ songId: string }>()
  const navigate = useNavigate()
  const location = useLocation()
  const { amplitudeHistory, clearSession } = useAudioStore()
  const profile = useAuthStore((s) => s.profile)
  const { calculate } = useScoreCalculator()
  const [_score, setScore] = useState(0)
  const [stars, setStars] = useState<1|2|3|4|5>(1)
  const [displayScore, setDisplayScore] = useState(0)

  useEffect(() => {
    const state = location.state as { score?: number; stars?: number } | null
    let finalScore: number
    let finalStars: 1|2|3|4|5

    if (state?.score !== undefined) {
      finalScore = state.score
      finalStars = (state.stars ?? 1) as 1|2|3|4|5
    } else {
      const result = calculate(amplitudeHistory)
      finalScore = result.score
      finalStars = result.stars
      if (songId && profile) {
        submitScore(songId, finalScore, finalStars, false).catch(console.error)
      }
    }

    setScore(finalScore)
    setStars(finalStars)

    // Animation count-up
    let current = 0
    const step = Math.ceil(finalScore / 40)
    const interval = setInterval(() => {
      current = Math.min(current + step, finalScore)
      setDisplayScore(current)
      if (current >= finalScore) clearInterval(interval)
    }, 30)

    clearSession()
    return () => clearInterval(interval)
  }, [])

  const getMessage = () => {
    if (stars >= 5) return { text: 'Tu es une star ! 🌟', color: 'text-brand-star' }
    if (stars >= 4) return { text: 'Excellent ! 🎉', color: 'text-brand-violet' }
    if (stars >= 3) return { text: 'Bien joué ! 👏', color: 'text-brand-rose' }
    if (stars >= 2) return { text: 'Continue ! 💪', color: 'text-brand-peach' }
    return { text: 'À améliorer... 🎤', color: 'text-brand-muted' }
  }

  const msg = getMessage()

  return (
    <PageTransition>
    <AppShell>
      <div className="flex flex-col h-full items-center justify-center px-6 gap-6 pb-20">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`font-display text-3xl ${msg.color}`}
        >
          {msg.text}
        </motion.h1>

        {/* Score */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', delay: 0.2 }}
          className="w-40 h-40 rounded-full gradient-brand flex items-center justify-center shadow-glow"
        >
          <span className="font-display text-white text-6xl">{displayScore}</span>
        </motion.div>

        {/* Étoiles */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <StarRating stars={stars} animated size="lg" />
        </motion.div>

        {/* Actions */}
        <div className="w-full flex flex-col gap-3 mt-4">
          <GradientButton onClick={() => navigate(songRoute(ROUTES.LEADERBOARD, songId!))}>
            🏆 Voir le classement
          </GradientButton>
          <button
            onClick={() => navigate(songRoute(ROUTES.COUNTDOWN, songId!), { state: { mode: 'solo' } })}
            className="w-full py-4 rounded-3xl font-display text-brand-violet bg-white border-2 border-brand-violet/30 active:scale-95 transition-transform"
          >
            🔄 Rechanter
          </button>
          <button
            onClick={() => navigate(ROUTES.HOME)}
            className="w-full py-3 rounded-3xl font-display text-brand-muted text-sm active:scale-95 transition-transform"
          >
            Accueil
          </button>
        </div>
      </div>
    </AppShell>
    </PageTransition>
  )
}
