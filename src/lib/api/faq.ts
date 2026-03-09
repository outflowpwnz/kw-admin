import { apiClient } from './client'

export interface FaqItem {
  id: string
  question: string
  answer: string
  sortOrder: number
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface CreateFaqPayload {
  question: string
  answer: string
  isActive?: boolean
}

export interface UpdateFaqPayload {
  question?: string
  answer?: string
  isActive?: boolean
}

export const faqApi = {
  getList: () =>
    apiClient.get<{ data: FaqItem[] }>('/admin/faq').then((r) => r.data.data),

  create: (data: CreateFaqPayload) =>
    apiClient.post<{ data: FaqItem }>('/admin/faq', data).then((r) => r.data.data),

  update: (id: string, data: UpdateFaqPayload) =>
    apiClient.patch<{ data: FaqItem }>(`/admin/faq/${id}`, data).then((r) => r.data.data),

  reorder: (id: string, direction: 'up' | 'down') =>
    apiClient
      .patch<{ data: FaqItem[] }>(`/admin/faq/${id}/order`, { direction })
      .then((r) => r.data.data),

  remove: (id: string) =>
    apiClient.delete(`/admin/faq/${id}`),
}
