<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { restaurantsApi } from '@/api/restaurants'
import RestaurantCard from '@/components/customer/RestaurantCard.vue'
import type { Restaurant } from '@/types'

const restaurants = ref<Restaurant[]>([])
const loading = ref(true)
const error = ref<string | null>(null)

onMounted(async () => {
  try {
    restaurants.value = await restaurantsApi.getAll()
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Failed to load restaurants'
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div class="max-w-6xl mx-auto px-4 py-8">
    <h1 class="text-2xl font-bold text-gray-900 mb-6">Restaurants</h1>

    <div v-if="loading" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      <div
        v-for="n in 6"
        :key="n"
        class="bg-white rounded-2xl shadow-sm overflow-hidden animate-pulse"
      >
        <div class="h-44 bg-gray-200" />
        <div class="p-4 space-y-2">
          <div class="h-5 bg-gray-200 rounded w-2/3" />
          <div class="h-4 bg-gray-200 rounded w-1/3" />
        </div>
      </div>
    </div>

    <p v-else-if="error" class="text-red-600">{{ error }}</p>

    <p v-else-if="restaurants.length === 0" class="text-gray-500">No restaurants found.</p>

    <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      <RestaurantCard v-for="r in restaurants" :key="r.id" :restaurant="r" />
    </div>
  </div>
</template>
