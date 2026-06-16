import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { AppShell } from '@/components/shared/AppShell'
import { BackButton } from '@/components/shared/BackButton'
import { AvatarDisplay } from '@/components/shared/AvatarDisplay'
import { StarRating } from '@/components/shared/StarRating'
import { GradientButton } from '@/components/shared/GradientButton'
import { supabase } from '@/config/supabase'
import { ROUTES } from '@/config/routes'
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
      supabase.from('profiles').select('*').eq('id', playerId).single(),
      supabase.from('scores').select('*, songs(*)').eq('user_id', playerId).order('score', { ascending: false }).limit(10),
    ]).then(([profileRes, scoresRes]) => {
      setPlayerProfile(profileRes.data)
      setScores((scoresRes.data ?? []).map((s: any) => ({ ...s, song: s.songs })))
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
                <motion.div
                  key={score.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="bg-white rounded-2xl p-3 shadow-soft flex items-center gap-3"
                >
                  <div className="text-2xl">🎵</div>
                  <div className="flex-1">
                    <p className="font-semibold text-brand-text text-sm">{score.song?.title ?? '—'}</p>
                    <StarRating stars={score.stars as 1|2|3|4|5} size="sm" />
                  </div>
                  <span className="font-display text-brand-text text-xl">{score.score}</span>
                </motion.div>
              ))}
            </div>
          )}

          <div className="pt-4">
            <GradientButton onClick={() => navigate(ROUTES.HOME)}>
              ⚔️ Défier ce joueur
            </GradientButton>
          </div>
        </div>
      </div>
    </AppShell>
  )
}
