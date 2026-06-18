import { createContext, useContext, useEffect } from 'react'
import { supabase } from '@/config/supabase'
import { useAuthStore } from '@/stores/authStore'
import { getCurrentProfile } from '@/services/auth.service'
import type { Profile } from '@/types'

interface AuthContextValue {
  profile: Profile | null
  isLoading: boolean
}

const AuthContext = createContext<AuthContextValue>({ profile: null, isLoading: true })

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { setProfile, setLoading } = useAuthStore()
  const profile = useAuthStore((s) => s.profile)
  const isLoading = useAuthStore((s) => s.isLoading)

  useEffect(() => {
    // Vérifie d'abord la session Supabase — invalide le cache localStorage si JWT expiré
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        setProfile(null)
        setLoading(false)
        return
      }
      getCurrentProfile().then((p) => {
        setProfile(p)
        setLoading(false)
      })
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_OUT' || !session) {
        setProfile(null)
        setLoading(false)
      } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        getCurrentProfile().then((p) => setProfile(p))
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  return (
    <AuthContext.Provider value={{ profile, isLoading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuthContext() {
  return useContext(AuthContext)
}
