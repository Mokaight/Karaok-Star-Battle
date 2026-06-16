import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { AppShell } from '@/components/shared/AppShell'
import { AvatarDisplay } from '@/components/shared/AvatarDisplay'
import { StarRating } from '@/components/shared/StarRating'
import { GradientButton } from '@/components/shared/GradientButton'
import { useAudioStore } from '@/stores/audioStore'
import { useDuelStore } from '@/stores/duelStore'
import { useAuthStore } from '@/stores/authStore'
import { useScoreCalculator } from '@/hooks/audio/useScoreCalculator'
import { submitScore } from '@/services/scores.service'
import { ROUTES, songRoute } from '@/config/routes'

export function DuelResultScreen() {
  const { songId } = useParams<{ songId: string }>()
  const navigate = useNavigate()
  const { amplitudeHistory, clearSession } = useAudioStore()
  const { opponentProfile, opponentBestScore, opponentBestStars, clearDuel } = useDuelStore()
  const profile = useAuthStore((s) => s.profile)
  const { calculate } = useScoreCalculator()
  const [myScore, setMyScore] = useState(0)
  const [myStars, setMyStars] = useState<1|2|3|4|5>(1)
  const [displayScore, setDisplayScore] = useState(0)

  useEffect(() => {
    const result = calculate(amplitudeHistory)
    setMyScore(result.score)
    setMyStars(result.stars)

    if (songId && profile) {
      submitScore(songId, result.score, result.stars, true).catch(console.error)
    }

    // Animation count-up
    let current = 0
    const step = Math.ceil(result.score / 40)
    const interval = setInterval(() => {
      current = Math.min(current + step, result.score)
      setDisplayScore(current)
      if (current >= result.score) clearInterval(interval)
    }, 30)

    clearSession()
    clearDuel()
    return () => clearInterval(interval)
  }, [])

  const opScore = opponentBestScore ?? 0
  const opStars = (opponentBestStars ?? 1) as 1|2|3|4|5
  const isVictoire = myScore > opScore
  const isEgalite = myScore === opScore

  return (
    <AppShell>
      <div className="flex flex-col h-full pb-20">
        {/* Header */}
        <div className="gradient-brand px-5 pt-12 pb-6 text-center">
          <h1 className="font-display text-white text-3xl">⚔️ Résultat du Duel</h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className={`font-display text-2xl mt-2 ${isEgalite ? 'text-white' : isVictoire ? 'text-brand-star' : 'text-white/70'}`}
          >
            {isEgalite ? '🤝 Égalité !' : isVictoire ? '🏆 Victoire !' : '😅 Défaite !'}
          </motion.p>
        </div>

        {/* Comparaison */}
        <div className="flex-1 flex flex-col items-center justify-center px-6 gap-4">
          {/* Mon score */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className={`w-full bg-white rounded-3xl p-4 shadow-soft flex items-center gap-4 ${isVictoire ? 'ring-2 ring-brand-star' : ''}`}
          >
            {profile && <AvatarDisplay avatarId={profile.avatar_id} size="lg" />}
            <div className="flex-1">
              <p className="font-semibold text-brand-text">{profile?.username ?? 'Moi'}</p>
              <StarRating stars={myStars} animated size="sm" />
            </div>
            <span className="font-display text-4xl text-brand-text">{displayScore}</span>
          </motion.div>

          {/* Ligne VS */}
          <div className="flex items-center gap-3 w-full">
            <div className="flex-1 h-px bg-brand-violet/30" />
            <span className="font-display text-brand-violet text-lg">contre</span>
            <div className="flex-1 h-px bg-brand-violet/30" />
          </div>

          {/* Score adversaire */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className={`w-full bg-white rounded-3xl p-4 shadow-soft flex items-center gap-4 ${!isVictoire && !isEgalite ? 'ring-2 ring-brand-star' : ''}`}
          >
            {opponentProfile && <AvatarDisplay avatarId={opponentProfile.avatar_id} size="lg" />}
            <div className="flex-1">
              <p className="font-semibold text-brand-text">{opponentProfile?.username ?? 'Adversaire'}</p>
              <StarRating stars={opStars} size="sm" />
              <p className="text-xs text-brand-muted font-sans">Meilleur score</p>
            </div>
            <span className="font-display text-4xl text-brand-text">{opScore}</span>
          </motion.div>
        </div>

        {/* Actions */}
        <div className="px-5 pb-6 flex flex-col gap-3">
          <GradientButton onClick={() => navigate(songRoute(ROUTES.LEADERBOARD, songId!))}>
            🏆 Voir le classement
          </GradientButton>
          <button
            onClick={() => navigate(ROUTES.HOME)}
            className="w-full py-3 rounded-3xl font-display text-brand-muted text-sm active:scale-95 transition-transform"
          >
            Accueil
          </button>
        </div>
      </div>
    </AppShell>
  )
}
