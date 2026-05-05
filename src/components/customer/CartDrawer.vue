<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useCartStore } from '@/stores/cart.store'

defineProps<{ open: boolean }>()
const emit = defineEmits<{ close: [] }>()

const cart = useCartStore()
const router = useRouter()

function goToCheckout() {
  emit('close')
  router.push('/checkout')
}
</script>

<template>
  <Teleport to="body">
    <Transition name="drawer">
      <div v-if="open" class="fixed inset-0 z-50 flex">
        <div class="absolute inset-0 bg-black/40" @click="emit('close')" />
        <div class="relative ml-auto w-full max-w-sm bg-white h-full flex flex-col shadow-xl">
          <div class="flex items-center justify-between px-5 py-4 border-b">
            <h2 class="text-lg font-semibold">Your Cart</h2>
            <button @click="emit('close')" class="text-gray-400 hover:text-gray-600 transition-colors">
              <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div class="flex-1 overflow-y-auto p-5">
            <p v-if="cart.items.length === 0" class="text-center text-gray-400 py-12">
              Your cart is empty
            </p>
            <ul v-else class="space-y-4">
              <li v-for="item in cart.items" :key="item.menuItemId" class="flex items-center gap-3">
                <div class="flex-1 min-w-0">
                  <p class="font-medium text-sm text-gray-900 truncate">{{ item.name }}</p>
                  <p class="text-xs text-gray-500">{{ item.price.toFixed(2) }} EGP × {{ item.quantity }}</p>
                </div>
                <div class="flex items-center gap-1 border rounded-lg overflow-hidden">
                  <button
                    @click="cart.updateQuantity(item.menuItemId, item.quantity - 1)"
                    class="px-2 py-1 text-gray-600 hover:bg-gray-100 transition-colors text-base leading-none"
                  >−</button>
                  <span class="px-2 text-sm font-medium w-6 text-center">{{ item.quantity }}</span>
                  <button
                    @click="cart.updateQuantity(item.menuItemId, item.quantity + 1)"
                    class="px-2 py-1 text-gray-600 hover:bg-gray-100 transition-colors text-base leading-none"
                  >+</button>
                </div>
                <button
                  @click="cart.removeItem(item.menuItemId)"
                  class="text-red-400 hover:text-red-600 transition-colors"
                >
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </li>
            </ul>
          </div>

          <div v-if="cart.items.length > 0" class="border-t p-5 space-y-3">
            <div class="flex justify-between text-sm font-medium text-gray-900">
              <span>Total</span>
              <span>{{ cart.total.toFixed(2) }} EGP</span>
            </div>
            <button
              @click="goToCheckout"
              class="w-full bg-brand-500 hover:bg-brand-600 text-white py-3 rounded-xl font-semibold transition-colors"
            >
              Checkout
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.drawer-enter-active,
.drawer-leave-active {
  transition: opacity 0.2s ease;
}
.drawer-enter-active .relative,
.drawer-leave-active .relative {
  transition: transform 0.3s ease;
}
.drawer-enter-from,
.drawer-leave-to {
  opacity: 0;
}
</style>
