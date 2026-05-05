<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { restaurantsApi } from '@/api/restaurants'
import MenuItemCard from '@/components/customer/MenuItemCard.vue'
import type { RestaurantWithMenu } from '@/types'

const route = useRoute()
const restaurant = ref<RestaurantWithMenu | null>(null)
const loading = ref(true)
const error = ref<string | null>(null)

onMounted(async () => {
  try {
    restaurant.value = await restaurantsApi.getById(route.params.id as string)
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Failed to load restaurant'
  } finally {
    loading.value = false
  }
})

const groupedMenu = computed(() => {
  if (!restaurant.value) return {}
  return restaurant.value.menuItems.reduce<Record<string, typeof restaurant.value.menuItems>>(
    (acc, item) => {
      ;(acc[item.category] ??= []).push(item)
      return acc
    },
    {},
  )
})
</script>

<template>
  <div class="max-w-3xl mx-auto px-4 py-8">
    <div v-if="loading" class="animate-pulse space-y-4">
      <div class="h-8 bg-gray-200 rounded w-1/2" />
      <div class="h-4 bg-gray-200 rounded w-1/4" />
    </div>

    <p v-else-if="error" class="text-red-600">{{ error }}</p>

    <template v-else-if="restaurant">
      <div class="mb-6">
        <h1 class="text-2xl font-bold text-gray-900">{{ restaurant.name }}</h1>
        <div class="flex items-center gap-2 mt-1">
          <span class="text-xs bg-brand-50 text-brand-700 px-2 py-0.5 rounded-full font-medium">
            {{ restaurant.category }}
          </span>
          <span class="text-sm text-gray-500">{{ restaurant.address }}</span>
        </div>
        <p v-if="restaurant.description" class="text-gray-600 mt-2">
          {{ restaurant.description }}
        </p>
      </div>

      <div v-if="Object.keys(groupedMenu).length === 0" class="text-gray-500">
        No items available.
      </div>

      <div v-else class="space-y-8">
        <section v-for="(items, category) in groupedMenu" :key="category">
          <h2 class="text-lg font-semibold text-gray-800 mb-3 pb-2 border-b">{{ category }}</h2>
          <div class="space-y-3">
            <MenuItemCard
              v-for="item in items"
              :key="item.id"
              :item="item"
              :restaurant-id="restaurant.id"
            />
          </div>
        </section>
      </div>
    </template>
  </div>
</template>
