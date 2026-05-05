<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth.store'

const auth = useAuthStore()
const router = useRouter()
const route = useRoute()

const mode = ref<'login' | 'signup'>('login')
const email = ref('')
const emailTouched = ref(false)
const password = ref('')
const showPassword = ref(false)
const confirmPassword = ref('')
const showConfirm = ref(false)
const loading = ref(false)
const error = ref<string | null>(null)
const signupSuccess = ref(false)

const emailValid = computed(() => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value))
const emailError = computed(() => emailTouched.value && !emailValid.value && email.value.length > 0)

const passwordStrength = computed(() => {
  const p = password.value
  if (p.length === 0) return null
  if (p.length < 8) return 'weak'
  if (p.length >= 8 && /[A-Z]/.test(p) && /[0-9]/.test(p)) return 'strong'
  return 'fair'
})

const confirmMismatch = computed(() =>
  mode.value === 'signup' && confirmPassword.value.length > 0 && confirmPassword.value !== password.value,
)

const canSubmit = computed(() => {
  if (!emailValid.value || !password.value) return false
  if (mode.value === 'signup') {
    if (passwordStrength.value === 'weak') return false
    if (confirmPassword.value !== password.value) return false
  }
  return true
})

function switchMode(m: 'login' | 'signup') {
  mode.value = m
  error.value = null
  signupSuccess.value = false
  email.value = ''
  emailTouched.value = false
  password.value = ''
  confirmPassword.value = ''
}

async function submit() {
  error.value = null
  emailTouched.value = true

  if (mode.value === 'signup') {
    loading.value = true
    try {
      await auth.signup(email.value, password.value)
      signupSuccess.value = true
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Sign up failed'
      if (msg.toLowerCase().includes('rate limit') || msg.toLowerCase().includes('too many')) {
        error.value = 'Too many attempts, please wait a moment before trying again.'
      } else {
        error.value = msg
      }
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
    const msg = e instanceof Error ? e.message : 'Login failed'
    if (msg.toLowerCase().includes('rate limit') || msg.toLowerCase().includes('too many')) {
      error.value = 'Too many attempts, please wait a moment before trying again.'
    } else if (msg.toLowerCase().includes('invalid') || msg.toLowerCase().includes('credentials')) {
      error.value = 'Incorrect email or password.'
    } else {
      error.value = msg
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
        <p class="text-gray-500 text-sm">
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
        <button @click="switchMode('login')" class="mt-4 text-brand-600 underline text-sm">
          Go to sign in
        </button>
      </div>

      <form v-else @submit.prevent="submit" class="bg-white rounded-2xl shadow-sm p-6 space-y-4">
        <!-- Email -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input
            v-model="email"
            type="email"
            required
            autocomplete="email"
            @blur="emailTouched = true"
            :class="[
              'w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2',
              emailError
                ? 'border-red-400 focus:ring-red-300'
                : 'border-gray-300 focus:ring-brand-400',
            ]"
          />
          <p v-if="emailError" class="text-red-500 text-xs mt-1">Invalid email address</p>
        </div>

        <!-- Password -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Password</label>
          <div class="relative">
            <input
              v-model="password"
              :type="showPassword ? 'text' : 'password'"
              required
              :autocomplete="mode === 'login' ? 'current-password' : 'new-password'"
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
          <!-- Strength bar (signup only) -->
          <div v-if="mode === 'signup' && password.length > 0" class="mt-2">
            <div class="flex gap-1 h-1">
              <div :class="['flex-1 rounded-full', passwordStrength === 'weak' ? 'bg-red-400' : passwordStrength === 'fair' ? 'bg-yellow-400' : 'bg-green-500']" />
              <div :class="['flex-1 rounded-full', passwordStrength === 'fair' ? 'bg-yellow-400' : passwordStrength === 'strong' ? 'bg-green-500' : 'bg-gray-200']" />
              <div :class="['flex-1 rounded-full', passwordStrength === 'strong' ? 'bg-green-500' : 'bg-gray-200']" />
            </div>
            <p :class="['text-xs mt-1', passwordStrength === 'weak' ? 'text-red-500' : passwordStrength === 'fair' ? 'text-yellow-600' : 'text-green-600']">
              {{ passwordStrength === 'weak' ? 'Weak — at least 8 characters' : passwordStrength === 'fair' ? 'Fair — add uppercase and a number' : 'Strong' }}
            </p>
          </div>
        </div>

        <!-- Confirm password (signup) -->
        <div v-if="mode === 'signup'">
          <label class="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
          <div class="relative">
            <input
              v-model="confirmPassword"
              :type="showConfirm ? 'text' : 'password'"
              required
              autocomplete="new-password"
              :class="[
                'w-full border rounded-lg px-3 py-2 pr-10 text-sm focus:outline-none focus:ring-2',
                confirmMismatch
                  ? 'border-red-400 focus:ring-red-300'
                  : 'border-gray-300 focus:ring-brand-400',
              ]"
            />
            <button
              type="button"
              @click="showConfirm = !showConfirm"
              class="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              tabindex="-1"
            >
              <svg v-if="showConfirm" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
              </svg>
              <svg v-else class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </button>
          </div>
          <p v-if="confirmMismatch" class="text-red-500 text-xs mt-1">Passwords do not match</p>
        </div>

        <p v-if="error" class="text-red-600 text-sm">{{ error }}</p>

        <button
          type="submit"
          :disabled="loading || !canSubmit"
          class="w-full bg-brand-500 hover:bg-brand-600 disabled:opacity-40 disabled:cursor-not-allowed text-white py-2.5 rounded-lg font-semibold text-sm transition-colors"
        >
          <span v-if="loading">{{ mode === 'login' ? 'Signing in…' : 'Creating account…' }}</span>
          <span v-else>{{ mode === 'login' ? 'Sign in' : 'Create account' }}</span>
        </button>
      </form>
    </div>
  </div>
</template>
