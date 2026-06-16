import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { AppShell } from '@/components/shared/AppShell'
import { BackButton } from '@/components/shared/BackButton'
import { GradientButton } from '@/components/shared/GradientButton'
import { PlayerCard } from '@/components/shared/PlayerCard'
import { getPlayersWithScore } from '@/services/players.service'
import { useAuthStore } from '@/stores/authStore'
import { useDuelStore } from '@/stores/duelStore'
import { ROUTES, songRoute } from '@/config/routes'
import type { PlayerWithScore } from '@/types'

export function ChooseOpponentScreen() {
  const { songId } = useParams<{ songId: string }>()
  const navigate = useNavigate()
  const profile = useAuthStore((s) => s.profile)
  const { setOpponent } = useDuelStore()
  const [players, setPlayers] = useState<PlayerWithScore[]>([])
  const [selected, setSelected] = useState<PlayerWithScore | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!songId || !profile) return
    getPlayersWithScore(songId, profile.id).then((p) => {
      setPlayers(p)
      setIsLoading(false)
    })
  }, [songId, profile])

  const handleChallenge = () => {
    if (!selected) return
    setOpponent(
      { id: selected.id, username: selected.username, avatar_id: selected.avatar_id, created_at: '', updated_at: '' },
      selected.best_score ?? 0,
      (selected.best_stars ?? 1) as 1|2|3|4|5
    )
    navigate(songRoute(ROUTES.COUNTDOWN, songId!), {
      state: { mode: 'duel', songId, opponentId: selected.id }
    })
  }

  return (
    <AppShell>
      <div className="flex flex-col h-full pb-20">
        <div className="gradient-brand px-5 pt-12 pb-5">
          <BackButton />
          <h1 className="font-display text-white text-2xl text-center mt-3">⚔️ Choix de l'adversaire</h1>
          <p className="text-white/70 text-sm text-center font-sans mt-1">
            Qui veux-tu défier ?
          </p>
        </div>

        <div className="flex-1 px-5 pt-4 overflow-y-auto no-scrollbar">
          {isLoading ? (
            <div className="flex flex-col gap-3">
              {[1,2,3].map(i => <div key={i} className="h-16 rounded-2xl bg-brand-violet/10 animate-pulse" />)}
            </div>
          ) : players.length === 0 ? (
            <div className="text-center py-12 text-brand-muted">
              <p className="text-4xl mb-3">👥</p>
              <p>Aucun autre joueur disponible pour l'instant</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {players.map((player, i) => (
                <motion.div
                  key={player.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <PlayerCard
                    player={player}
                    isSelected={selected?.id === player.id}
                    onSelect={() => setSelected(selected?.id === player.id ? null : player)}
                  />
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {selected && (
          <div className="px-5 pb-8">
            <GradientButton onClick={handleChallenge}>
              ⚔️ Défier {selected.username}
            </GradientButton>
          </div>
        )}
      </div>
    </AppShell>
  )
}
