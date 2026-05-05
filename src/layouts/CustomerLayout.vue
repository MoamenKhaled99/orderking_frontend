<script setup lang="ts">
import { ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth.store'
import { useCartStore } from '@/stores/cart.store'
import CartDrawer from '@/components/customer/CartDrawer.vue'

const auth = useAuthStore()
const cart = useCartStore()
const router = useRouter()
const cartOpen = ref(false)

async function handleLogout() {
  await auth.logout()
  router.push('/login')
}
</script>

<template>
  <div class="min-h-screen bg-gray-50 flex flex-col">
    <header class="bg-white shadow-sm sticky top-0 z-40">
      <div class="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <RouterLink to="/" class="text-xl font-bold text-brand-600">OrderKing</RouterLink>

        <div class="flex items-center gap-4">
          <button
            @click="cartOpen = true"
            class="relative p-2 text-gray-600 hover:text-brand-600 transition-colors"
            aria-label="Open cart"
          >
            <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13l-1.4 7h12.8M7 13L5.4 5M17 21a1 1 0 100-2 1 1 0 000 2zm-10 0a1 1 0 100-2 1 1 0 000 2z" />
            </svg>
            <span
              v-if="cart.count > 0"
              class="absolute -top-1 -right-1 bg-brand-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium"
            >
              {{ cart.count }}
            </span>
          </button>

          <button
            v-if="auth.user"
            @click="handleLogout"
            class="text-sm text-gray-600 hover:text-brand-600 transition-colors"
          >
            Logout
          </button>
          <RouterLink
            v-else
            to="/login"
            class="text-sm text-gray-600 hover:text-brand-600 transition-colors"
          >
            Login
          </RouterLink>
        </div>
      </div>
    </header>

    <main class="flex-1">
      <RouterView />
    </main>

    <CartDrawer :open="cartOpen" @close="cartOpen = false" />
  </div>
</template>
