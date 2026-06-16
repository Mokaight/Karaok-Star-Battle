import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { AppShell } from '@/components/shared/AppShell'
import { AvatarPicker } from '@/components/shared/AvatarPicker'
import { GradientButton } from '@/components/shared/GradientButton'
import { registerUser, loginUser } from '@/services/auth.service'
import { useAuthStore } from '@/stores/authStore'
import { validateUsername } from '@/lib/validators'
import { ROUTES } from '@/config/routes'

export function RegisterScreen() {
  const navigate = useNavigate()
  const setProfile = useAuthStore((s) => s.setProfile)
  const [username, setUsername] = useState('')
  const [avatarId, setAvatarId] = useState(1)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleStart = async () => {
    const validationError = validateUsername(username)
    if (validationError) { setError(validationError); return }

    setIsLoading(true)
    setError(null)

    try {
      const profile = await registerUser(username.trim(), avatarId)
      setProfile(profile)
      navigate(ROUTES.HOME)
    } catch {
      // Si le pseudo existe déjà, on tente une connexion
      try {
        const profile = await loginUser(username.trim())
        setProfile(profile)
        navigate(ROUTES.HOME)
      } catch {
        setError('Ce pseudo est déjà pris ou une erreur est survenue')
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AppShell>
      <div className="flex flex-col h-full overflow-y-auto px-6 pt-12 pb-8 gap-6">
        {/* Titre */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <h1 className="font-display text-3xl text-brand-text">Karaok Star Battle</h1>
          <p className="text-brand-muted text-sm mt-1">Chante ta voix. Deviens une légende.</p>
        </motion.div>

        {/* Champ pseudo */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
        >
          <label className="block text-brand-text font-semibold mb-2">
            Choisis ton nom de scène
          </label>
          <div className="relative">
            <input
              type="text"
              placeholder="Entre ton pseudo..."
              value={username}
              onChange={(e) => { setUsername(e.target.value); setError(null) }}
              maxLength={20}
              className="w-full px-4 py-3 rounded-2xl border-2 border-brand-violet/30 bg-white
                         text-brand-text placeholder-brand-muted font-sans
                         focus:outline-none focus:border-brand-violet transition-colors"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xl">🎤</span>
          </div>
          {error && (
            <p className="text-red-400 text-sm mt-1">{error}</p>
          )}
        </motion.div>

        {/* Choix avatar */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center justify-between mb-2">
            <label className="text-brand-text font-semibold">Choisis ton avatar</label>
            <span className="text-xs text-brand-muted">Appuie pour choisir</span>
          </div>
          <AvatarPicker selectedId={avatarId} onChange={setAvatarId} />
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-auto"
        >
          <GradientButton onClick={handleStart} isLoading={isLoading}>
            Commencer à chanter ▶
          </GradientButton>
          <p className="text-center text-xs text-brand-muted mt-3">
            En appuyant sur Commencer, tu acceptes de partager ton score avec les autres joueurs.
          </p>
        </motion.div>
      </div>
    </AppShell>
  )
}
