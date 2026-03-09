import { apiClient } from './client'

export interface Package {
  id: string
  name: string
  shortDescription: string
  fullDescription: string
  price: string | null
  sortOrder: number
}

export interface CreatePackagePayload {
  name: string
  shortDescription: string
  fullDescription: string
  price?: string | null
}

export interface UpdatePackagePayload {
  name: string
  shortDescription: string
  fullDescription: string
  price?: string | null
}

export const packagesApi = {
  getList: () =>
    apiClient.get<{ data: Package[] }>('/admin/packages').then((r) => r.data.data),

  create: (data: CreatePackagePayload) =>
    apiClient.post<{ data: Package }>('/admin/packages', data).then((r) => r.data.data),

  update: (id: string, data: UpdatePackagePayload) =>
    apiClient.put<{ data: Package }>(`/admin/packages/${id}`, data).then((r) => r.data.data),

  reorder: (id: string, direction: 'up' | 'down') =>
    apiClient
      .patch<{ data: Package[] }>(`/admin/packages/${id}/order`, { direction })
      .then((r) => r.data.data),

  remove: (id: string) =>
    apiClient.delete(`/admin/packages/${id}`),
}
