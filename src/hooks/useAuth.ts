import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import { logoutUser } from '@/services/auth.service'
import { ROUTES } from '@/config/routes'

// Accesseur pur — l'initialisation et les subscriptions sont dans AuthProvider
export function useAuth() {
  const { profile, isLoading, signOut } = useAuthStore()
  const navigate = useNavigate()

  const handleSignOut = async () => {
    await logoutUser()
    signOut()
    navigate(ROUTES.REGISTER, { replace: true })
  }

  return { profile, isLoading, signOut: handleSignOut }
}
