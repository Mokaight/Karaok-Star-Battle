export interface Profile {
  id: string
  username: string
  avatar_id: number
  created_at: string
  updated_at: string
}

export interface AuthState {
  profile: Profile | null
  isAuthenticated: boolean
  isLoading: boolean
}
