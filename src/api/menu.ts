import client from './client'
import type { MenuItem } from '@/types'

export const menuApi = {
  getByRestaurant(restaurantId: string): Promise<MenuItem[]> {
    return client.get(`/menu/${restaurantId}`)
  },
  getById(id: string): Promise<MenuItem> {
    return client.get(`/menu/item/${id}`)
  },
}
