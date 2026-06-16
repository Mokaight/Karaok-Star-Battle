import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import { ROUTES } from '@/config/routes'

export function ProtectedRoute() {
  const profile = useAuthStore((s) => s.profile)
  const isLoading = useAuthStore((s) => s.isLoading)

  if (isLoading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-brand-bg">
        <div className="font-display text-2xl text-brand-violet animate-pulse">🎤</div>
      </div>
    )
  }

  if (!profile) return <Navigate to={ROUTES.REGISTER} replace />

  return <Outlet />
}
