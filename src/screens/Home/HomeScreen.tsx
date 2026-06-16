import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { AppShell } from '@/components/shared/AppShell'
import { PageTransition } from '@/components/shared/PageTransition'
import { SongCard } from '@/components/shared/SongCard'
import { AvatarDisplay } from '@/components/shared/AvatarDisplay'
import { useSongs } from '@/hooks/useSongs'
import { useAuthStore } from '@/stores/authStore'
import { ROUTES } from '@/config/routes'

export function HomeScreen() {
  const navigate = useNavigate()
  const profile = useAuthStore((s) => s.profile)
  const { songs, isLoaded } = useSongs()

  return (
    <PageTransition>
    <AppShell>
      <div className="flex flex-col h-full pb-20">
        {/* Header */}
        <div className="px-5 pt-10 pb-4 flex items-center justify-between">
          <div>
            <p className="text-brand-muted text-sm font-sans">Bonjour 👋</p>
            <h1 className="font-display text-2xl text-brand-text">
              {profile?.username ?? 'Chanteur'}
            </h1>
          </div>
          <button onClick={() => navigate(ROUTES.MY_PROFILE)}>
            {profile && (
              <AvatarDisplay avatarId={profile.avatar_id} size="md" className="ring-2 ring-brand-violet ring-offset-1" />
            )}
          </button>
        </div>

        {/* Bannière */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mx-5 mb-4 rounded-3xl gradient-brand p-5 text-white shadow-soft"
        >
          <p className="font-display text-xl">Prêt à chanter ? 🎤</p>
          <p className="text-white/80 text-sm mt-1 font-sans">Choisis une chanson et montre ce que tu sais faire !</p>
        </motion.div>

        {/* Liste des chansons */}
        <div className="px-5 flex-1 overflow-y-auto no-scrollbar">
          <h2 className="font-display text-lg text-brand-text mb-3">Chansons disponibles</h2>

          {!isLoaded ? (
            <div className="flex flex-col gap-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-20 rounded-3xl bg-brand-violet/10 animate-pulse" />
              ))}
            </div>
          ) : songs.length === 0 ? (
            <div className="text-center py-12 text-brand-muted">
              <p className="text-4xl mb-3">🎵</p>
              <p className="font-sans">Aucune chanson disponible pour l'instant</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {songs.map((song, i) => (
                <SongCard key={song.id} song={song} index={i} />
              ))}
            </div>
          )}
        </div>
      </div>
    </AppShell>
    </PageTransition>
  )
}
