<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { ordersApi } from '@/api/orders'
import OrderStatusBadge from '@/components/customer/OrderStatusBadge.vue'
import StatusUpdater from '@/components/admin/StatusUpdater.vue'
import type { Order, OrderStatus } from '@/types'

const route = useRoute()
const order = ref<Order | null>(null)
const loading = ref(true)
const error = ref<string | null>(null)

onMounted(async () => {
  try {
    order.value = await ordersApi.getById(route.params.id as string)
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Failed to load order'
  } finally {
    loading.value = false
  }
})

function onStatusUpdated(status: OrderStatus) {
  if (order.value) order.value.status = status
}
</script>

<template>
  <div class="px-4 py-6 sm:p-8 max-w-2xl">
    <div v-if="loading" class="animate-pulse space-y-4">
      <div class="h-6 bg-gray-200 rounded w-1/3" />
      <div class="h-40 bg-gray-200 rounded" />
    </div>

    <p v-else-if="error" class="text-red-600">{{ error }}</p>

    <template v-else-if="order">
      <h1 class="text-xl font-bold text-gray-900 mb-1">Order</h1>
      <p class="text-xs text-gray-400 mb-5 font-mono">{{ order.id }}</p>

      <div class="grid gap-5">
        <div class="bg-white rounded-xl border p-5 space-y-3">
          <div class="flex flex-wrap gap-2">
            <OrderStatusBadge :status="order.status" />
            <OrderStatusBadge :payment-status="order.paymentStatus" />
          </div>
          <div class="text-sm text-gray-600 space-y-1">
            <p><span class="font-medium text-gray-900">User ID:</span> <span class="font-mono">{{ order.userId }}</span></p>
            <p><span class="font-medium text-gray-900">Restaurant ID:</span> <span class="font-mono">{{ order.restaurantId }}</span></p>
            <p><span class="font-medium text-gray-900">Delivery to:</span> {{ order.deliveryAddress }}</p>
            <p><span class="font-medium text-gray-900">Total:</span> {{ parseFloat(order.totalAmount).toFixed(2) }} EGP</p>
            <p><span class="font-medium text-gray-900">Placed:</span> {{ new Date(order.createdAt).toLocaleString() }}</p>
          </div>
        </div>

        <div class="bg-white rounded-xl border p-5">
          <h2 class="font-semibold text-gray-900 mb-3">Items</h2>
          <ul class="space-y-2 text-sm">
            <li
              v-for="item in order.items"
              :key="item.id"
              class="flex justify-between text-gray-700"
            >
              <span>{{ item.menuItem.name }} × {{ item.quantity }}</span>
              <span>{{ (parseFloat(item.unitPrice) * item.quantity).toFixed(2) }} EGP</span>
            </li>
          </ul>
        </div>

        <StatusUpdater
          :order-id="order.id"
          :current-status="order.status"
          @updated="onStatusUpdated"
        />
      </div>
    </template>
  </div>
</template>
