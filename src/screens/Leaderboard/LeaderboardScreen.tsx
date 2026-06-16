import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { AppShell } from '@/components/shared/AppShell'
import { PageTransition } from '@/components/shared/PageTransition'
import { BackButton } from '@/components/shared/BackButton'
import { PodiumBlock } from '@/components/shared/PodiumBlock'
import { AvatarDisplay } from '@/components/shared/AvatarDisplay'
import { StarRating } from '@/components/shared/StarRating'
import { getLeaderboard } from '@/services/scores.service'
import { getSongById } from '@/services/songs.service'
import { useAuthStore } from '@/stores/authStore'
import { ROUTES, songRoute, playerRoute } from '@/config/routes'
import type { LeaderboardEntry, Song } from '@/types'

export function LeaderboardScreen() {
  const { songId } = useParams<{ songId: string }>()
  const navigate = useNavigate()
  const profile = useAuthStore((s) => s.profile)
  const [entries, setEntries] = useState<LeaderboardEntry[]>([])
  const [song, setSong] = useState<Song | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!songId) return
    Promise.all([getLeaderboard(songId), getSongById(songId)]).then(([lb, s]) => {
      setEntries(lb)
      setSong(s)
      setIsLoading(false)
    })
  }, [songId])

  const top3 = entries.slice(0, 3)
  const rest = entries.slice(3)

  return (
    <PageTransition>
    <AppShell>
      <div className="flex flex-col h-full pb-20">
        {/* Header */}
        <div className="gradient-brand px-5 pt-12 pb-4">
          <BackButton />
          <h1 className="font-display text-white text-2xl text-center mt-3">
            🏆 Classement
          </h1>
          {song && (
            <p className="text-white/80 text-sm text-center font-sans">{song.title}</p>
          )}
        </div>

        {/* Contenu */}
        <div className="flex-1 overflow-y-auto no-scrollbar px-5">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="font-display text-3xl animate-pulse text-brand-violet">🏆</div>
            </div>
          ) : entries.length === 0 ? (
            <div className="text-center py-12 text-brand-muted">
              <p className="text-4xl mb-3">🎤</p>
              <p>Sois le premier à chanter cette chanson !</p>
            </div>
          ) : (
            <>
              <PodiumBlock top3={top3} />

              {rest.length > 0 && (
                <div className="flex flex-col gap-2 mt-2">
                  {rest.map((entry) => {
                    const isMe = entry.user_id === profile?.id
                    return (
                      <motion.button
                        key={entry.user_id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: (entry.rank - 4) * 0.05 }}
                        onClick={() => navigate(playerRoute(entry.user_id))}
                        className={`w-full flex items-center gap-3 p-3 rounded-2xl ${isMe ? 'bg-brand-violet/10 border border-brand-violet/30' : 'bg-white'} shadow-soft`}
                      >
                        <span className="font-display text-brand-muted w-6 text-center text-sm">{entry.rank}</span>
                        <AvatarDisplay avatarId={entry.avatar_id} size="sm" />
                        <div className="flex-1 text-left">
                          <p className="font-semibold text-brand-text text-sm">{entry.username}{isMe && ' (moi)'}</p>
                          <StarRating stars={entry.stars} size="sm" />
                        </div>
                        <span className="font-display text-brand-text">{entry.score}</span>
                        <span className="text-brand-muted text-sm">›</span>
                      </motion.button>
                    )
                  })}
                </div>
              )}

              {songId && (
                <div className="pt-4 pb-2">
                  <button
                    onClick={() => navigate(songRoute(ROUTES.CHOOSE_OPPONENT, songId))}
                    className="w-full py-3 rounded-2xl font-display text-brand-violet bg-brand-violet/10 border border-brand-violet/20 active:scale-95 transition-transform"
                  >
                    ⚔️ Défier un joueur
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </AppShell>
    </PageTransition>
  )
}
