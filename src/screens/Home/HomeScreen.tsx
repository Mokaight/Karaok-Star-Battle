import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { AppShell } from '@/components/shared/AppShell'
import { PageTransition } from '@/components/shared/PageTransition'
import { SongCard } from '@/components/shared/SongCard'
import { AvatarDisplay } from '@/components/shared/AvatarDisplay'
import { useAuthStore } from '@/stores/authStore'
import { ROUTES, songRoute } from '@/config/routes'
import { extractYouTubeVideoId } from '@/lib/validators'
import { upsertSongByVideoId, getYouTubeThumbnail } from '@/services/songs.service'
import { getRecentSongsForUser } from '@/services/scores.service'
import type { Song } from '@/types'

export function HomeScreen() {
  const navigate = useNavigate()
  const profile = useAuthStore((s) => s.profile)
  const [url, setUrl] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [urlError, setUrlError] = useState<string | null>(null)
  const [recentSongs, setRecentSongs] = useState<Song[]>([])
  const [recentLoaded, setRecentLoaded] = useState(false)

  const videoId = extractYouTubeVideoId(url)

  useEffect(() => {
    if (!profile) return
    getRecentSongsForUser(profile.id)
      .then((songs) => { setRecentSongs(songs); setRecentLoaded(true) })
      .catch(() => setRecentLoaded(true))
  }, [profile])

  const handlePlay = async () => {
    if (!videoId) return
    setIsSubmitting(true)
    setUrlError(null)
    try {
      const song = await upsertSongByVideoId(videoId)
      navigate(songRoute(ROUTES.SONG_DETAIL, song.id))
    } catch {
      setUrlError("Impossible de charger cette vidéo. Vérifie l'URL.")
    } finally {
      setIsSubmitting(false)
    }
  }

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

        <div className="px-5 flex-1 overflow-y-auto no-scrollbar flex flex-col gap-5">
          {/* Section saisie URL */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-3xl gradient-brand p-5 shadow-soft"
          >
            <p className="font-display text-white text-xl mb-1">🎤 Chante une chanson</p>
            <p className="text-white/80 text-sm font-sans mb-4">Colle une URL YouTube et c'est parti !</p>

            <div className="bg-white/20 rounded-2xl px-4 py-3 mb-3 flex items-center gap-2">
              <input
                type="url"
                value={url}
                onChange={(e) => { setUrl(e.target.value); setUrlError(null) }}
                onKeyDown={(e) => e.key === 'Enter' && videoId && handlePlay()}
                placeholder="https://youtube.com/watch?v=..."
                className="flex-1 bg-transparent text-white placeholder:text-white/50 text-sm font-sans outline-none"
              />
              {url && (
                <button
                  onClick={() => { setUrl(''); setUrlError(null) }}
                  className="text-white/60 text-lg leading-none"
                >
                  ×
                </button>
              )}
            </div>

            {/* Aperçu thumbnail */}
            <AnimatePresence>
              {videoId && (
                <motion.div
                  key={videoId}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-3 rounded-2xl overflow-hidden"
                >
                  <img
                    src={getYouTubeThumbnail(videoId)}
                    alt="Aperçu"
                    className="w-full h-28 object-cover"
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {urlError && (
              <p className="text-red-200 text-xs font-sans mb-3">{urlError}</p>
            )}

            <button
              onClick={handlePlay}
              disabled={!videoId || isSubmitting}
              className="w-full py-3 rounded-2xl bg-white font-display text-brand-violet text-base disabled:opacity-40 active:scale-95 transition-all"
            >
              {isSubmitting ? 'Chargement...' : "C'est parti ! 🎶"}
            </button>
          </motion.div>

          {/* Chansons récentes */}
          {recentLoaded && recentSongs.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.15 }}
            >
              <h2 className="font-display text-lg text-brand-text mb-3">Chansons récentes</h2>
              <div className="flex flex-col gap-3">
                {recentSongs.map((song, i) => (
                  <SongCard key={song.id} song={song} index={i} />
                ))}
              </div>
            </motion.div>
          )}

          {/* Onboarding vide */}
          {recentLoaded && recentSongs.length === 0 && !url && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-center py-8 text-brand-muted"
            >
              <p className="text-4xl mb-3">🎵</p>
              <p className="font-sans text-sm">Colle une URL YouTube ci-dessus pour commencer à chanter !</p>
            </motion.div>
          )}
        </div>
      </div>
    </AppShell>
    </PageTransition>
  )
}
