<script setup lang="ts">
import { ref } from 'vue'
import type { MenuItem } from '@/types'
import { useCartStore } from '@/stores/cart.store'

const props = defineProps<{ item: MenuItem; restaurantId: string }>()
const cart = useCartStore()
const qty = ref(1)
const added = ref(false)
const addBtn = ref<HTMLButtonElement | null>(null)

function addToCart() {
  cart.addItem({
    menuItemId: props.item.id,
    name: props.item.name,
    price: parseFloat(props.item.price),
    quantity: qty.value,
    restaurantId: props.restaurantId,
  })
  added.value = true
  setTimeout(() => (added.value = false), 1500)
  const rect = addBtn.value?.getBoundingClientRect()
  if (rect) cart.triggerFly(rect.left + rect.width / 2, rect.top + rect.height / 2, props.item.imageUrl, props.item.name)
}
</script>

<template>
  <div class="bg-white rounded-xl border border-gray-100 p-4 flex gap-4">
    <div class="w-20 h-20 flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden">
      <img
        v-if="item.imageUrl"
        :src="item.imageUrl"
        :alt="item.name"
        class="w-full h-full object-cover"
      />
      <div v-else class="w-full h-full flex items-center justify-center text-gray-300">
        <svg class="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
            d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
      </div>
    </div>

    <div class="flex-1 min-w-0">
      <h4 class="font-medium text-gray-900">{{ item.name }}</h4>
      <p v-if="item.description" class="text-sm text-gray-500 mt-0.5 line-clamp-2">
        {{ item.description }}
      </p>
      <p class="text-brand-600 font-semibold mt-1">{{ parseFloat(item.price).toFixed(2) }} EGP</p>
    </div>

    <div class="flex flex-col items-end justify-between flex-shrink-0">
      <div class="flex items-center gap-1 border rounded-lg overflow-hidden">
        <button
          @click="qty = Math.max(1, qty - 1)"
          class="px-2 py-1 text-gray-600 hover:bg-gray-100 transition-colors text-lg leading-none"
        >−</button>
        <span class="px-2 text-sm font-medium w-6 text-center">{{ qty }}</span>
        <button
          @click="qty++"
          class="px-2 py-1 text-gray-600 hover:bg-gray-100 transition-colors text-lg leading-none"
        >+</button>
      </div>
      <button
        ref="addBtn"
        @click="addToCart"
        :class="[
          'mt-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
          added
            ? 'bg-green-500 text-white'
            : 'bg-brand-500 hover:bg-brand-600 text-white',
        ]"
      >
        {{ added ? 'Added!' : 'Add' }}
      </button>
    </div>
  </div>
</template>
