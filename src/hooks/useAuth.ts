import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/config/supabase'
import { useAuthStore } from '@/stores/authStore'
import { getCurrentProfile, logoutUser } from '@/services/auth.service'
import { ROUTES } from '@/config/routes'

export function useAuth() {
  const { profile, isLoading, setProfile, setLoading, signOut } = useAuthStore()
  const navigate = useNavigate()

  useEffect(() => {
    getCurrentProfile().then((p) => {
      setProfile(p)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_OUT' || !session) {
        setProfile(null)
        navigate(ROUTES.REGISTER)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleSignOut = async () => {
    await logoutUser()
    signOut()
    navigate(ROUTES.REGISTER)
  }

  return { profile, isLoading, signOut: handleSignOut }
}
