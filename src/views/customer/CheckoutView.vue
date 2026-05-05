<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, RouterLink } from 'vue-router'
import { useCartStore } from '@/stores/cart.store'
import { ordersApi } from '@/api/orders'
import type { Order, PaymentMethod } from '@/types'

const cart = useCartStore()
const router = useRouter()
const deliveryAddress = ref('')
const error = ref<string | null>(null)
const idempotencyKey = ref('')
const paymentMethod = ref<PaymentMethod>('CASH')

type PaymentStep = 'idle' | 'validating' | 'processing' | 'success' | 'failed'
const paymentStep = ref<PaymentStep>('idle')
const placedOrder = ref<Order | null>(null)

onMounted(() => {
  idempotencyKey.value = crypto.randomUUID()
})

async function placeOrder() {
  if (!cart.restaurantId || cart.items.length === 0) return
  if (deliveryAddress.value.trim().length < 5) {
    error.value = 'Delivery address must be at least 5 characters.'
    return
  }
  error.value = null

  paymentStep.value = 'validating'
  await new Promise((r) => setTimeout(r, 600))

  paymentStep.value = 'processing'

  if (paymentMethod.value === 'CASH') {
    await new Promise((r) => setTimeout(r, 800))
  }

  try {
    const order = await ordersApi.create({
      restaurantId: cart.restaurantId,
      deliveryAddress: deliveryAddress.value.trim(),
      items: cart.items.map((i) => ({ menuItemId: i.menuItemId, quantity: i.quantity })),
      paymentMethod: paymentMethod.value,
      idempotencyKey: idempotencyKey.value,
    })
    placedOrder.value = order
    paymentStep.value = order.paymentStatus === 'SUCCESS' ? 'success' : 'failed'

    if (order.paymentStatus === 'SUCCESS') {
      cart.clear()
      setTimeout(() => router.push(`/orders/${order.id}`), 2200)
    }
  } catch (e) {
    paymentStep.value = 'failed'
    error.value = e instanceof Error ? e.message : 'Failed to place order'
  }
}

function retryPayment() {
  idempotencyKey.value = crypto.randomUUID()
  placedOrder.value = null
  error.value = null
  paymentStep.value = 'idle'
}
</script>

