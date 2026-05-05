import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import { getMe } from '@/api/me'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const token = ref<string | null>(null)
  const role = ref<'CUSTOMER' | 'RESTAURANT_OWNER' | null>(null)
  const restaurantId = ref<string | null>(null)

  supabase.auth.onAuthStateChange((_event, session) => {
    user.value = session?.user ?? null
    token.value = session?.access_token ?? null
  })

  async function fetchRole() {
    if (!token.value) return
    try {
      const data = await getMe()
      role.value = data.role
      restaurantId.value = data.restaurantId ?? null
    } catch {
      role.value = 'CUSTOMER'
    }
  }

  async function init() {
    const { data } = await supabase.auth.getSession()
    user.value = data.session?.user ?? null
    token.value = data.session?.access_token ?? null
    await fetchRole()
  }

  async function login(email: string, password: string) {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw new Error(error.message)
    await fetchRole()
  }

  async function signup(email: string, password: string) {
    const { error } = await supabase.auth.signUp({ email, password })
    if (error) throw new Error(error.message)
  }

  async function logout() {
    await supabase.auth.signOut()
    role.value = null
    restaurantId.value = null
  }

  return { user, token, role, restaurantId, init, login, signup, logout, fetchRole }
})
