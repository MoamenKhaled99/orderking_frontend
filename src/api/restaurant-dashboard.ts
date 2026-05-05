import client from './client'
import type { OrderStatus } from '@/types'

export interface DashboardOrder {
  id: string
  status: OrderStatus
  totalAmount: string
  deliveryAddress: string
  createdAt: string
  items: Array<{ id: string; quantity: number; unitPrice: string; menuItem: { id: string; name: string } }>
}

export interface DashboardStats {
  totalRevenue: string
  totalOrders: number
  pendingOrders: number
  ordersToday: number
}

export interface DashboardMenuItem {
  id: string
  name: string
  description: string | null
  price: string
  category: string
  imageUrl: string | null
  isAvailable: boolean
}

export interface DashboardRestaurantSettings {
  id: string
  name: string
  description: string | null
  address: string
  category: string
  deliveryFee: string
}

export function getDashboardOrders(): Promise<DashboardOrder[]> {
  return client.get('/restaurant-dashboard/orders')
}

export function updateOrderStatus(orderId: string, status: OrderStatus): Promise<void> {
  return client.patch(`/restaurant-dashboard/orders/${orderId}/status`, { status })
}

export function getDashboardStats(): Promise<DashboardStats> {
  return client.get('/restaurant-dashboard/stats')
}

export function getDashboardMenu(): Promise<DashboardMenuItem[]> {
  return client.get('/restaurant-dashboard/menu')
}

export function createMenuItem(data: { name: string; price: string; category: string; description?: string | null; imageUrl?: string | null; isAvailable?: boolean }): Promise<DashboardMenuItem> {
  return client.post('/restaurant-dashboard/menu', data)
}

export function updateMenuItem(id: string, data: Partial<Pick<DashboardMenuItem, 'name' | 'price' | 'category' | 'description' | 'isAvailable' | 'imageUrl'>>): Promise<DashboardMenuItem> {
  return client.patch(`/restaurant-dashboard/menu/${id}`, data)
}

export function getDashboardSettings(): Promise<DashboardRestaurantSettings> {
  return client.get('/restaurant-dashboard/settings')
}

export function updateRestaurantSettings(data: Partial<Pick<DashboardRestaurantSettings, 'name' | 'description' | 'address' | 'deliveryFee'>>): Promise<DashboardRestaurantSettings> {
  return client.patch('/restaurant-dashboard/settings', data)
}

export function registerRestaurant(data: { name: string; category: string; address: string; description?: string; deliveryFee?: number }): Promise<{ id: string; name: string }> {
  return client.post('/restaurants/register', data)
}
