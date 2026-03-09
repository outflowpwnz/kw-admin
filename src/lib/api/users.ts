import { apiClient } from './client'

export interface AdminUser {
  id: string
  login: string
  name: string
  role: string
  createdAt: string
  updatedAt: string
}

export const usersApi = {
  getList: () =>
    apiClient.get<{ data: AdminUser[] }>('/admin/users').then((r) => r.data.data),

  create: (data: { login: string; name: string; password: string }) =>
    apiClient.post<{ data: AdminUser }>('/admin/users', data).then((r) => r.data.data),

  update: (id: string, data: { name?: string; password?: string }) =>
    apiClient.patch<{ data: AdminUser }>(`/admin/users/${id}`, data).then((r) => r.data.data),

  remove: (id: string) => apiClient.delete(`/admin/users/${id}`),
}
