<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getDashboardSettings, updateRestaurantSettings } from '@/api/restaurant-dashboard'
import type { DashboardRestaurantSettings } from '@/api/restaurant-dashboard'

const settings = ref<DashboardRestaurantSettings | null>(null)
const loading = ref(true)
const saving = ref(false)
const saved = ref(false)
const error = ref<string | null>(null)

const draft = ref({
  name: '',
  description: '' as string | null,
  address: '',
  deliveryFee: '',
})

onMounted(async () => {
  try {
    const data = await getDashboardSettings()
    settings.value = data
    draft.value = {
      name: data.name,
      description: data.description ?? '',
      address: data.address,
      deliveryFee: data.deliveryFee,
    }
  } finally {
    loading.value = false
  }
})

async function save() {
  saving.value = true
  error.value = null
  saved.value = false
  try {
    const updated = await updateRestaurantSettings({
      name: draft.value.name,
      description: draft.value.description || null,
      address: draft.value.address,
      deliveryFee: draft.value.deliveryFee,
    })
    settings.value = updated
    saved.value = true
    setTimeout(() => (saved.value = false), 2500)
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Failed to save'
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <div class="p-6 max-w-xl mx-auto">
    <h1 class="text-2xl font-bold text-gray-900 mb-6">Restaurant Settings</h1>

    <div v-if="loading" class="bg-white rounded-2xl p-6 space-y-4 animate-pulse">
      <div v-for="n in 4" :key="n" class="h-10 bg-gray-100 rounded-lg" />
    </div>

    <form v-else @submit.prevent="save" class="bg-white rounded-2xl shadow-sm p-6 space-y-5">
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Restaurant Name</label>
        <input
          v-model="draft.name"
          required
          class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
        />
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Description <span class="text-gray-400 font-normal">(optional)</span></label>
        <textarea
          v-model="draft.description"
          rows="3"
          class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 resize-none"
        />
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Address</label>
        <input
          v-model="draft.address"
          required
          class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
        />
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Delivery Fee (EGP)</label>
        <input
          v-model="draft.deliveryFee"
          type="number"
          min="0"
          step="0.5"
          class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
        />
      </div>

      <p v-if="error" class="text-red-600 text-sm">{{ error }}</p>

      <button
        type="submit"
        :disabled="saving"
        class="w-full bg-brand-500 hover:bg-brand-600 disabled:opacity-40 text-white py-2.5 rounded-lg font-semibold text-sm transition-colors"
      >
        <span v-if="saving">Saving…</span>
        <span v-else-if="saved" class="text-green-100">Saved!</span>
        <span v-else>Save Changes</span>
      </button>
    </form>
  </div>
</template>
