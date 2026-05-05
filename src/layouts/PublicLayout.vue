<script setup lang="ts">
import { RouterLink } from 'vue-router'
</script>

<template>
  <div class="min-h-screen bg-gray-50 flex flex-col">
    <header class="bg-white shadow-sm sticky top-0 z-40">
      <div class="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <RouterLink to="/" class="text-xl font-bold text-brand-600">OrderKing</RouterLink>

        <RouterLink
          to="/restaurant/register"
          class="text-sm font-medium border border-brand-500 text-brand-600 hover:bg-brand-50 px-4 py-1.5 rounded-lg transition-colors"
        >
          Become a Partner
        </RouterLink>
      </div>
    </header>

    <main class="flex-1 flex flex-col">
      <RouterView />
    </main>
  </div>
</template>
