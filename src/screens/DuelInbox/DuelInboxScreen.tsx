import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { AppShell } from '@/components/shared/AppShell'
import { PageTransition } from '@/components/shared/PageTransition'
import { AvatarDisplay } from '@/components/shared/AvatarDisplay'
import { StarRating } from '@/components/shared/StarRating'
import { useAuthStore } from '@/stores/authStore'
import { useDuelStore } from '@/stores/duelStore'
import { getPendingDuels } from '@/services/duels.service'
import type { PendingDuel } from '@/services/duels.service'
import { ROUTES, songRoute } from '@/config/routes'
import type { Profile } from '@/types'

export function DuelInboxScreen() {
  const navigate = useNavigate()
  const profile = useAuthStore((s) => s.profile)
  const { setResponding } = useDuelStore()
  const [duels, setDuels] = useState<PendingDuel[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!profile) return
    getPendingDuels(profile.id)
      .then(setDuels)
      .finally(() => setIsLoading(false))
  }, [profile])

  const handleAccept = (duel: PendingDuel) => {
    if (!duel.song || !duel.challenger) return
    const challenger: Profile = {
      id: duel.challenger.id,
      username: duel.challenger.username,
      avatar_id: duel.challenger.avatar_id,
      created_at: '',
      updated_at: '',
    }
    const score = duel.challengerScore?.score ?? 0
    const stars = (duel.challengerScore?.stars ?? 1) as 1 | 2 | 3 | 4 | 5
    setResponding(duel.id, challenger, score, stars)
    navigate(songRoute(ROUTES.COUNTDOWN, duel.song_id))
  }

  return (
    <PageTransition>
      <AppShell>
        <div className="flex flex-col h-full pb-20">
          <div className="gradient-brand px-5 pt-12 pb-6">
            <h1 className="font-display text-white text-2xl">⚔️ Mes défis</h1>
            <p className="text-white/70 text-sm font-sans mt-1">
              {isLoading ? '…' : `${duels.length} défi${duels.length > 1 ? 's' : ''} en attente`}
            </p>
          </div>

          <div className="flex-1 px-5 pt-5 overflow-y-auto no-scrollbar">
            {isLoading ? (
              <div className="flex justify-center py-12">
                <div className="w-8 h-8 rounded-full border-2 border-brand-violet border-t-transparent animate-spin" />
              </div>
            ) : duels.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-5xl mb-4">🎤</p>
                <p className="text-brand-muted">Aucun défi en attente.</p>
                <p className="text-brand-muted text-sm mt-1">Défie tes amis depuis une chanson !</p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {duels.map((duel, i) => (
                  <motion.div
                    key={duel.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="bg-white rounded-3xl p-4 shadow-soft"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      {duel.challenger && (
                        <AvatarDisplay avatarId={duel.challenger.avatar_id} size="md" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-brand-text">
                          {duel.challenger?.username ?? '?'} te défie !
                        </p>
                        <p className="text-sm text-brand-muted truncate">
                          {duel.song?.title ?? '—'} · {duel.song?.artist ?? '—'}
                        </p>
                      </div>
                      {duel.challengerScore && (
                        <div className="text-right flex-shrink-0">
                          <span className="font-display text-2xl text-brand-text">
                            {duel.challengerScore.score}
                          </span>
                          <div>
                            <StarRating stars={duel.challengerScore.stars as 1 | 2 | 3 | 4 | 5} size="sm" />
                          </div>
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => handleAccept(duel)}
                      className="w-full py-3 rounded-2xl font-display text-white gradient-brand text-sm active:scale-95 transition-transform"
                    >
                      Relever le défi ⚔️
                    </button>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </AppShell>
    </PageTransition>
  )
}
