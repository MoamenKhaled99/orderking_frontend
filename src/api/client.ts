import axios from 'axios'
import { useAuthStore } from '@/stores/auth.store'

const client = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL as string,
})

client.interceptors.request.use((config) => {
  const auth = useAuthStore()
  if (auth.token) {
    config.headers.Authorization = `Bearer ${auth.token}`
  }
  return config
})

client.interceptors.response.use(
  (response) => response.data.data,
  (error) => {
    const message = error.response?.data?.message ?? error.message ?? 'Something went wrong'
    return Promise.reject(new Error(message))
  },
)

export default client
