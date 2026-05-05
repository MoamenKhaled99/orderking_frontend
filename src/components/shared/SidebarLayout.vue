<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { RouterLink, useRouter } from 'vue-router'

const props = defineProps<{
  title: string
  logoTo: string
}>()

const router = useRouter()
const drawerOpen = ref(false)

function openDrawer() { drawerOpen.value = true }
function closeDrawer() { drawerOpen.value = false }

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape') closeDrawer()
}

onMounted(() => window.addEventListener('keydown', onKeydown))
onUnmounted(() => window.removeEventListener('keydown', onKeydown))

router.afterEach(() => closeDrawer())
</script>

<template>
  <div class="min-h-screen bg-gray-50 flex">
    <!-- Desktop sidebar -->
    <aside class="hidden md:flex w-56 bg-white border-r border-gray-100 flex-col shrink-0 sticky top-0 h-screen">
      <div class="p-4 border-b border-gray-100">
        <RouterLink :to="logoTo" class="text-xl font-bold text-brand-600">{{ title }}</RouterLink>
        <slot name="sidebar-header" />
      </div>
      <slot name="sidebar" />
    </aside>

    <!-- Mobile drawer backdrop -->
    <Transition name="fade">
      <div
        v-if="drawerOpen"
        class="fixed inset-0 bg-black/40 z-40 md:hidden"
        @click="closeDrawer"
      />
    </Transition>

    <!-- Mobile drawer -->
    <Transition name="slide">
      <aside
        v-if="drawerOpen"
        class="fixed top-0 left-0 h-full w-64 bg-white z-50 flex flex-col shadow-xl md:hidden"
      >
        <div class="p-4 border-b border-gray-100 flex items-center justify-between">
          <RouterLink :to="logoTo" class="text-xl font-bold text-brand-600">{{ title }}</RouterLink>
          <button @click="closeDrawer" class="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <slot name="sidebar-header" />
        <slot name="sidebar" />
      </aside>
    </Transition>

    <!-- Main area -->
    <div class="flex-1 flex flex-col min-w-0">
      <!-- Mobile top bar -->
      <header class="md:hidden bg-white border-b border-gray-100 sticky top-0 z-30">
        <div class="h-14 px-4 flex items-center justify-between">
          <button
            @click="openDrawer"
            class="p-2 -ml-2 text-gray-600 hover:text-brand-600 transition-colors rounded-lg hover:bg-gray-100"
            aria-label="Open menu"
          >
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <RouterLink :to="logoTo" class="text-lg font-bold text-brand-600">{{ title }}</RouterLink>
          <slot name="topbar-right">
            <div class="w-9" />
          </slot>
        </div>
      </header>

      <!-- Desktop top bar (optional slot) -->
      <header v-if="$slots['desktop-topbar']" class="hidden md:block bg-white border-b border-gray-100 sticky top-0 z-30">
        <slot name="desktop-topbar" />
      </header>

      <main class="flex-1 min-w-0">
        <slot />
      </main>
    </div>
  </div>
</template>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

.slide-enter-active, .slide-leave-active { transition: transform 0.25s ease; }
.slide-enter-from, .slide-leave-to { transform: translateX(-100%); }
</style>
