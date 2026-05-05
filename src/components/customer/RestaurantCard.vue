
<script setup lang="ts">
import { RouterLink } from 'vue-router'
import type { Restaurant } from '@/types'

defineProps<{ restaurant: Restaurant }>()
</script>

<template>
  <RouterLink
    :to="`/restaurants/${restaurant.id}`"
    class="bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow overflow-hidden block group"
  >
    <div class="h-44 bg-gray-100 overflow-hidden">
      <img
        v-if="restaurant.imageUrl"
        :src="restaurant.imageUrl"
        :alt="restaurant.name"
        class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
      />
      <div v-else class="w-full h-full flex items-center justify-center text-gray-300">
        <svg class="w-16 h-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1"
            d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      </div>
    </div>
    <div class="p-4">
      <h3 class="font-semibold text-gray-900 text-lg">{{ restaurant.name }}</h3>
      <div class="flex items-center gap-2 mt-1">
        <span class="text-xs bg-brand-50 text-brand-700 px-2 py-0.5 rounded-full font-medium">
          {{ restaurant.category }}
        </span>
        <span class="text-xs text-gray-500">{{ restaurant.address }}</span>
      </div>
      <p v-if="restaurant.description" class="text-sm text-gray-500 mt-2 line-clamp-2">
        {{ restaurant.description }}
      </p>
    </div>
  </RouterLink>
</template>
