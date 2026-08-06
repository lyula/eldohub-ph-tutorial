import axios from 'axios'
import { useAuth } from '@/composables/useAuth'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use((config) => {
  const { token } = useAuth()
  if (token.value) config.headers.Authorization = `Bearer ${token.value}`
  return config
})

export const authApi = {
  register: (name, email, password) => api.post('/auth/register', { name, email, password }),
  login: (email, password) => api.post('/auth/login', { email, password }),
}

export const paymentApi = {
  stkPush: (data) => api.post('/payments/stk-push', data),
  getTransactions: (page = 1, limit = 10) =>
    api.get('/payments/transactions', { params: { page, limit } }),
  getTransaction: (id) => api.get(`/payments/transactions/${id}`),
}

export default api
