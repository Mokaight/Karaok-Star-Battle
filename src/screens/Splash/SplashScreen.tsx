import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuthStore } from '@/stores/authStore'
import { ROUTES } from '@/config/routes'

export function SplashScreen() {
  const navigate = useNavigate()
  const profile = useAuthStore((s) => s.profile)

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate(profile ? ROUTES.HOME : ROUTES.REGISTER, { replace: true })
    }, 2500)
    return () => clearTimeout(timer)
  }, [profile, navigate])

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
          {/* Ligne ondulée SVG */}
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 128 128">
            <motion.path
              d="M0,64 C20,40 40,88 64,64 C88,40 108,88 128,64"
              fill="none"
              stroke="white"
              strokeWidth="6"
              strokeLinecap="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1, delay: 0.5 }}
            />
          </svg>
          {/* VS */}
          <span className="font-display text-white text-xl z-10">VS</span>
          {/* Notes de musique */}
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="absolute top-3 right-4 text-white/80 text-lg"
          >
            ♪
          </motion.span>
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
            className="absolute top-6 right-8 text-white/60 text-sm"
          >
            ♫
          </motion.span>
          {/* Micro */}
          <motion.span
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.9 }}
            className="absolute bottom-5 left-5 text-white/80 text-xl"
          >
            🎤
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
            Karaok Star Battle
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
