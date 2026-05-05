import client from './client'

export interface MeResponse {
  role: 'CUSTOMER' | 'RESTAURANT_OWNER'
  restaurantId?: string
}

export function getMe(): Promise<MeResponse> {
  return client.get('/me')
}
