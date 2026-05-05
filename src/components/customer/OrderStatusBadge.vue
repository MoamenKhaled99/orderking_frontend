<script setup lang="ts">
import type { OrderStatus, PaymentStatus } from '@/types'

const props = defineProps<{
  status?: OrderStatus
  paymentStatus?: PaymentStatus
}>()

const statusColors: Record<OrderStatus, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  CONFIRMED: 'bg-blue-100 text-blue-800',
  PREPARING: 'bg-purple-100 text-purple-800',
  OUT_FOR_DELIVERY: 'bg-indigo-100 text-indigo-800',
  DELIVERED: 'bg-green-100 text-green-800',
  CANCELLED: 'bg-red-100 text-red-800',
}

const paymentColors: Record<PaymentStatus, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  SUCCESS: 'bg-green-100 text-green-800',
  FAILED: 'bg-red-100 text-red-800',
}
</script>

<template>
  <span
    v-if="status"
    :class="['inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium', statusColors[status]]"
  >
    {{ status.replace(/_/g, ' ') }}
  </span>
  <span
    v-if="paymentStatus"
    :class="['inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium', paymentColors[paymentStatus]]"
  >
    Payment: {{ paymentStatus }}
  </span>
</template>