<template>
  <div class="max-w-xl mx-auto px-4 py-8">
    <h1 class="text-2xl font-bold text-gray-900 mb-6">Checkout</h1>

    <div v-if="cart.items.length === 0" class="text-gray-500">
      Your cart is empty.
      <RouterLink to="/" class="text-brand-600 underline">Browse restaurants</RouterLink>
    </div>

    <template v-else>
      <!-- Order summary -->
      <div class="bg-white rounded-2xl shadow-sm p-5 mb-5">
        <h2 class="font-semibold text-gray-900 mb-3">Order Summary</h2>
        <ul class="space-y-2 text-sm">
          <li
            v-for="item in cart.items"
            :key="item.menuItemId"
            class="flex justify-between text-gray-700"
          >
            <span>{{ item.name }} × {{ item.quantity }}</span>
            <span>{{ (item.price * item.quantity).toFixed(2) }} EGP</span>
          </li>
        </ul>
        <div class="border-t mt-3 pt-3 flex justify-between font-semibold text-gray-900">
          <span>Total</span>
          <span>{{ cart.total.toFixed(2) }} EGP</span>
        </div>
      </div>

      <!-- Delivery address -->
      <div class="bg-white rounded-2xl shadow-sm p-5 mb-5">
        <h2 class="font-semibold text-gray-900 mb-3">Delivery Address</h2>
        <textarea
          v-model="deliveryAddress"
          rows="3"
          placeholder="e.g. 123 Nile Street, Cairo"
          class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 resize-none"
        />
      </div>

      <!-- Payment method -->
      <div class="bg-white rounded-2xl shadow-sm p-5 mb-5">
        <h2 class="font-semibold text-gray-900 mb-4">Payment Method</h2>
        <div class="grid grid-cols-2 gap-3">
          <!-- Cash -->
          <button
            @click="paymentMethod = 'CASH'"
            :class="[
              'flex items-center gap-3 p-4 rounded-xl border-2 transition-all text-left',
              paymentMethod === 'CASH'
                ? 'border-brand-500 bg-brand-50'
                : 'border-gray-200 hover:border-gray-300',
            ]"
          >
            <div
              :class="[
                'w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0',
                paymentMethod === 'CASH' ? 'bg-brand-100' : 'bg-gray-100',
              ]"
            >
              <svg class="w-5 h-5" :class="paymentMethod === 'CASH' ? 'text-brand-600' : 'text-gray-500'" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div>
              <p class="font-medium text-sm" :class="paymentMethod === 'CASH' ? 'text-brand-700' : 'text-gray-900'">Cash</p>
              <p class="text-xs text-gray-500 mt-0.5">Pay on delivery</p>
            </div>
            <div class="ml-auto">
              <div
                :class="[
                  'w-4 h-4 rounded-full border-2 flex items-center justify-center',
                  paymentMethod === 'CASH' ? 'border-brand-500' : 'border-gray-300',
                ]"
              >
                <div v-if="paymentMethod === 'CASH'" class="w-2 h-2 rounded-full bg-brand-500" />
              </div>
            </div>
          </button>

          <!-- Card -->
          <button
            @click="paymentMethod = 'CARD'"
            :class="[
              'flex items-center gap-3 p-4 rounded-xl border-2 transition-all text-left',
              paymentMethod === 'CARD'
                ? 'border-brand-500 bg-brand-50'
                : 'border-gray-200 hover:border-gray-300',
            ]"
          >
            <div
              :class="[
                'w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0',
                paymentMethod === 'CARD' ? 'bg-brand-100' : 'bg-gray-100',
              ]"
            >
              <svg class="w-5 h-5" :class="paymentMethod === 'CARD' ? 'text-brand-600' : 'text-gray-500'" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
            </div>
            <div>
              <p class="font-medium text-sm" :class="paymentMethod === 'CARD' ? 'text-brand-700' : 'text-gray-900'">Card</p>
              <p class="text-xs text-gray-500 mt-0.5">Visa / Mastercard</p>
            </div>
            <div class="ml-auto">
              <div
                :class="[
                  'w-4 h-4 rounded-full border-2 flex items-center justify-center',
                  paymentMethod === 'CARD' ? 'border-brand-500' : 'border-gray-300',
                ]"
              >
                <div v-if="paymentMethod === 'CARD'" class="w-2 h-2 rounded-full bg-brand-500" />
              </div>
            </div>
          </button>
        </div>

        <p v-if="paymentMethod === 'CASH'" class="text-xs text-gray-400 mt-3">
          Pay the delivery driver in cash when your order arrives.
        </p>
        <p v-else class="text-xs text-gray-400 mt-3">
          Your payment will be processed securely online.
        </p>
      </div>

      <p v-if="error && paymentStep === 'idle'" class="text-red-600 text-sm mb-4">{{ error }}</p>

      <button
        @click="placeOrder"
        :disabled="paymentStep !== 'idle'"
        class="w-full bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white py-3 rounded-xl font-semibold transition-colors"
      >
        {{ paymentMethod === 'CASH' ? 'Place Order — Cash on Delivery' : 'Place Order — Pay by Card' }}
      </button>
    </template>
  </div>

  <!-- Payment simulation overlay -->
  <Teleport to="body">
    <div
      v-if="paymentStep !== 'idle'"
      class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center px-4"
    >
      <div class="bg-white rounded-2xl shadow-xl p-8 w-full max-w-sm text-center">

        <!-- Validating -->
        <template v-if="paymentStep === 'validating'">
          <div class="w-16 h-16 mx-auto mb-4 rounded-full bg-brand-50 flex items-center justify-center">
            <svg class="w-8 h-8 text-brand-500 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"/>
            </svg>
          </div>
          <p class="text-lg font-semibold text-gray-900">Validating order…</p>
          <p class="text-sm text-gray-500 mt-1">Checking item availability</p>
        </template>

        <!-- Processing -->
        <template v-else-if="paymentStep === 'processing'">
          <div class="w-16 h-16 mx-auto mb-4 rounded-full bg-blue-50 flex items-center justify-center">
            <svg class="w-8 h-8 text-blue-500 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/>
            </svg>
          </div>
          <p class="text-lg font-semibold text-gray-900">
            {{ paymentMethod === 'CASH' ? 'Confirming order…' : 'Processing payment…' }}
          </p>
          <p class="text-sm text-gray-500 mt-1">Please wait</p>
        </template>

        <!-- Success -->
        <template v-else-if="paymentStep === 'success'">
          <div class="w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 flex items-center justify-center">
            <svg class="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/>
            </svg>
          </div>
          <p class="text-lg font-semibold text-gray-900">
            {{ paymentMethod === 'CASH' ? 'Order Confirmed!' : 'Payment Successful!' }}
          </p>
          <p class="text-2xl font-bold text-green-600 mt-2">
            {{ placedOrder ? parseFloat(placedOrder.totalAmount).toFixed(2) + ' EGP' : '' }}
          </p>
          <p class="text-sm text-gray-500 mt-1">
            {{ paymentMethod === 'CASH' ? 'Pay the driver on arrival' : '' }}
          </p>
          <p class="text-sm text-gray-400 mt-3">Redirecting to your order…</p>
        </template>

        <!-- Failed -->
        <template v-else-if="paymentStep === 'failed'">
          <div class="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
            <svg class="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </div>
          <p class="text-lg font-semibold text-gray-900">Payment Declined</p>
          <p class="text-sm text-gray-500 mt-1 mb-5">
            {{ error ?? 'Your card could not be charged. Please try again.' }}
          </p>
          <button
            @click="retryPayment"
            class="w-full bg-brand-500 hover:bg-brand-600 text-white py-2.5 rounded-xl font-semibold text-sm transition-colors"
          >
            Try Again
          </button>
        </template>

      </div>
    </div>
  </Teleport>
</template>
