import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth.store'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/login',
      component: () => import('@/views/auth/LoginView.vue'),
    },
    {
      path: '/',
      component: () => import('@/layouts/CustomerLayout.vue'),
      children: [
        { path: '', component: () => import('@/views/customer/HomeView.vue') },
        { path: 'restaurants/:id', component: () => import('@/views/customer/RestaurantView.vue') },
        {
          path: 'checkout',
          component: () => import('@/views/customer/CheckoutView.vue'),
          meta: { requiresAuth: true },
        },
        {
          path: 'orders/:id',
          component: () => import('@/views/customer/OrderDetailView.vue'),
          meta: { requiresAuth: true },
        },
      ],
    },
    {
      path: '/admin',
      component: () => import('@/layouts/AdminLayout.vue'),
      meta: { requiresAuth: true },
      children: [
        { path: '', component: () => import('@/views/admin/AdminOrderSearchView.vue') },
        { path: 'orders/:id', component: () => import('@/views/admin/AdminOrderDetailView.vue') },
      ],
    },
    { path: '/:pathMatch(.*)*', redirect: '/' },
  ],
})

router.beforeEach(async (to) => {
  if (to.meta.requiresAuth) {
    const auth = useAuthStore()
    await auth.init()
    if (!auth.token) {
      return { path: '/login', query: { redirect: to.fullPath } }
    }
  }
})

export default router
