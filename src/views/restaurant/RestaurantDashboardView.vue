<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getDashboardStats, getDashboardOrders, updateOrderStatus } from '@/api/restaurant-dashboard'
import type { DashboardStats, DashboardOrder } from '@/api/restaurant-dashboard'
import type { OrderStatus } from '@/types'

const router = useRouter()
const stats = ref<DashboardStats | null>(null)
const recentOrders = ref<DashboardOrder[]>([])
const loading = ref(true)
const actionLoading = ref<string | null>(null)

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
    const [s, orders] = await Promise.all([getDashboardStats(), getDashboardOrders()])
    stats.value = s
    recentOrders.value = orders.slice(0, 5)
  } finally {
    loading.value = false
  }
})

async function accept(orderId: string) {
  actionLoading.value = orderId
  try {
    await updateOrderStatus(orderId, 'CONFIRMED')
    const order = recentOrders.value.find((o) => o.id === orderId)
    if (order) order.status = 'CONFIRMED'
    if (stats.value) stats.value.pendingOrders = Math.max(0, stats.value.pendingOrders - 1)
  } finally {
    actionLoading.value = null
  }
}

async function decline(orderId: string) {
  actionLoading.value = orderId
  try {
    await updateOrderStatus(orderId, 'CANCELLED')
    const order = recentOrders.value.find((o) => o.id === orderId)
    if (order) order.status = 'CANCELLED'
    if (stats.value) stats.value.pendingOrders = Math.max(0, stats.value.pendingOrders - 1)
  } finally {
    actionLoading.value = null
  }
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
}
</script>

<template>
  <div class="p-6 max-w-5xl mx-auto">
    <h1 class="text-2xl font-bold text-gray-900 mb-6">Dashboard</h1>

    <!-- Stats -->
    <div v-if="loading" class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <div v-for="n in 4" :key="n" class="bg-white rounded-2xl p-5 animate-pulse">
        <div class="h-3 bg-gray-200 rounded w-1/2 mb-3" />
        <div class="h-7 bg-gray-100 rounded w-2/3" />
      </div>
    </div>

    <div v-else-if="stats" class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <div class="bg-white rounded-2xl p-5 shadow-sm">
        <p class="text-xs text-gray-500 font-medium uppercase tracking-wide mb-1">Total Revenue</p>
        <p class="text-2xl font-bold text-gray-900">EGP {{ Number(stats.totalRevenue).toFixed(0) }}</p>
      </div>
      <div class="bg-white rounded-2xl p-5 shadow-sm">
        <p class="text-xs text-gray-500 font-medium uppercase tracking-wide mb-1">Total Orders</p>
        <p class="text-2xl font-bold text-gray-900">{{ stats.totalOrders }}</p>
      </div>
      <div class="bg-white rounded-2xl p-5 shadow-sm">
        <p class="text-xs text-gray-500 font-medium uppercase tracking-wide mb-1">Today</p>
        <p class="text-2xl font-bold text-gray-900">{{ stats.ordersToday }}</p>
      </div>
      <div :class="['rounded-2xl p-5 shadow-sm', stats.pendingOrders > 0 ? 'bg-yellow-50 border border-yellow-200' : 'bg-white']">
        <p class="text-xs text-gray-500 font-medium uppercase tracking-wide mb-1">Pending</p>
        <p :class="['text-2xl font-bold', stats.pendingOrders > 0 ? 'text-yellow-700' : 'text-gray-900']">{{ stats.pendingOrders }}</p>
      </div>
    </div>

    <!-- Recent orders -->
    <div class="bg-white rounded-2xl shadow-sm overflow-hidden">
      <div class="flex items-center justify-between px-6 py-4 border-b border-gray-50">
        <h2 class="font-semibold text-gray-900">Recent Orders</h2>
        <button @click="router.push('/restaurant/orders')" class="text-sm text-brand-600 hover:underline">View all</button>
      </div>

      <div v-if="loading" class="p-6 space-y-4">
        <div v-for="n in 3" :key="n" class="h-14 bg-gray-50 rounded-xl animate-pulse" />
      </div>

      <div v-else-if="recentOrders.length === 0" class="p-8 text-center text-gray-400 text-sm">
        No orders yet
      </div>

      <div v-else class="divide-y divide-gray-50">
        <div v-for="order in recentOrders" :key="order.id" class="px-6 py-4 flex items-center gap-4">
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2">
              <span :class="['text-xs font-medium px-2 py-0.5 rounded-full', STATUS_COLOR[order.status]]">{{ order.status }}</span>
              <span class="text-xs text-gray-400">{{ formatDate(order.createdAt) }}</span>
            </div>
            <p class="text-sm text-gray-600 mt-1 truncate">{{ order.deliveryAddress }}</p>
            <p class="text-xs text-gray-400 mt-0.5">EGP {{ Number(order.totalAmount).toFixed(2) }}</p>
          </div>
          <div v-if="order.status === 'PENDING'" class="flex gap-2 shrink-0">
            <button
              @click="accept(order.id)"
              :disabled="actionLoading === order.id"
              class="px-3 py-1.5 bg-green-500 hover:bg-green-600 disabled:opacity-40 text-white text-xs font-semibold rounded-lg transition-colors"
            >
              Accept
            </button>
            <button
              @click="decline(order.id)"
              :disabled="actionLoading === order.id"
              class="px-3 py-1.5 border border-red-300 text-red-600 hover:bg-red-50 disabled:opacity-40 text-xs font-semibold rounded-lg transition-colors"
            >
              Decline
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
