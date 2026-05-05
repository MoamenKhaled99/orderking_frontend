import client from './client'
import type { Order, OrderStatusResponse, CreateOrderPayload } from '@/types'

export const ordersApi = {
  create(payload: CreateOrderPayload): Promise<Order> {
    return client.post('/orders', payload)
  },
  getById(id: string): Promise<Order> {
    return client.get(`/orders/${id}`)
  },
  getStatus(id: string): Promise<OrderStatusResponse> {
    return client.get(`/orders/${id}/status`)
  },
  updateStatus(id: string, status: string): Promise<{ id: string; status: string }> {
    return client.patch(`/orders/${id}/status`, { status })
  },
}
