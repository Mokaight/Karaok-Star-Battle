import { NavLink, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ROUTES } from '@/config/routes'
import { cn } from '@/lib/utils'

const NAV_ITEMS = [
  { label: 'Accueil',  icon: '🏠', to: ROUTES.HOME,       match: (p: string) => p === ROUTES.HOME },
  { label: 'Chansons', icon: '🎵', to: ROUTES.HOME,       match: (p: string) => p.startsWith('/chansons') },
  { label: 'Profil',   icon: '👤', to: ROUTES.MY_PROFILE, match: (p: string) => p === ROUTES.MY_PROFILE },
] as const

export function BottomNav() {
  const location = useLocation()

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
        {NAV_ITEMS.map(({ label, icon, to, match }) => {
          const isActive = match(location.pathname)
          return (
            <NavLink
              key={label}
              to={to}
              className="flex flex-col items-center gap-0.5 px-3 py-1 rounded-2xl transition-all"
            >
              <span
                className={cn(
                  'text-2xl transition-transform',
                  isActive ? 'scale-110' : 'opacity-50'
                )}
              >
                {icon}
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
