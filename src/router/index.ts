import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth.store'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/login',
      component: () => import('@/layouts/PublicLayout.vue'),
      children: [
        { path: '', component: () => import('@/views/auth/LoginView.vue') },
      ],
    },
    {
      path: '/restaurant/login',
      component: () => import('@/layouts/PublicLayout.vue'),
      children: [
        { path: '', component: () => import('@/views/auth/RestaurantLoginView.vue') },
      ],
    },
    {
      path: '/restaurant/register',
      component: () => import('@/layouts/PublicLayout.vue'),
      children: [
        { path: '', component: () => import('@/views/auth/RestaurantRegisterView.vue') },
      ],
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
        {
          path: 'my-orders',
          component: () => import('@/views/customer/MyOrdersView.vue'),
          meta: { requiresAuth: true },
        },
      ],
    },
    {
      path: '/restaurant',
      component: () => import('@/layouts/RestaurantLayout.vue'),
      meta: { requiresRestaurant: true },
      children: [
        { path: 'dashboard', component: () => import('@/views/restaurant/RestaurantDashboardView.vue') },
        { path: 'orders', component: () => import('@/views/restaurant/RestaurantOrdersView.vue') },
        { path: 'menu', component: () => import('@/views/restaurant/RestaurantMenuView.vue') },
        { path: 'settings', component: () => import('@/views/restaurant/RestaurantSettingsView.vue') },
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
  if (to.meta.requiresAuth || to.meta.requiresRestaurant) {
    const auth = useAuthStore()
    await auth.init()
    if (!auth.token) {
      const loginPath = to.meta.requiresRestaurant ? '/restaurant/login' : '/login'
      return { path: loginPath, query: { redirect: to.fullPath } }
    }
    if (to.meta.requiresRestaurant && auth.role !== 'RESTAURANT_OWNER') {
      return { path: '/' }
    }
  }
})

export default router
