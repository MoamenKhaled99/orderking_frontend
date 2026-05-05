<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { getDashboardOrders, updateOrderStatus } from '@/api/restaurant-dashboard'
import type { DashboardOrder } from '@/api/restaurant-dashboard'
import type { OrderStatus } from '@/types'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/stores/auth.store'

const auth = useAuthStore()
const orders = ref<DashboardOrder[]>([])
const loading = ref(true)
const actionLoading = ref<string | null>(null)
const activeTab = ref<'PENDING' | 'ACTIVE' | 'DONE'>('PENDING')

const ACTIVE_STATUSES: OrderStatus[] = ['CONFIRMED', 'PREPARING', 'OUT_FOR_DELIVERY']
const DONE_STATUSES: OrderStatus[] = ['DELIVERED', 'CANCELLED']

const tabOrders = computed(() => {
  if (activeTab.value === 'PENDING') return orders.value.filter((o) => o.status === 'PENDING')
  if (activeTab.value === 'ACTIVE') return orders.value.filter((o) => ACTIVE_STATUSES.includes(o.status))
  return orders.value.filter((o) => DONE_STATUSES.includes(o.status))
})

const STATUS_COLOR: Record<OrderStatus, string> = {
  PENDING: 'bg-yellow-100 text-yellow-700',
  CONFIRMED: 'bg-blue-100 text-blue-700',
  PREPARING: 'bg-orange-100 text-orange-700',
  OUT_FOR_DELIVERY: 'bg-purple-100 text-purple-700',
  DELIVERED: 'bg-green-100 text-green-700',
  CANCELLED: 'bg-red-100 text-red-700',
}

let channel: ReturnType<typeof supabase.channel> | null = null

onMounted(async () => {
  orders.value = await getDashboardOrders()
  loading.value = false

  if (auth.restaurantId) {
    channel = supabase
      .channel(`dashboard-orders-${auth.restaurantId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'orders',
        filter: `restaurantId=eq.${auth.restaurantId}`,
      }, async () => {
        orders.value = await getDashboardOrders()
      })
      .subscribe()
  }
})

onUnmounted(() => {
  if (channel) supabase.removeChannel(channel)
})

async function setStatus(orderId: string, status: OrderStatus) {
  actionLoading.value = orderId
  try {
    await updateOrderStatus(orderId, status)
    const order = orders.value.find((o) => o.id === orderId)
    if (order) order.status = status
  } finally {
    actionLoading.value = null
  }
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
}

function itemsSummary(items: DashboardOrder['items']) {
  return items.map((i) => `${i.quantity}× ${i.menuItem.name}`).join(', ')
}
</script>

<template>
  <div class="px-4 py-6 sm:px-6 max-w-4xl mx-auto">
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold text-gray-900">Orders</h1>
      <div class="flex items-center gap-1.5">
        <span class="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
        <span class="text-xs text-gray-500">Live</span>
      </div>
    </div>

    <!-- Tabs -->
    <div class="flex bg-gray-100 rounded-xl p-1 mb-6 w-fit">
      <button
        v-for="tab in [{ key: 'PENDING', label: 'Pending' }, { key: 'ACTIVE', label: 'Active' }, { key: 'DONE', label: 'Completed' }]"
        :key="tab.key"
        @click="activeTab = tab.key as typeof activeTab.value"
        :class="[
          'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
          activeTab === tab.key ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700',
        ]"
      >
        {{ tab.label }}
        <span v-if="tab.key === 'PENDING' && orders.filter((o) => o.status === 'PENDING').length > 0"
          class="ml-1.5 bg-brand-500 text-white text-xs rounded-full px-1.5 py-0.5">
          {{ orders.filter((o) => o.status === 'PENDING').length }}
        </span>
      </button>
    </div>

    <div v-if="loading" class="space-y-4">
      <div v-for="n in 3" :key="n" class="bg-white rounded-2xl p-5 animate-pulse h-28" />
    </div>

    <div v-else-if="tabOrders.length === 0" class="text-center py-16 text-gray-400 text-sm">
      No {{ activeTab.toLowerCase() }} orders
    </div>

    <div v-else class="space-y-4">
      <div v-for="order in tabOrders" :key="order.id" class="bg-white rounded-2xl p-5 shadow-sm">
        <div class="flex items-start justify-between gap-3 mb-3">
          <div>
            <span :class="['text-xs font-medium px-2.5 py-1 rounded-full', STATUS_COLOR[order.status]]">
              {{ order.status.replace(/_/g, ' ') }}
            </span>
            <span class="text-xs text-gray-400 ml-2">{{ formatDate(order.createdAt) }}</span>
          </div>
          <span class="text-sm font-bold text-gray-900">EGP {{ Number(order.totalAmount).toFixed(2) }}</span>
        </div>

        <p class="text-sm text-gray-700 mb-1 font-medium">{{ order.deliveryAddress }}</p>
        <p class="text-xs text-gray-500 mb-4">{{ itemsSummary(order.items) }}</p>

        <div v-if="order.status === 'PENDING'" class="flex gap-2">
          <button
            @click="setStatus(order.id, 'CONFIRMED')"
            :disabled="actionLoading === order.id"
            class="flex-1 py-2 bg-green-500 hover:bg-green-600 disabled:opacity-40 text-white text-sm font-semibold rounded-xl transition-colors"
          >
            Accept
          </button>
          <button
            @click="setStatus(order.id, 'CANCELLED')"
            :disabled="actionLoading === order.id"
            class="flex-1 py-2 border border-red-300 text-red-600 hover:bg-red-50 disabled:opacity-40 text-sm font-semibold rounded-xl transition-colors"
          >
            Decline
          </button>
        </div>

        <div v-else-if="order.status === 'CONFIRMED'" class="flex gap-2">
          <button
            @click="setStatus(order.id, 'PREPARING')"
            :disabled="actionLoading === order.id"
            class="flex-1 py-2 bg-brand-500 hover:bg-brand-600 disabled:opacity-40 text-white text-sm font-semibold rounded-xl transition-colors"
          >
            Start Preparing
          </button>
        </div>

        <div v-else-if="order.status === 'PREPARING'" class="flex gap-2">
          <button
            @click="setStatus(order.id, 'OUT_FOR_DELIVERY')"
            :disabled="actionLoading === order.id"
            class="flex-1 py-2 bg-brand-500 hover:bg-brand-600 disabled:opacity-40 text-white text-sm font-semibold rounded-xl transition-colors"
          >
            Out for Delivery
          </button>
        </div>

        <div v-else-if="order.status === 'OUT_FOR_DELIVERY'" class="flex gap-2">
          <button
            @click="setStatus(order.id, 'DELIVERED')"
            :disabled="actionLoading === order.id"
            class="flex-1 py-2 bg-green-500 hover:bg-green-600 disabled:opacity-40 text-white text-sm font-semibold rounded-xl transition-colors"
          >
            Mark Delivered
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
