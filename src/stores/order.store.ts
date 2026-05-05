import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Order } from '@/types'

export const useOrderStore = defineStore('order', () => {
  const currentOrder = ref<Order | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  function setOrder(order: Order) {
    currentOrder.value = order
  }

  function setLoading(val: boolean) {
    loading.value = val
  }

  function setError(msg: string | null) {
    error.value = msg
  }

  function reset() {
    currentOrder.value = null
    loading.value = false
    error.value = null
  }

  return { currentOrder, loading, error, setOrder, setLoading, setError, reset }
})
