import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api/v1'

export const apiClient = axios.create({
  baseURL: API_URL,
  withCredentials: true, // httpOnly cookies отправляются автоматически
  headers: { 'Content-Type': 'application/json' },
})

// --- Refresh-очередь ---
// Если несколько запросов получили 401 одновременно — ставим их в очередь
// и дожидаемся результата refresh, не дублируя запросы.

let isRefreshing = false
let failedQueue: Array<{
  resolve: () => void
  reject: (err: unknown) => void
}> = []

function processQueue(error: AxiosError | null) {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error)
    else resolve()
  })
  failedQueue = []
}

// --- Response interceptor ---

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as InternalAxiosRequestConfig & { _retry?: boolean }

    // Пропускаем не-401 и повторные запросы (чтобы не зациклиться)
    if (error.response?.status !== 401 || original._retry) {
      return Promise.reject(error)
    }

    // Если уже идёт refresh — ставим запрос в очередь
    if (isRefreshing) {
      return new Promise<void>((resolve, reject) => {
        failedQueue.push({ resolve, reject })
      }).then(() => apiClient(original))
    }

    original._retry = true
    isRefreshing = true

    try {
      await apiClient.post('/auth/refresh')
      processQueue(null)
      return apiClient(original)
    } catch (refreshError) {
      processQueue(refreshError as AxiosError)
      // Токен протух — отправляем на логин
      if (typeof window !== 'undefined') {
        window.location.href = '/admin/login'
      }
      return Promise.reject(refreshError)
    } finally {
      isRefreshing = false
    }
  },
)
