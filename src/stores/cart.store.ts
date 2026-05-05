import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { CartItem } from '@/types'

export const useCartStore = defineStore(
  'cart',
  () => {
    const items = ref<CartItem[]>([])

    const total = computed(() =>
      items.value.reduce((sum, i) => sum + i.price * i.quantity, 0),
    )

    const count = computed(() =>
      items.value.reduce((sum, i) => sum + i.quantity, 0),
    )

    const restaurantId = computed(() => items.value[0]?.restaurantId ?? null)

    function addItem(item: CartItem) {
      if (items.value.length > 0 && items.value[0].restaurantId !== item.restaurantId) {
        items.value = []
      }
      const existing = items.value.find((i) => i.menuItemId === item.menuItemId)
      if (existing) {
        existing.quantity += item.quantity
      } else {
        items.value.push({ ...item })
      }
    }

    function removeItem(menuItemId: string) {
      items.value = items.value.filter((i) => i.menuItemId !== menuItemId)
    }

    function updateQuantity(menuItemId: string, quantity: number) {
      const item = items.value.find((i) => i.menuItemId === menuItemId)
      if (item) {
        if (quantity <= 0) {
          removeItem(menuItemId)
        } else {
          item.quantity = quantity
        }
      }
    }

    function clear() {
      items.value = []
    }

    const animationTrigger = ref<{ x: number; y: number } | null>(null)

    function triggerFly(x: number, y: number) {
      animationTrigger.value = { x, y }
      setTimeout(() => (animationTrigger.value = null), 800)
    }

    return { items, total, count, restaurantId, addItem, removeItem, updateQuantity, clear, animationTrigger, triggerFly }
  },
  { persist: true },
)
