import { useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { AppShell } from '@/components/shared/AppShell'
import { AvatarDisplay } from '@/components/shared/AvatarDisplay'
import { StarRating } from '@/components/shared/StarRating'
import { useAuthStore } from '@/stores/authStore'
import { logoutUser } from '@/services/auth.service'
import { supabase } from '@/config/supabase'
import { ROUTES } from '@/config/routes'
import type { Score, Song } from '@/types'

export function MyProfileScreen() {
  const navigate = useNavigate()
  const { profile, signOut } = useAuthStore()
  const [scores, setScores] = useState<(Score & { song: Song })[]>([])

  useEffect(() => {
    if (!profile) return
    supabase
      .from('scores')
      .select('*, songs(*)')
      .eq('user_id', profile.id)
      .order('score', { ascending: false })
      .limit(10)
      .then(({ data }) => {
        setScores((data ?? []).map((s: any) => ({ ...s, song: s.songs })))
      })
  }, [profile])

  const handleLogout = async () => {
    await logoutUser()
    signOut()
    navigate(ROUTES.REGISTER, { replace: true })
  }

  if (!profile) return null

  return (
    <AppShell>
      <div className="flex flex-col h-full pb-20">
        {/* Header */}
        <div className="gradient-brand px-5 pt-12 pb-8 text-center">
          <AvatarDisplay avatarId={profile.avatar_id} size="xl" className="mx-auto mb-3" />
          <h1 className="font-display text-white text-2xl">{profile.username}</h1>
          <p className="text-white/70 text-sm font-sans mt-1">{scores.length} chanson{scores.length > 1 ? 's' : ''} chantée{scores.length > 1 ? 's' : ''}</p>
        </div>

        {/* Contenu */}
        <div className="flex-1 px-5 pt-5 overflow-y-auto no-scrollbar">
          <h2 className="font-display text-lg text-brand-text mb-3">Mes scores</h2>

          {scores.length === 0 ? (
            <div className="text-center py-8 text-brand-muted">
              <p className="text-4xl mb-3">🎤</p>
              <p>Tu n'as pas encore chanté !</p>
              <button
                onClick={() => navigate(ROUTES.HOME)}
                className="mt-4 px-6 py-2 rounded-full bg-brand-violet/20 text-brand-violet font-semibold text-sm"
              >
                Choisir une chanson
              </button>
            </div>
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

          <div className="pt-6">
            <button
              onClick={handleLogout}
              className="w-full py-3 rounded-2xl font-sans text-sm text-red-400 border border-red-200 bg-white active:scale-95 transition-transform"
            >
              Se déconnecter
            </button>
          </div>
        </div>
      </div>
    </AppShell>
  )
}
