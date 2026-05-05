import { defineStore } from 'pinia'
import { ref } from 'vue'
import { createClient } from '@supabase/supabase-js'
import type { User } from '@supabase/supabase-js'

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL as string,
  import.meta.env.VITE_SUPABASE_ANON_KEY as string,
)

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const token = ref<string | null>(null)

  supabase.auth.onAuthStateChange((_event, session) => {
    user.value = session?.user ?? null
    token.value = session?.access_token ?? null
  })

  async function init() {
    const { data } = await supabase.auth.getSession()
    user.value = data.session?.user ?? null
    token.value = data.session?.access_token ?? null
  }

  async function login(email: string, password: string) {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw new Error(error.message)
  }

  async function signup(email: string, password: string) {
    const { error } = await supabase.auth.signUp({ email, password })
    if (error) throw new Error(error.message)
  }

  async function logout() {
    await supabase.auth.signOut()
  }

  return { user, token, init, login, signup, logout }
})
