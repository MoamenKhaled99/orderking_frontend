<script setup lang="ts">
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { RouterLink } from 'vue-router'
import { useAuthStore } from '@/stores/auth.store'

const auth = useAuthStore()
const router = useRouter()
const route = useRoute()

const email = ref('')
const password = ref('')
const showPassword = ref(false)
const loading = ref(false)
const error = ref<string | null>(null)

async function submit() {
  error.value = null
  loading.value = true
  try {
    await auth.login(email.value, password.value)
    if (auth.role !== 'RESTAURANT_OWNER') {
      error.value = 'This account is not linked to any restaurant. Register one first.'
      await auth.logout()
      return
    }
    const redirect = (route.query.redirect as string) || '/restaurant/dashboard'
    router.push(redirect)
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Login failed'
    if (msg.toLowerCase().includes('rate limit') || msg.toLowerCase().includes('too many')) {
      error.value = 'Too many attempts, please wait a moment.'
    } else {
      error.value = 'Incorrect email or password.'
    }
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="flex-1 flex items-center justify-center px-4 py-12">
    <div class="w-full max-w-sm">
      <div class="text-center mb-8">
        <p class="text-gray-500 text-sm">Restaurant owner sign in</p>
      </div>

      <form @submit.prevent="submit" class="bg-white rounded-2xl shadow-sm p-6 space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input
            v-model="email"
            type="email"
            required
            autocomplete="email"
            class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Password</label>
          <div class="relative">
            <input
              v-model="password"
              :type="showPassword ? 'text' : 'password'"
              required
              autocomplete="current-password"
              class="w-full border border-gray-300 rounded-lg px-3 py-2 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
            />
            <button
              type="button"
              @click="showPassword = !showPassword"
              class="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              tabindex="-1"
            >
              <svg v-if="showPassword" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
              </svg>
              <svg v-else class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </button>
          </div>
        </div>

        <p v-if="error" class="text-red-600 text-sm">{{ error }}</p>

        <button
          type="submit"
          :disabled="loading"
          class="w-full bg-brand-500 hover:bg-brand-600 disabled:opacity-40 text-white py-2.5 rounded-lg font-semibold text-sm transition-colors"
        >
          <span v-if="loading">Signing in…</span>
          <span v-else>Sign in to Dashboard</span>
        </button>
      </form>

      <p class="text-center text-sm text-gray-500 mt-5">
        New partner?
        <RouterLink to="/restaurant/register" class="text-brand-600 font-medium hover:underline">
          Register your restaurant
        </RouterLink>
      </p>
    </div>
  </div>
</template>
