<script setup lang="ts">
import { ref } from 'vue'
import type { OrderStatus } from '@/types'
import { ordersApi } from '@/api/orders'

const props = defineProps<{ orderId: string; currentStatus: OrderStatus }>()
const emit = defineEmits<{ updated: [status: OrderStatus] }>()

const statuses: OrderStatus[] = [
  'PENDING',
  'CONFIRMED',
  'PREPARING',
  'OUT_FOR_DELIVERY',
  'DELIVERED',
  'CANCELLED',
]

const selected = ref<OrderStatus>(props.currentStatus)
const loading = ref(false)
const error = ref<string | null>(null)
const success = ref(false)

async function submit() {
  if (selected.value === props.currentStatus) return
  loading.value = true
  error.value = null
  success.value = false
  try {
    await ordersApi.updateStatus(props.orderId, selected.value)
    success.value = true
    emit('updated', selected.value)
    setTimeout(() => (success.value = false), 2000)
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Failed to update status'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="bg-white rounded-xl border p-5 space-y-3">
    <h3 class="font-semibold text-gray-900">Update Order Status</h3>
    <select
      v-model="selected"
      class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
    >
      <option v-for="s in statuses" :key="s" :value="s">
        {{ s.replace(/_/g, ' ') }}
      </option>
    </select>
    <button
      @click="submit"
      :disabled="loading || selected === currentStatus"
      class="w-full bg-brand-500 hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed text-white py-2 rounded-lg text-sm font-medium transition-colors"
    >
      {{ loading ? 'Saving…' : 'Save Status' }}
    </button>
    <p v-if="success" class="text-green-600 text-sm">Status updated successfully.</p>
    <p v-if="error" class="text-red-600 text-sm">{{ error }}</p>
  </div>
</template>
