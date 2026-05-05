<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { ordersApi } from '@/api/orders'
import OrderStatusBadge from '@/components/customer/OrderStatusBadge.vue'
import type { Order } from '@/types'

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
</script>

<template>
  <div class="max-w-2xl mx-auto px-4 py-8">
    <div v-if="loading" class="animate-pulse space-y-4">
      <div class="h-6 bg-gray-200 rounded w-1/3" />
      <div class="h-32 bg-gray-200 rounded" />
    </div>

    <p v-else-if="error" class="text-red-600">{{ error }}</p>

    <template v-else-if="order">
      <h1 class="text-2xl font-bold text-gray-900 mb-1">Order Details</h1>
      <p class="text-xs text-gray-400 mb-5 font-mono">{{ order.id }}</p>

      <div class="bg-white rounded-2xl shadow-sm p-5 mb-5 space-y-3">
        <div class="flex flex-wrap gap-2">
          <OrderStatusBadge :status="order.status" />
          <OrderStatusBadge :payment-status="order.paymentStatus" />
        </div>
        <div class="text-sm text-gray-600 space-y-1">
          <p><span class="font-medium text-gray-900">Delivery to:</span> {{ order.deliveryAddress }}</p>
          <p><span class="font-medium text-gray-900">Placed:</span> {{ new Date(order.createdAt).toLocaleString() }}</p>
        </div>
      </div>

      <div class="bg-white rounded-2xl shadow-sm p-5">
        <h2 class="font-semibold text-gray-900 mb-3">Items</h2>
        <ul class="space-y-3">
          <li
            v-for="item in order.items"
            :key="item.id"
            class="flex justify-between text-sm text-gray-700"
          >
            <div>
              <p class="font-medium text-gray-900">{{ item.menuItem.name }}</p>
              <p class="text-gray-500">{{ item.unitPrice }} EGP × {{ item.quantity }}</p>
            </div>
            <p class="font-medium">
              {{ (parseFloat(item.unitPrice) * item.quantity).toFixed(2) }} EGP
            </p>
          </li>
        </ul>
        <div class="border-t mt-4 pt-4 flex justify-between font-semibold text-gray-900">
          <span>Total</span>
          <span>{{ parseFloat(order.totalAmount).toFixed(2) }} EGP</span>
        </div>
      </div>
    </template>
  </div>
</template>
