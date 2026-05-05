<script setup lang="ts">
import { ref, watch } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth.store'
import { useCartStore } from '@/stores/cart.store'
import CartDrawer from '@/components/customer/CartDrawer.vue'

const auth = useAuthStore()
const cart = useCartStore()
const router = useRouter()
const cartOpen = ref(false)
const cartIconRef = ref<HTMLElement | null>(null)

watch(() => cart.animationTrigger, (pos) => {
  if (!pos || !cartIconRef.value) return
  const dst = cartIconRef.value.getBoundingClientRect()
  const dstX = dst.left + dst.width / 2
  const dstY = dst.top + dst.height / 2

  const dot = document.createElement('div')
  dot.style.cssText = `
    position:fixed; top:0; left:0; width:14px; height:14px;
    background:#e85d04; border-radius:50%; pointer-events:none; z-index:9999;
    transform:translate(${pos.x - 7}px, ${pos.y - 7}px);
  `
  document.body.appendChild(dot)
  dot.animate(
    [
      { transform: `translate(${pos.x - 7}px, ${pos.y - 7}px)`, opacity: 1, scale: '1' },
      { transform: `translate(${dstX - 7}px, ${dstY - 7}px)`, opacity: 0, scale: '0.3' },
    ],
    { duration: 550, easing: 'ease-in' },
  ).onfinish = () => dot.remove()
})

async function handleLogout() {
  await auth.logout()
  router.push('/login')
}
</script>

<template>
  <div class="min-h-screen bg-gray-50 flex">
    <!-- Left Sidebar -->
    <aside class="w-56 bg-white border-r border-gray-100 flex flex-col shrink-0 sticky top-0 h-screen">
      <div class="p-4 border-b border-gray-100">
        <RouterLink to="/" class="text-xl font-bold text-brand-600">OrderKing</RouterLink>
      </div>

      <div class="p-4 border-b border-gray-100">
        <template v-if="auth.user">
          <div class="text-sm font-medium text-gray-900 truncate">{{ auth.user.user_metadata?.name || 'Account' }}</div>
          <div class="text-xs text-gray-500 truncate mt-0.5">{{ auth.user.email }}</div>
        </template>
        <RouterLink v-else to="/login" class="text-sm text-brand-600 font-medium hover:underline">Sign in</RouterLink>
      </div>

      <nav class="flex-1 p-3 space-y-1">
        <RouterLink
          to="/"
          class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-brand-600 transition-colors"
          active-class="bg-brand-50 text-brand-600"
          exact-active-class="bg-brand-50 text-brand-600"
        >
          <svg class="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          Home
        </RouterLink>

        <RouterLink
          to="/my-orders"
          class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-brand-600 transition-colors"
          active-class="bg-brand-50 text-brand-600"
        >
          <svg class="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          My Orders
        </RouterLink>

        <div class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-400 cursor-not-allowed select-none">
          <svg class="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
          </svg>
          Vouchers
          <span class="ml-auto text-xs bg-gray-100 text-gray-400 px-1.5 py-0.5 rounded font-medium">Soon</span>
        </div>
      </nav>

      <div class="p-3 border-t border-gray-100">
        <button
          v-if="auth.user"
          @click="handleLogout"
          class="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-red-600 transition-colors"
        >
          <svg class="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Logout
        </button>
      </div>
    </aside>

    <!-- Main area -->
    <div class="flex-1 flex flex-col min-w-0">
      <!-- Top bar -->
      <header class="bg-white border-b border-gray-100 sticky top-0 z-40">
        <div class="px-6 h-14 flex items-center justify-between">
          <div class="text-sm text-gray-400">Browse restaurants</div>
          <button
            ref="cartIconRef"
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
        </div>
      </header>

      <main class="flex-1">
        <RouterView />
      </main>
    </div>

    <CartDrawer :open="cartOpen" @close="cartOpen = false" />
  </div>
</template>
