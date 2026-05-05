import client from './client'
import type { Restaurant, RestaurantWithMenu } from '@/types'

export const restaurantsApi = {
  getAll(): Promise<Restaurant[]> {
    return client.get('/restaurants')
  },
  getById(id: string): Promise<RestaurantWithMenu> {
    return client.get(`/restaurants/${id}`)
  },
}
