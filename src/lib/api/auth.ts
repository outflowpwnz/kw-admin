import { apiClient } from './client'

export interface LoginPayload {
  login: string
  password: string
}

export interface MeResponse {
  id: string
  login: string
  role: string
}

export const authApi = {
  login: (data: LoginPayload) =>
    apiClient.post<void>('/auth/login', data),

  logout: () =>
    apiClient.post<void>('/auth/logout'),

  refresh: () =>
    apiClient.post<void>('/auth/refresh'),

  me: () =>
    apiClient.get<{ data: MeResponse }>('/auth/me').then((r) => r.data.data),
}
