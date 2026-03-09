import { apiClient } from './client'

export interface Review {
  id: string
  text: string
  sortOrder: number
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface CreateReviewPayload {
  text: string
  isActive?: boolean
}

export interface UpdateReviewPayload {
  text?: string
  isActive?: boolean
}

export const reviewsApi = {
  getList: () =>
    apiClient.get<{ data: Review[] }>('/admin/reviews').then((r) => r.data.data),

  create: (data: CreateReviewPayload) =>
    apiClient.post<{ data: Review }>('/admin/reviews', data).then((r) => r.data.data),

  update: (id: string, data: UpdateReviewPayload) =>
    apiClient.patch<{ data: Review }>(`/admin/reviews/${id}`, data).then((r) => r.data.data),

  reorder: (id: string, direction: 'up' | 'down') =>
    apiClient
      .patch<{ data: Review[] }>(`/admin/reviews/${id}/order`, { direction })
      .then((r) => r.data.data),

  remove: (id: string) =>
    apiClient.delete(`/admin/reviews/${id}`),
}
