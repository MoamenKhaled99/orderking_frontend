<script setup lang="ts">
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth.store'

const auth = useAuthStore()
const router = useRouter()
const route = useRoute()

const mode = ref<'login' | 'signup'>('login')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const loading = ref(false)
const error = ref<string | null>(null)
const signupSuccess = ref(false)

function switchMode(m: 'login' | 'signup') {
  mode.value = m
  error.value = null
  signupSuccess.value = false
  email.value = ''
  password.value = ''
  confirmPassword.value = ''
}

async function submit() {
  error.value = null

  if (mode.value === 'signup') {
    if (password.value.length < 6) {
      error.value = 'Password must be at least 6 characters.'
      return
    }
    if (password.value !== confirmPassword.value) {
      error.value = 'Passwords do not match.'
      return
    }
    loading.value = true
    try {
      await auth.signup(email.value, password.value)
      signupSuccess.value = true
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Sign up failed'
    } finally {
      loading.value = false
    }
    return
  }

  loading.value = true
  try {
    await auth.login(email.value, password.value)
    const redirect = (route.query.redirect as string) || '/'
    router.push(redirect)
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Login failed'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen bg-gray-50 flex items-center justify-center px-4">
    <div class="w-full max-w-sm">
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold text-brand-600">OrderKing</h1>
        <p class="text-gray-500 mt-2 text-sm">
          {{ mode === 'login' ? 'Sign in to your account' : 'Create a new account' }}
        </p>
      </div>

      <!-- Mode tabs -->
      <div class="flex bg-gray-100 rounded-xl p-1 mb-5">
        <button
          @click="switchMode('login')"
          :class="[
            'flex-1 py-2 rounded-lg text-sm font-medium transition-colors',
            mode === 'login' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700',
          ]"
        >
          Sign in
        </button>
        <button
          @click="switchMode('signup')"
          :class="[
            'flex-1 py-2 rounded-lg text-sm font-medium transition-colors',
            mode === 'signup' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700',
          ]"
        >
          Sign up
        </button>
      </div>

      <!-- Success state after sign up -->
      <div
        v-if="signupSuccess"
        class="bg-green-50 border border-green-200 text-green-800 rounded-2xl p-5 text-sm leading-relaxed text-center"
      >
        <p class="font-semibold text-base mb-1">Account created!</p>
        <p>Check your email for a confirmation link, then come back to sign in.</p>
        <button
          @click="switchMode('login')"
          class="mt-4 text-brand-600 underline text-sm"
        >
          Go to sign in
        </button>
      </div>

      <form v-else @submit.prevent="submit" class="bg-white rounded-2xl shadow-sm p-6 space-y-4">
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
          <input
            v-model="password"
            type="password"
            required
            :autocomplete="mode === 'login' ? 'current-password' : 'new-password'"
            class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
          />
        </div>
        <div v-if="mode === 'signup'">
          <label class="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
          <input
            v-model="confirmPassword"
            type="password"
            required
            autocomplete="new-password"
            class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
          />
        </div>

        <p v-if="error" class="text-red-600 text-sm">{{ error }}</p>

        <button
          type="submit"
          :disabled="loading"
          class="w-full bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white py-2.5 rounded-lg font-semibold text-sm transition-colors"
        >
          <span v-if="loading">{{ mode === 'login' ? 'Signing in…' : 'Creating account…' }}</span>
          <span v-else>{{ mode === 'login' ? 'Sign in' : 'Create account' }}</span>
        </button>
      </form>
    </div>
  </div>
</template>
