import { NavLink, useLocation } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { ROUTES } from '@/config/routes'
import { useAuthStore } from '@/stores/authStore'
import { getPendingDuelsCount } from '@/services/duels.service'
import { cn } from '@/lib/utils'

export function BottomNav() {
  const location = useLocation()
  const profile = useAuthStore((s) => s.profile)
  const [pendingCount, setPendingCount] = useState(0)

  useEffect(() => {
    if (!profile) return
    getPendingDuelsCount(profile.id).then(setPendingCount)
  }, [profile, location.pathname])

  const HIDDEN_ROUTES = [
    ROUTES.SPLASH,
    ROUTES.REGISTER,
    ROUTES.COUNTDOWN,
    ROUTES.RECORDING,
  ]

  if (
    HIDDEN_ROUTES.some(
      (r) =>
        location.pathname === r ||
        location.pathname.endsWith('/countdown') ||
        location.pathname.endsWith('/enregistrement')
    )
  ) {
    return null
  }

  return (
    <motion.nav
      layout
      className="absolute bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md border-t border-brand-violet/10 pb-safe"
    >
      <div className="flex items-center justify-around py-2">
        {([
          { label: 'Accueil',  icon: '🏠', to: ROUTES.HOME,        match: (p: string) => p === ROUTES.HOME },
          { label: 'Chansons', icon: '🎵', to: ROUTES.HOME,        match: (p: string) => p.startsWith('/chansons') },
          { label: 'Défis',    icon: '⚔️', to: ROUTES.DUEL_INBOX,  match: (p: string) => p === ROUTES.DUEL_INBOX },
          { label: 'Profil',   icon: '👤', to: ROUTES.MY_PROFILE,  match: (p: string) => p === ROUTES.MY_PROFILE },
        ] as const).map(({ label, icon, to, match }) => {
          const isActive = match(location.pathname)
          const showBadge = label === 'Défis' && pendingCount > 0
          return (
            <NavLink
              key={label}
              to={to}
              className="flex flex-col items-center gap-0.5 px-3 py-1 rounded-2xl transition-all"
            >
              <span className="relative">
                <span
                  className={cn(
                    'text-2xl transition-transform block',
                    isActive ? 'scale-110' : 'opacity-50'
                  )}
                >
                  {icon}
                </span>
                {showBadge && (
                  <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center leading-none">
                    {pendingCount > 9 ? '9+' : pendingCount}
                  </span>
                )}
              </span>
              <span
                className={cn(
                  'text-xs font-semibold transition-colors',
                  isActive ? 'text-brand-violet' : 'text-brand-muted'
                )}
              >
                {label}
              </span>
              {isActive && (
                <motion.div
                  layoutId="nav-indicator"
                  className="w-1 h-1 rounded-full bg-brand-violet"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
            </NavLink>
          )
        })}
      </div>
    </motion.nav>
  )
}
