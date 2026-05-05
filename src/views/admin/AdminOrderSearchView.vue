<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const orderId = ref('')

function search() {
  const id = orderId.value.trim()
  if (id) router.push(`/admin/orders/${id}`)
}
</script>

<template>
  <div class="p-8">
    <h1 class="text-xl font-bold text-gray-900 mb-2">Order Lookup</h1>
    <p class="text-sm text-gray-500 mb-6">Enter an order UUID to view its details and update its status.</p>

    <div class="max-w-md">
      <form @submit.prevent="search" class="flex gap-3">
        <input
          v-model="orderId"
          type="text"
          placeholder="Order UUID"
          class="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 font-mono"
        />
        <button
          type="submit"
          :disabled="!orderId.trim()"
          class="bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white px-5 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          Look up
        </button>
      </form>
    </div>
  </div>
</template>
