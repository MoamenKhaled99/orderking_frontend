export interface Restaurant {
  id: string
  name: string
  description: string | null
  imageUrl: string | null
  address: string
  category: string
  deliveryFee: string
  createdAt: string
}

export interface MenuItem {
  id: string
  restaurantId: string
  name: string
  description: string | null
  price: string
  category: string
  imageUrl: string | null
  isAvailable: boolean
  createdAt: string
}

export interface RestaurantWithMenu extends Restaurant {
  menuItems: MenuItem[]
}

export type OrderStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'PREPARING'
  | 'OUT_FOR_DELIVERY'
  | 'DELIVERED'
  | 'CANCELLED'

export type PaymentStatus = 'PENDING' | 'SUCCESS' | 'FAILED'

export interface OrderItem {
  id: string
  menuItemId: string
  quantity: number
  unitPrice: string
  menuItem: {
    id: string
    name: string
    price: string
    category: string
  }
}

export interface Order {
  id: string
  restaurantId: string
  userId: string
  status: OrderStatus
  paymentStatus: PaymentStatus
  paymentMethod: PaymentMethod
  totalAmount: string
  deliveryAddress: string
  createdAt: string
  updatedAt: string
  items: OrderItem[]
}

export interface OrderStatusResponse {
  orderId: string
  status: OrderStatus
  paymentStatus: PaymentStatus
}

export type PaymentMethod = 'CASH' | 'CARD'

export interface CreateOrderPayload {
  restaurantId: string
  deliveryAddress: string
  items: Array<{ menuItemId: string; quantity: number }>
  paymentMethod: PaymentMethod
  idempotencyKey?: string
}

export interface CartItem {
  menuItemId: string
  name: string
  price: number
  quantity: number
  restaurantId: string
}
