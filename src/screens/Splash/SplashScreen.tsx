import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuthStore } from '@/stores/authStore'
import { ROUTES } from '@/config/routes'

export function SplashScreen() {
  const navigate = useNavigate()
  const profile = useAuthStore((s) => s.profile)
  const isLoading = useAuthStore((s) => s.isLoading)
  const [timerDone, setTimerDone] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setTimerDone(true), 2500)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (timerDone && !isLoading) {
      navigate(profile ? ROUTES.HOME : ROUTES.REGISTER, { replace: true })
    }
  }, [timerDone, isLoading, profile, navigate])

  return (
    <div className="fixed inset-0 flex items-center justify-center gradient-brand">
      <div className="flex flex-col items-center gap-6">
        {/* Logo icon */}
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', damping: 12, stiffness: 200, delay: 0.2 }}
          className="w-32 h-32 bg-white/20 rounded-[2.5rem] flex items-center justify-center shadow-2xl backdrop-blur-sm relative overflow-hidden"
        >
          {/* Ligne ondulée verticale */}
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 128 128">
            <motion.path
              d="M64,0 C44,26 84,52 64,78 C44,104 82,116 64,128"
              fill="none"
              stroke="white"
              strokeWidth="7"
              strokeLinecap="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1, delay: 0.5 }}
            />
          </svg>
          {/* VS — sombre au centre */}
          <span className="font-display text-white/90 text-lg z-10 drop-shadow-sm">VS</span>
          {/* Caméra — gauche haut */}
          <motion.span
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.85 }}
            className="absolute top-3 left-3 text-white/80 text-base"
          >
            📷
          </motion.span>
          {/* Micro — gauche bas */}
          <motion.span
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.95 }}
            className="absolute bottom-4 left-4 text-white/80 text-lg"
          >
            🎤
          </motion.span>
          {/* Notes de musique — droite */}
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="absolute top-2 right-3 text-white/85 text-lg"
          >
            ♪
          </motion.span>
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.0 }}
            className="absolute top-9 right-2 text-white/65 text-base"
          >
            ♫
          </motion.span>
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.1 }}
            className="absolute bottom-8 right-4 text-white/75 text-base"
          >
            ♪
          </motion.span>
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2 }}
            className="absolute bottom-3 right-2 text-white/55 text-sm"
          >
            ♩
          </motion.span>
        </motion.div>

        {/* Titre app */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="text-center"
        >
          <h1 className="font-display text-white text-3xl tracking-wide drop-shadow-lg">
            Star Battle
          </h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="text-white/80 text-sm mt-1 font-sans"
          >
            Chante ta voix. Deviens une légende.
          </motion.p>
        </motion.div>

        {/* Points de chargement */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="flex gap-2"
        >
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-2 h-2 rounded-full bg-white/60"
              animate={{ scale: [1, 1.4, 1], opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.2 }}
            />
          ))}
        </motion.div>
      </div>
    </div>
  )
}
