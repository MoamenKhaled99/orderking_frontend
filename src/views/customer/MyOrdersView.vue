<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import client from '@/api/client'
import type { OrderStatus, PaymentStatus } from '@/types'

interface MyOrder {
  id: string
  status: OrderStatus
  paymentStatus: PaymentStatus
  paymentMethod: 'CASH' | 'CARD'
  totalAmount: string
  deliveryAddress: string
  createdAt: string
  restaurant: { id: string; name: string; imageUrl: string | null }
  items: Array<{ id: string; quantity: number; menuItem: { name: string } }>
}

const router = useRouter()
const orders = ref<MyOrder[]>([])
const loading = ref(true)
const error = ref<string | null>(null)

const STATUS_LABEL: Record<OrderStatus, string> = {
  PENDING: 'Pending',
  CONFIRMED: 'Confirmed',
  PREPARING: 'Preparing',
  OUT_FOR_DELIVERY: 'On the way',
  DELIVERED: 'Delivered',
  CANCELLED: 'Cancelled',
}

const STATUS_COLOR: Record<OrderStatus, string> = {
  PENDING: 'bg-yellow-100 text-yellow-700',
  CONFIRMED: 'bg-blue-100 text-blue-700',
  PREPARING: 'bg-orange-100 text-orange-700',
  OUT_FOR_DELIVERY: 'bg-purple-100 text-purple-700',
  DELIVERED: 'bg-green-100 text-green-700',
  CANCELLED: 'bg-red-100 text-red-700',
}

onMounted(async () => {
  try {
    orders.value = await client.get('/orders/my')
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Failed to load orders'
  } finally {
    loading.value = false
  }
})

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

function itemsSummary(items: MyOrder['items']) {
  return items.map((i) => `${i.quantity}× ${i.menuItem.name}`).join(', ')
}
</script>

<template>
  <div class="max-w-2xl mx-auto px-4 py-8">
    <h1 class="text-2xl font-bold text-gray-900 mb-6">My Orders</h1>

    <div v-if="loading" class="space-y-4">
      <div v-for="n in 3" :key="n" class="bg-white rounded-2xl p-5 animate-pulse">
        <div class="h-4 bg-gray-200 rounded w-1/3 mb-3" />
        <div class="h-3 bg-gray-100 rounded w-2/3" />
      </div>
    </div>

    <p v-else-if="error" class="text-red-500 text-sm">{{ error }}</p>

    <div v-else-if="orders.length === 0" class="text-center py-20">
      <svg class="w-16 h-16 text-gray-200 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      </svg>
      <p class="text-gray-500 font-medium mb-1">No orders yet</p>
      <p class="text-gray-400 text-sm mb-4">Browse restaurants and place your first order</p>
      <RouterLink to="/" class="inline-block bg-brand-500 text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-brand-600 transition-colors">
        Browse Restaurants
      </RouterLink>
    </div>

    <div v-else class="space-y-4">
      <button
        v-for="order in orders"
        :key="order.id"
        @click="router.push(`/orders/${order.id}`)"
        class="w-full bg-white rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow text-left"
      >
        <div class="flex items-start justify-between gap-3">
          <div class="flex items-center gap-3">
            <div v-if="order.restaurant.imageUrl" class="w-10 h-10 rounded-xl overflow-hidden shrink-0">
              <img :src="order.restaurant.imageUrl" :alt="order.restaurant.name" class="w-full h-full object-cover" />
            </div>
            <div v-else class="w-10 h-10 rounded-xl bg-brand-100 flex items-center justify-center shrink-0">
              <svg class="w-5 h-5 text-brand-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-2 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <div>
              <p class="font-semibold text-gray-900 text-sm">{{ order.restaurant.name }}</p>
              <p class="text-xs text-gray-500 mt-0.5">{{ formatDate(order.createdAt) }}</p>
            </div>
          </div>
          <span :class="['text-xs font-medium px-2.5 py-1 rounded-full shrink-0', STATUS_COLOR[order.status]]">
            {{ STATUS_LABEL[order.status] }}
          </span>
        </div>

        <p class="text-xs text-gray-500 mt-3 line-clamp-1">{{ itemsSummary(order.items) }}</p>

        <div class="flex items-center justify-between mt-3 pt-3 border-t border-gray-50">
          <span class="text-sm font-bold text-gray-900">EGP {{ Number(order.totalAmount).toFixed(2) }}</span>
          <span class="text-xs text-gray-400 flex items-center gap-1">
            View details
            <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </span>
        </div>
      </button>
    </div>
  </div>
</template>
