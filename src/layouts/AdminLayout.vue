<script setup lang="ts">
import { RouterLink, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth.store'

const auth = useAuthStore()
const router = useRouter()

async function handleLogout() {
  await auth.logout()
  router.push('/login')
}
</script>

<template>
  <div class="min-h-screen bg-gray-100 flex">
    <aside class="w-56 bg-white shadow-md flex flex-col">
      <div class="h-16 flex items-center px-6 border-b">
        <span class="text-lg font-bold text-brand-600">OrderKing</span>
        <span class="ml-2 text-xs bg-brand-100 text-brand-700 px-2 py-0.5 rounded font-medium">Admin</span>
      </div>
      <nav class="flex-1 p-4 space-y-1">
        <RouterLink
          to="/admin"
          class="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-700 hover:bg-brand-50 hover:text-brand-600 transition-colors"
          active-class="bg-brand-50 text-brand-600 font-medium"
        >
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          Orders
        </RouterLink>
      </nav>
      <div class="p-4 border-t">
        <button
          @click="handleLogout"
          class="w-full text-left px-3 py-2 text-sm text-gray-600 hover:text-brand-600 transition-colors rounded-lg hover:bg-gray-50"
        >
          Logout
        </button>
      </div>
    </aside>

    <main class="flex-1 overflow-auto">
      <RouterView />
    </main>
  </div>
</template>
