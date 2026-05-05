<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { RouterLink } from 'vue-router'
import { useAuthStore } from '@/stores/auth.store'
import { registerRestaurant } from '@/api/restaurant-dashboard'

const auth = useAuthStore()
const router = useRouter()

const step = ref<1 | 2 | 3>(1)
const loading = ref(false)
const error = ref<string | null>(null)

// Step 1 — Account
const email = ref('')
const password = ref('')
const showPassword = ref(false)
const confirmPassword = ref('')

// Step 2 — Restaurant info
const CATEGORIES = ['Burgers', 'Pizza', 'Sushi', 'Chicken', 'Seafood', 'Egyptian', 'Healthy', 'Desserts', 'Beverages', 'Other']
const name = ref('')
const category = ref('')
const address = ref('')
const description = ref('')
const deliveryFee = ref<number | ''>('')

const passwordStrength = computed(() => {
  const p = password.value
  if (p.length === 0) return null
  if (p.length < 8) return 'weak'
  if (/[A-Z]/.test(p) && /[0-9]/.test(p)) return 'strong'
  return 'fair'
})

const step1Valid = computed(() =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value) &&
  password.value.length >= 8 &&
  passwordStrength.value !== 'weak' &&
  password.value === confirmPassword.value,
)

const step2Valid = computed(() =>
  name.value.trim().length >= 2 &&
  category.value.length > 0 &&
  address.value.trim().length >= 5,
)

async function goStep2() {
  if (!step1Valid.value) return
  step.value = 2
  error.value = null
}

async function submit() {
  if (!step2Valid.value) return
  error.value = null
  loading.value = true
  try {
    await auth.signup(email.value, password.value)
    // Login immediately (skip email confirm for demo)
    await auth.login(email.value, password.value)
    await registerRestaurant({
      name: name.value.trim(),
      category: category.value,
      address: address.value.trim(),
      description: description.value.trim() || undefined,
      deliveryFee: deliveryFee.value !== '' ? Number(deliveryFee.value) : 0,
    })
    await auth.fetchRole()
    step.value = 3
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Registration failed'
    if (msg.toLowerCase().includes('already')) {
      error.value = 'An account with this email already exists. Try signing in instead.'
    } else if (msg.toLowerCase().includes('rate limit')) {
      error.value = 'Too many attempts, please wait a moment.'
    } else {
      error.value = msg
    }
  } finally {
    loading.value = false
  }
}

function goToDashboard() {
  router.push('/restaurant/dashboard')
}
</script>

<template>
  <div class="flex-1 flex items-center justify-center px-4 py-12">
    <div class="w-full max-w-md">
      <!-- Step indicator -->
      <div class="flex items-center justify-center gap-2 mb-8">
        <div
          v-for="n in [1, 2, 3]"
          :key="n"
          :class="[
            'w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-colors',
            step >= n ? 'bg-brand-500 text-white' : 'bg-gray-200 text-gray-500',
          ]"
        >
          {{ n }}
        </div>
        <div class="absolute">
          <div class="flex gap-16 -z-10">
            <div :class="['w-16 h-0.5', step >= 2 ? 'bg-brand-500' : 'bg-gray-200']" />
            <div :class="['w-16 h-0.5', step >= 3 ? 'bg-brand-500' : 'bg-gray-200']" />
          </div>
        </div>
      </div>

      <!-- Step 1: Account -->
      <div v-if="step === 1" class="bg-white rounded-2xl shadow-sm p-6">
        <h2 class="text-lg font-semibold text-gray-900 mb-1">Create your account</h2>
        <p class="text-sm text-gray-500 mb-5">You'll use this to manage your restaurant</p>

        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              v-model="email"
              type="email"
              required
              class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <div class="relative">
              <input
                v-model="password"
                :type="showPassword ? 'text' : 'password'"
                autocomplete="new-password"
                class="w-full border border-gray-300 rounded-lg px-3 py-2 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
              />
              <button type="button" @click="showPassword = !showPassword" class="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600" tabindex="-1">
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </button>
            </div>
            <div v-if="password.length > 0" class="mt-2">
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

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
            <input
              v-model="confirmPassword"
              type="password"
              autocomplete="new-password"
              :class="[
                'w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2',
                confirmPassword.length > 0 && confirmPassword !== password
                  ? 'border-red-400 focus:ring-red-300'
                  : 'border-gray-300 focus:ring-brand-400',
              ]"
            />
            <p v-if="confirmPassword.length > 0 && confirmPassword !== password" class="text-red-500 text-xs mt-1">Passwords do not match</p>
          </div>

          <button
            @click="goStep2"
            :disabled="!step1Valid"
            class="w-full bg-brand-500 hover:bg-brand-600 disabled:opacity-40 disabled:cursor-not-allowed text-white py-2.5 rounded-lg font-semibold text-sm transition-colors"
          >
            Continue
          </button>
        </div>
      </div>

      <!-- Step 2: Restaurant info -->
      <div v-else-if="step === 2" class="bg-white rounded-2xl shadow-sm p-6">
        <h2 class="text-lg font-semibold text-gray-900 mb-1">Restaurant details</h2>
        <p class="text-sm text-gray-500 mb-5">Tell us about your restaurant</p>

        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Restaurant name</label>
            <input
              v-model="name"
              type="text"
              class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select
              v-model="category"
              class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 bg-white"
            >
              <option value="" disabled>Select a category</option>
              <option v-for="cat in CATEGORIES" :key="cat" :value="cat">{{ cat }}</option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Address</label>
            <input
              v-model="address"
              type="text"
              class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Description <span class="text-gray-400 font-normal">(optional)</span></label>
            <textarea
              v-model="description"
              rows="2"
              class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 resize-none"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Delivery fee (EGP) <span class="text-gray-400 font-normal">(optional)</span></label>
            <input
              v-model="deliveryFee"
              type="number"
              min="0"
              step="0.5"
              placeholder="0"
              class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
            />
          </div>

          <p v-if="error" class="text-red-600 text-sm">{{ error }}</p>

          <div class="flex gap-3">
            <button
              @click="step = 1; error = null"
              class="flex-1 border border-gray-300 text-gray-700 py-2.5 rounded-lg font-semibold text-sm hover:bg-gray-50 transition-colors"
            >
              Back
            </button>
            <button
              @click="submit"
              :disabled="!step2Valid || loading"
              class="flex-1 bg-brand-500 hover:bg-brand-600 disabled:opacity-40 disabled:cursor-not-allowed text-white py-2.5 rounded-lg font-semibold text-sm transition-colors"
            >
              <span v-if="loading">Creating…</span>
              <span v-else>Create Restaurant</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Step 3: Success -->
      <div v-else class="bg-white rounded-2xl shadow-sm p-8 text-center">
        <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg class="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 class="text-xl font-semibold text-gray-900 mb-2">You're all set!</h2>
        <p class="text-gray-500 text-sm mb-6">Your restaurant is registered and ready to start receiving orders.</p>
        <button
          @click="goToDashboard"
          class="w-full bg-brand-500 hover:bg-brand-600 text-white py-2.5 rounded-lg font-semibold text-sm transition-colors"
        >
          Go to Dashboard
        </button>
      </div>

      <p v-if="step !== 3" class="text-center text-sm text-gray-500 mt-5">
        Already have an account?
        <RouterLink to="/restaurant/login" class="text-brand-600 font-medium hover:underline">Sign in</RouterLink>
      </p>
    </div>
  </div>
</template>
