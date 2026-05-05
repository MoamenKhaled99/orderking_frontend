<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useCartStore } from '@/stores/cart.store'
import { ordersApi } from '@/api/orders'

const cart = useCartStore()
const router = useRouter()
const deliveryAddress = ref('')
const loading = ref(false)
const error = ref<string | null>(null)

async function placeOrder() {
  if (!cart.restaurantId || cart.items.length === 0) return
  if (deliveryAddress.value.trim().length < 5) {
    error.value = 'Delivery address must be at least 5 characters.'
    return
  }
  error.value = null
  loading.value = true
  try {
    const order = await ordersApi.create({
      restaurantId: cart.restaurantId,
      deliveryAddress: deliveryAddress.value.trim(),
      items: cart.items.map((i) => ({ menuItemId: i.menuItemId, quantity: i.quantity })),
    })
    cart.clear()
    router.push(`/orders/${order.id}`)
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Failed to place order'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="max-w-xl mx-auto px-4 py-8">
    <h1 class="text-2xl font-bold text-gray-900 mb-6">Checkout</h1>

    <div v-if="cart.items.length === 0" class="text-gray-500">
      Your cart is empty. <RouterLink to="/" class="text-brand-600 underline">Browse restaurants</RouterLink>
    </div>

    <template v-else>
      <div class="bg-white rounded-2xl shadow-sm p-5 mb-5">
        <h2 class="font-semibold text-gray-900 mb-3">Order Summary</h2>
        <ul class="space-y-2 text-sm">
          <li
            v-for="item in cart.items"
            :key="item.menuItemId"
            class="flex justify-between text-gray-700"
          >
            <span>{{ item.name }} × {{ item.quantity }}</span>
            <span>{{ (item.price * item.quantity).toFixed(2) }} EGP</span>
          </li>
        </ul>
        <div class="border-t mt-3 pt-3 flex justify-between font-semibold text-gray-900">
          <span>Total</span>
          <span>{{ cart.total.toFixed(2) }} EGP</span>
        </div>
      </div>

      <div class="bg-white rounded-2xl shadow-sm p-5 mb-5">
        <h2 class="font-semibold text-gray-900 mb-3">Delivery Address</h2>
        <textarea
          v-model="deliveryAddress"
          rows="3"
          placeholder="e.g. 123 Nile Street, Cairo"
          class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 resize-none"
        />
      </div>

      <p v-if="error" class="text-red-600 text-sm mb-4">{{ error }}</p>

      <button
        @click="placeOrder"
        :disabled="loading"
        class="w-full bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white py-3 rounded-xl font-semibold transition-colors"
      >
        {{ loading ? 'Placing order…' : 'Place Order' }}
      </button>
    </template>
  </div>
</template>
