<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getDashboardMenu, updateMenuItem, createMenuItem } from '@/api/restaurant-dashboard'
import type { DashboardMenuItem } from '@/api/restaurant-dashboard'
import { supabase } from '@/lib/supabase'

const CATEGORIES = ['Burgers', 'Pizza', 'Sushi', 'Chicken', 'Seafood', 'Egyptian', 'Healthy', 'Desserts', 'Beverages', 'Other']

const items = ref<DashboardMenuItem[]>([])
const loading = ref(true)
const editingId = ref<string | null>(null)
const saveLoading = ref(false)
const editDraft = ref<Partial<DashboardMenuItem & { newImageFile?: File }>>({})

const showAddForm = ref(false)
const addLoading = ref(false)
const addDraft = ref({
  name: '',
  price: '',
  category: '',
  description: '',
  isAvailable: true,
  imageUrl: null as string | null,
})
const addImageFile = ref<File | null>(null)
const addImagePreview = ref<string | null>(null)
const editImageFile = ref<File | null>(null)
const editImagePreview = ref<string | null>(null)
const uploadingImage = ref(false)

onMounted(async () => {
  items.value = await getDashboardMenu()
  loading.value = false
})

async function uploadImage(file: File, folder = 'menu'): Promise<string> {
  const ext = file.name.split('.').pop()
  const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
  const { error } = await supabase.storage.from('oderking').upload(path, file, { upsert: true })
  if (error) throw new Error(error.message)
  const { data } = supabase.storage.from('oderking').getPublicUrl(path)
  return data.publicUrl
}

function onAddImage(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return
  addImageFile.value = file
  addImagePreview.value = URL.createObjectURL(file)
}

function onEditImage(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return
  editImageFile.value = file
  editImagePreview.value = URL.createObjectURL(file)
}

function resetAddForm() {
  addDraft.value = { name: '', price: '', category: '', description: '', isAvailable: true, imageUrl: null }
  addImageFile.value = null
  addImagePreview.value = null
  showAddForm.value = false
}

async function addItem() {
  if (!addDraft.value.name || !addDraft.value.price || !addDraft.value.category) return
  addLoading.value = true
  try {
    let imageUrl: string | null = null
    if (addImageFile.value) {
      uploadingImage.value = true
      imageUrl = await uploadImage(addImageFile.value)
      uploadingImage.value = false
    }
    const created = await createMenuItem({
      name: addDraft.value.name,
      price: addDraft.value.price,
      category: addDraft.value.category,
      description: addDraft.value.description || null,
      imageUrl,
      isAvailable: addDraft.value.isAvailable,
    })
    items.value.push(created)
    resetAddForm()
  } catch (e) {
    uploadingImage.value = false
    console.error(e)
  } finally {
    addLoading.value = false
  }
}

function startEdit(item: DashboardMenuItem) {
  editingId.value = item.id
  editImageFile.value = null
  editImagePreview.value = null
  editDraft.value = {
    name: item.name,
    price: item.price,
    category: item.category,
    description: item.description,
    imageUrl: item.imageUrl,
    isAvailable: item.isAvailable,
  }
}

function cancelEdit() {
  editingId.value = null
  editDraft.value = {}
  editImageFile.value = null
  editImagePreview.value = null
}

async function saveEdit(item: DashboardMenuItem) {
  saveLoading.value = true
  try {
    let imageUrl = editDraft.value.imageUrl
    if (editImageFile.value) {
      uploadingImage.value = true
      imageUrl = await uploadImage(editImageFile.value)
      uploadingImage.value = false
    }
    const updated = await updateMenuItem(item.id, {
      name: editDraft.value.name,
      price: editDraft.value.price,
      category: editDraft.value.category,
      description: editDraft.value.description,
      imageUrl,
      isAvailable: editDraft.value.isAvailable,
    })
    const idx = items.value.findIndex((i) => i.id === item.id)
    if (idx !== -1) items.value[idx] = updated
    cancelEdit()
  } finally {
    uploadingImage.value = false
    saveLoading.value = false
  }
}

