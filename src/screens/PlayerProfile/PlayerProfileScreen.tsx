import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { AppShell } from '@/components/shared/AppShell'
import { PageTransition } from '@/components/shared/PageTransition'
import { BackButton } from '@/components/shared/BackButton'
import { AvatarDisplay } from '@/components/shared/AvatarDisplay'
import { StarRating } from '@/components/shared/StarRating'
import { GradientButton } from '@/components/shared/GradientButton'
import { getPlayerProfile, getPlayerScores } from '@/services/players.service'
import { ROUTES, songRoute } from '@/config/routes'
import type { Profile, Score, Song } from '@/types'

export function PlayerProfileScreen() {
  const { playerId } = useParams<{ playerId: string }>()
  const navigate = useNavigate()
  const [playerProfile, setPlayerProfile] = useState<Profile | null>(null)
  const [scores, setScores] = useState<(Score & { song: Song })[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!playerId) return
    Promise.all([
      getPlayerProfile(playerId),
      getPlayerScores(playerId),
    ]).then(([profile, playerScores]) => {
      setPlayerProfile(profile)
      setScores(playerScores)
      setIsLoading(false)
    })
  }, [playerId])

  if (isLoading) {
    return (
      <AppShell>
        <div className="flex items-center justify-center h-full">
          <div className="font-display text-3xl animate-pulse text-brand-violet">👤</div>
        </div>
      </AppShell>
    )
  }

  if (!playerProfile) {
    return (
      <AppShell>
        <div className="flex flex-col items-center justify-center h-full gap-4">
          <p className="text-brand-muted">Joueur introuvable</p>
          <BackButton />
        </div>
      </AppShell>
    )
  }

  return (
    <PageTransition>
    <AppShell>
      <div className="flex flex-col h-full pb-20">
        {/* Header */}
        <div className="gradient-brand px-5 pt-12 pb-8 text-center">
          <div className="flex justify-start mb-4"><BackButton /></div>
          <AvatarDisplay avatarId={playerProfile.avatar_id} size="xl" className="mx-auto mb-3" />
          <h1 className="font-display text-white text-2xl">{playerProfile.username}</h1>
        </div>

        {/* Scores */}
        <div className="flex-1 px-5 pt-5 overflow-y-auto no-scrollbar">
          <h2 className="font-display text-lg text-brand-text mb-3">Meilleurs scores</h2>

          {scores.length === 0 ? (
            <p className="text-brand-muted text-center py-8">Aucun score pour l'instant</p>
          ) : (
            <div className="flex flex-col gap-2">
              {scores.map((score, i) => (
                <motion.button
                  key={score.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  onClick={() => navigate(songRoute(ROUTES.SONG_DETAIL, score.song_id))}
                  className="w-full bg-white rounded-2xl p-3 shadow-soft flex items-center gap-3 text-left active:scale-98 transition-transform"
                >
                  <div className="text-2xl">🎵</div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-brand-text text-sm truncate">{score.song?.title ?? '—'}</p>
                    <StarRating stars={score.stars as 1|2|3|4|5} size="sm" />
                  </div>
                  <span className="font-display text-brand-text text-xl flex-shrink-0">{score.score}</span>
                  <span className="text-brand-muted text-sm flex-shrink-0">›</span>
                </motion.button>
              ))}
            </div>
          )}

          <div className="pt-4">
            <GradientButton onClick={() => navigate(ROUTES.HOME, { state: { challengePlayerId: playerProfile.id } })}>
              ⚔️ Défier ce joueur
            </GradientButton>
          </div>
        </div>
      </div>
    </AppShell>
    </PageTransition>
  )
}
