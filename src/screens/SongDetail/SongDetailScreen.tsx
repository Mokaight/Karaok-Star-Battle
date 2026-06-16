import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { AppShell } from '@/components/shared/AppShell'
import { PageTransition } from '@/components/shared/PageTransition'
import { BackButton } from '@/components/shared/BackButton'
import { GradientButton } from '@/components/shared/GradientButton'
import { StarRating } from '@/components/shared/StarRating'
import { getSongById } from '@/services/songs.service'
import { getBestScoreForUser } from '@/services/scores.service'
import { useAuthStore } from '@/stores/authStore'
import { ROUTES, songRoute } from '@/config/routes'
import { formatDuration } from '@/lib/formatters'
import type { Song } from '@/types'

const DIFFICULTY_LABELS = ['', 'Facile', 'Moyen', 'Difficile']

export function SongDetailScreen() {
  const { songId } = useParams<{ songId: string }>()
  const navigate = useNavigate()
  const profile = useAuthStore((s) => s.profile)
  const [song, setSong] = useState<Song | null>(null)
  const [myBest, setMyBest] = useState<{ score: number; stars: number } | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!songId) return
    Promise.all([
      getSongById(songId),
      profile ? getBestScoreForUser(profile.id, songId) : Promise.resolve(null),
    ]).then(([s, best]) => {
      setSong(s)
      setMyBest(best)
      setIsLoading(false)
    })
  }, [songId, profile])

  if (isLoading || !song) {
    return (
      <AppShell>
        <div className="flex items-center justify-center h-full">
          <div className="font-display text-3xl animate-pulse text-brand-violet">🎵</div>
        </div>
      </AppShell>
    )
  }

  return (
    <PageTransition>
    <AppShell>
      <div className="flex flex-col h-full pb-20">
        {/* Header avec dégradé */}
        <div className="gradient-brand px-5 pt-12 pb-8 relative">
          <BackButton />
          <div className="mt-4 text-center">
            <div className="w-20 h-20 rounded-3xl bg-white/30 mx-auto flex items-center justify-center text-4xl mb-3">
              🎵
            </div>
            <h1 className="font-display text-white text-2xl">{song.title}</h1>
            <p className="text-white/80 text-sm">{song.artist}</p>
            <div className="flex items-center justify-center gap-3 mt-2">
              <span className="text-white/70 text-sm">{formatDuration(song.duration_sec)}</span>
              <span className="text-white/50">•</span>
              <span className="text-white/70 text-sm">{DIFFICULTY_LABELS[song.difficulty]}</span>
            </div>
          </div>
        </div>

        {/* Corps */}
        <div className="flex-1 px-5 pt-5 overflow-y-auto no-scrollbar">
          {/* Mon meilleur score */}
          {myBest && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-3xl p-4 shadow-soft mb-4 flex items-center justify-between"
            >
              <div>
                <p className="text-brand-muted text-xs font-sans mb-1">Mon meilleur score</p>
                <p className="font-display text-3xl text-brand-text">{myBest.score}</p>
                <StarRating stars={myBest.stars} size="sm" />
              </div>
              <span className="text-4xl">🏅</span>
            </motion.div>
          )}

          {/* Actions */}
          <div className="flex flex-col gap-3 mt-2">
            <GradientButton onClick={() => navigate(songRoute(ROUTES.COUNTDOWN, song.id), { state: { songId: song.id, mode: 'solo' } })}>
              🎤 Chanter
            </GradientButton>

            <button
              onClick={() => navigate(songRoute(ROUTES.CHOOSE_OPPONENT, song.id), { state: { songId: song.id } })}
              className="w-full py-4 px-6 rounded-3xl font-display text-lg text-brand-violet bg-white border-2 border-brand-violet/30 shadow-soft active:scale-95 transition-transform"
            >
              ⚔️ Défier un joueur
            </button>

            <button
              onClick={() => navigate(songRoute(ROUTES.LEADERBOARD, song.id))}
              className="w-full py-4 px-6 rounded-3xl font-display text-lg text-brand-muted bg-white border-2 border-brand-muted/20 shadow-soft active:scale-95 transition-transform"
            >
              🏆 Voir le classement
            </button>
          </div>
        </div>
      </div>
    </AppShell>
    </PageTransition>
  )
}
