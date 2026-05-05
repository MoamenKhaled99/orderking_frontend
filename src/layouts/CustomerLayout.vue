<script setup lang="ts">
import { ref, watch } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth.store'
import { useCartStore } from '@/stores/cart.store'
import SidebarLayout from '@/components/shared/SidebarLayout.vue'
import CartDrawer from '@/components/customer/CartDrawer.vue'

const auth = useAuthStore()
const cart = useCartStore()
const router = useRouter()
const cartOpen = ref(false)

// Two refs — one for mobile topbar, one for desktop topbar
const cartIconMobile = ref<HTMLElement | null>(null)
const cartIconDesktop = ref<HTMLElement | null>(null)

function getVisibleCartRect(): DOMRect | null {
  // getBoundingClientRect returns zeros for display:none elements
  for (const el of [cartIconMobile.value, cartIconDesktop.value]) {
    if (!el) continue
    const r = el.getBoundingClientRect()
    if (r.width > 0) return r
  }
  return null
}

// Hue palette per first letter — gives each item a distinct color
function nameToHue(name = '') {
  let h = 0
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) % 360
  return h
}

watch(() => cart.animationTrigger, (pos) => {
  if (!pos) return
  const dst = getVisibleCartRect()
  if (!dst) return

  const dstX = dst.left + dst.width / 2
  const dstY = dst.top + dst.height / 2
  const sx = pos.x
  const sy = pos.y

  // Arc peak: go up and 60% toward destination horizontally
  const peakX = sx + (dstX - sx) * 0.45
  const peakY = Math.min(sy, dstY) - 110

  // Build flying element
  const el = document.createElement('div')
  el.style.cssText = `
    position:fixed; top:0; left:0; z-index:9999; pointer-events:none;
    width:56px; height:56px; border-radius:14px;
    background:#fff; box-shadow:0 8px 24px rgba(0,0,0,0.18), 0 2px 6px rgba(0,0,0,0.12);
    overflow:hidden; display:flex; align-items:center; justify-content:center;
    transform: translate(${sx - 28}px, ${sy - 28}px);
    will-change: transform, opacity;
  `

  if (pos.imageUrl) {
    const img = document.createElement('img')
    img.src = pos.imageUrl
    img.style.cssText = 'width:100%; height:100%; object-fit:cover;'
    el.appendChild(img)
  } else {
    // Colored circle with first letter
    const hue = nameToHue(pos.name)
    el.style.background = `hsl(${hue}, 65%, 92%)`
    const letter = document.createElement('span')
    letter.textContent = pos.name?.[0]?.toUpperCase() ?? '🛒'
    letter.style.cssText = `font-size:22px; font-weight:700; color:hsl(${hue}, 55%, 38%); line-height:1; font-family:system-ui;`
    el.appendChild(letter)
  }

  document.body.appendChild(el)

  el.animate(
    [
      {
        transform: `translate(${sx - 28}px, ${sy - 28}px) scale(1) rotate(0deg)`,
        opacity: 1,
        offset: 0,
      },
      {
        transform: `translate(${peakX - 28}px, ${peakY - 28}px) scale(0.82) rotate(-14deg)`,
        opacity: 1,
        offset: 0.42,
      },
      {
        transform: `translate(${dstX - 14}px, ${dstY - 14}px) scale(0.15) rotate(8deg)`,
        opacity: 0,
        offset: 1,
      },
    ],
    { duration: 680, easing: 'cubic-bezier(0.4, 0, 0.2, 1)', fill: 'forwards' },
  ).onfinish = () => {
    el.remove()
    // Bounce the cart icon
    const cartEl = getVisibleCartRect() ? (cartIconMobile.value?.getBoundingClientRect().width ? cartIconMobile.value : cartIconDesktop.value) : null
    cartEl?.animate(
      [
        { transform: 'scale(1)' },
        { transform: 'scale(1.45)' },
        { transform: 'scale(0.88)' },
        { transform: 'scale(1.15)' },
        { transform: 'scale(1)' },
      ],
      { duration: 380, easing: 'ease-out' },
    )
  }
})

async function handleLogout() {
  await auth.logout()
  router.push('/login')
}
</script>

<template>
  <SidebarLayout title="OrderKing" logo-to="/">
    <template #sidebar>
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
    </template>

    <!-- Mobile topbar: cart icon -->
    <template #topbar-right>
      <button
        ref="cartIconMobile"
        @click="cartOpen = true"
        class="relative p-2 text-gray-600 hover:text-brand-600 transition-colors"
        aria-label="Open cart"
      >
        <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13l-1.4 7h12.8M7 13L5.4 5M17 21a1 1 0 100-2 1 1 0 000 2zm-10 0a1 1 0 100-2 1 1 0 000 2z" />
        </svg>
        <span
          v-if="cart.count > 0"
          class="absolute -top-1 -right-1 bg-brand-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium"
        >{{ cart.count }}</span>
      </button>
    </template>

    <!-- Desktop topbar -->
    <template #desktop-topbar>
      <div class="px-6 h-14 flex items-center justify-between">
        <div class="text-sm text-gray-400">Browse restaurants</div>
        <button
          ref="cartIconDesktop"
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
          >{{ cart.count }}</span>
        </button>
      </div>
    </template>

    <RouterView />
    <CartDrawer :open="cartOpen" @close="cartOpen = false" />
  </SidebarLayout>
</template>