async function toggleAvailability(item: DashboardMenuItem) {
  const updated = await updateMenuItem(item.id, { isAvailable: !item.isAvailable })
  const idx = items.value.findIndex((i) => i.id === item.id)
  if (idx !== -1) items.value[idx] = updated
}
</script>

<template>
  <div class="p-6 max-w-4xl mx-auto">
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold text-gray-900">Menu</h1>
      <button
        @click="showAddForm = !showAddForm"
        class="flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-colors"
      >
        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        Add Item
      </button>
    </div>

    <!-- Add Item Form -->
    <div v-if="showAddForm" class="bg-white rounded-2xl shadow-sm p-6 mb-6 border-2 border-brand-100">
      <h2 class="font-semibold text-gray-900 mb-4">New Menu Item</h2>
      <div class="space-y-4">
        <!-- Image upload -->
        <div>
          <label class="block text-xs font-medium text-gray-600 mb-2">Photo</label>
          <div class="flex items-center gap-4">
            <div
              v-if="addImagePreview"
              class="w-20 h-20 rounded-xl overflow-hidden shrink-0"
            >
              <img :src="addImagePreview" class="w-full h-full object-cover" />
            </div>
            <div
              v-else
              class="w-20 h-20 rounded-xl bg-gray-100 flex items-center justify-center shrink-0"
            >
              <svg class="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <label class="cursor-pointer flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors">
              <svg class="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              {{ addImageFile ? 'Change photo' : 'Upload photo' }}
              <input type="file" accept="image/*" class="hidden" @change="onAddImage" />
            </label>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-xs font-medium text-gray-600 mb-1">Name *</label>
            <input v-model="addDraft.name" placeholder="e.g. Classic Burger" class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400" />
          </div>
          <div>
            <label class="block text-xs font-medium text-gray-600 mb-1">Price (EGP) *</label>
            <input v-model="addDraft.price" type="number" min="0" step="0.5" placeholder="0.00" class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400" />
          </div>
        </div>

        <div>
          <label class="block text-xs font-medium text-gray-600 mb-1">Category *</label>
          <select v-model="addDraft.category" class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 bg-white">
            <option value="" disabled>Select category</option>
            <option v-for="cat in CATEGORIES" :key="cat" :value="cat">{{ cat }}</option>
          </select>
        </div>

        <div>
          <label class="block text-xs font-medium text-gray-600 mb-1">Description</label>
          <input v-model="addDraft.description" placeholder="Optional description" class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400" />
        </div>

        <div class="flex items-center gap-2">
          <input v-model="addDraft.isAvailable" type="checkbox" id="add-available" class="rounded" />
          <label for="add-available" class="text-sm text-gray-700">Available immediately</label>
        </div>

        <div class="flex gap-3 pt-1">
          <button
            @click="addItem"
            :disabled="!addDraft.name || !addDraft.price || !addDraft.category || addLoading"
            class="flex-1 py-2.5 bg-brand-500 hover:bg-brand-600 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-xl transition-colors"
          >
            <span v-if="uploadingImage">Uploading photo…</span>
            <span v-else-if="addLoading">Adding…</span>
            <span v-else>Add Item</span>
          </button>
          <button @click="resetAddForm" class="px-5 py-2.5 border border-gray-300 text-gray-700 text-sm font-semibold rounded-xl hover:bg-gray-50 transition-colors">
            Cancel
          </button>
        </div>
      </div>
    </div>

    <!-- List skeleton -->
    <div v-if="loading" class="space-y-3">
      <div v-for="n in 5" :key="n" class="bg-white rounded-2xl p-5 animate-pulse h-20" />
    </div>

    <div v-else-if="items.length === 0 && !showAddForm" class="text-center py-16 text-gray-400 text-sm">
      No menu items yet — add your first item above
    </div>

    <div v-else class="space-y-3">
      <div v-for="item in items" :key="item.id" class="bg-white rounded-2xl p-5 shadow-sm">
        <!-- Edit mode -->
        <div v-if="editingId === item.id" class="space-y-4">
          <!-- Image upload in edit -->
          <div>
            <label class="block text-xs font-medium text-gray-600 mb-2">Photo</label>
            <div class="flex items-center gap-4">
              <div class="w-20 h-20 rounded-xl overflow-hidden shrink-0 bg-gray-100 flex items-center justify-center">
                <img
                  v-if="editImagePreview || editDraft.imageUrl"
                  :src="editImagePreview || editDraft.imageUrl || ''"
                  class="w-full h-full object-cover"
                />
                <svg v-else class="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <label class="cursor-pointer flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                <svg class="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                {{ editImageFile ? 'Change photo' : 'Replace photo' }}
                <input type="file" accept="image/*" class="hidden" @change="onEditImage" />
              </label>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-xs font-medium text-gray-600 mb-1">Name</label>
              <input v-model="editDraft.name" class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400" />
            </div>
            <div>
              <label class="block text-xs font-medium text-gray-600 mb-1">Price (EGP)</label>
              <input v-model="editDraft.price" type="text" class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400" />
            </div>
          </div>
          <div>
            <label class="block text-xs font-medium text-gray-600 mb-1">Category</label>
            <select v-model="editDraft.category" class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 bg-white">
              <option v-for="cat in CATEGORIES" :key="cat" :value="cat">{{ cat }}</option>
            </select>
          </div>
          <div>
            <label class="block text-xs font-medium text-gray-600 mb-1">Description</label>
            <input v-model="editDraft.description" class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400" />
          </div>
          <div class="flex items-center gap-2">
            <input v-model="editDraft.isAvailable" type="checkbox" :id="`avail-${item.id}`" class="rounded" />
            <label :for="`avail-${item.id}`" class="text-sm text-gray-700">Available</label>
          </div>
          <div class="flex gap-2 pt-1">
            <button @click="saveEdit(item)" :disabled="saveLoading" class="px-4 py-2 bg-brand-500 hover:bg-brand-600 disabled:opacity-40 text-white text-sm font-semibold rounded-lg transition-colors">
              <span v-if="uploadingImage">Uploading…</span>
              <span v-else-if="saveLoading">Saving…</span>
              <span v-else>Save</span>
            </button>
            <button @click="cancelEdit" class="px-4 py-2 border border-gray-300 text-gray-700 text-sm font-semibold rounded-lg hover:bg-gray-50 transition-colors">Cancel</button>
          </div>
        </div>

        <!-- View mode -->
        <div v-else class="flex items-center gap-4">
          <div class="w-14 h-14 rounded-xl overflow-hidden shrink-0 bg-gray-100 flex items-center justify-center">
            <img v-if="item.imageUrl" :src="item.imageUrl" :alt="item.name" class="w-full h-full object-cover" />
            <svg v-else class="w-5 h-5 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2">
              <p class="font-semibold text-gray-900 text-sm truncate">{{ item.name }}</p>
              <span :class="['text-xs font-medium px-2 py-0.5 rounded-full', item.isAvailable ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500']">
                {{ item.isAvailable ? 'Available' : 'Unavailable' }}
              </span>
            </div>
            <p v-if="item.description" class="text-xs text-gray-500 mt-0.5 truncate">{{ item.description }}</p>
            <div class="flex items-center gap-2 mt-1">
              <p class="text-sm font-bold text-brand-600">EGP {{ Number(item.price).toFixed(2) }}</p>
              <span class="text-xs text-gray-400">· {{ item.category }}</span>
            </div>
          </div>
          <div class="flex items-center gap-2 shrink-0">
            <button
              @click="toggleAvailability(item)"
              :class="[
                'relative inline-flex h-5 w-9 items-center rounded-full transition-colors',
                item.isAvailable ? 'bg-brand-500' : 'bg-gray-300',
              ]"
              :title="item.isAvailable ? 'Mark unavailable' : 'Mark available'"
            >
              <span :class="['inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform', item.isAvailable ? 'translate-x-4' : 'translate-x-0.5']" />
            </button>
            <button @click="startEdit(item)" class="p-1.5 text-gray-400 hover:text-brand-600 transition-colors">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
