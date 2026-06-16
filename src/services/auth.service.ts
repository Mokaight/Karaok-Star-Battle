import { supabase } from '@/config/supabase'
import type { Profile } from '@/types'

function generateEmail(username: string): string {
  return `${username.toLowerCase().trim()}@karaokstar.local`
}

const SHARED_PASSWORD = 'KaraokStar2024!'

export async function registerUser(username: string, avatarId: number): Promise<Profile> {
  const email = generateEmail(username)

  const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
    email,
    password: SHARED_PASSWORD,
  })

  if (signUpError) throw new Error(signUpError.message)
  if (!signUpData.user) throw new Error('Erreur lors de la création du compte')

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .insert({ id: signUpData.user.id, username, avatar_id: avatarId })
    .select()
    .single()

  if (profileError) throw new Error(profileError.message)
  return profile
}

export async function loginUser(username: string): Promise<Profile> {
  const email = generateEmail(username)

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password: SHARED_PASSWORD,
  })

  if (error) throw new Error('Pseudo introuvable ou déjà utilisé')

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select()
    .eq('username', username)
    .single()

  if (profileError || !profile) throw new Error('Profil introuvable')
  return profile
}

export async function logoutUser(): Promise<void> {
  await supabase.auth.signOut()
}

export async function getCurrentProfile(): Promise<Profile | null> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: profile } = await supabase
    .from('profiles')
    .select()
    .eq('id', user.id)
    .single()

  return profile ?? null
}
