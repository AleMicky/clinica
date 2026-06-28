import axios from 'axios'

import { authStore } from '../../stores/auth.store'
import { authService } from '../../features/auth/services/auth.service'
import { notify } from '../utils/notify'

export const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    timeout: 30000,
    headers: {
        'Content-Type': 'application/json',
    },
})

api.interceptors.request.use(
    (config) => {
        const token = authStore.getState().accessToken

        if (token) {
            config.headers.Authorization = `Bearer ${token}`
        }

        return config
    },
    (error) => Promise.reject(error),
)

api.interceptors.response.use(
    (response) => response,
  
    async (error) => {
      const originalRequest = error.config
  
      const url = originalRequest?.url ?? ''
  
      const isAuthRequest =
        url.includes('/auth/login') ||
        url.includes('/auth/refresh')
  
      if (
        isAuthRequest ||
        error.response?.status !== 401 ||
        originalRequest._retry
      ) {
        return Promise.reject(error)
      }
  
      originalRequest._retry = true
  
      try {
        const { refreshToken } = authStore.getState()
  
        if (!refreshToken) {
          throw new Error('No hay sesión activa')
        }
  
        const auth = await authService.refresh({
          refreshToken,
        })
  
        authStore.getState().setAuth(auth)
  
        originalRequest.headers.Authorization =
          `Bearer ${auth.accessToken}`
  
        return api(originalRequest)
      } catch {
        notify.warning(
          'Sesión expirada',
          'Por favor inicia sesión nuevamente.',
          'session-expired',
        )
  
        authStore.getState().logout()
  
        window.location.href = '/login'
  
        return Promise.reject(error)
      }
    },
  )