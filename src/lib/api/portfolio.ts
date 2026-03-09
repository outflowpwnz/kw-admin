import { apiClient } from './client'

export interface PortfolioCase {
  id: string
  title: string
  photoUrl: string
  description: string
  sortOrder: number
}

export const portfolioApi = {
  getList: () =>
    apiClient.get<{ data: PortfolioCase[] }>('/admin/portfolio').then((r) => r.data.data),

  create: (data: { title: string; photoUrl: string; description: string }) =>
    apiClient.post<{ data: PortfolioCase }>('/admin/portfolio', data).then((r) => r.data.data),

  update: (id: string, data: { title?: string; photoUrl?: string; description?: string }) =>
    apiClient.patch<{ data: PortfolioCase }>(`/admin/portfolio/${id}`, data).then((r) => r.data.data),

  reorder: (id: string, direction: 'up' | 'down') =>
    apiClient
      .patch<{ data: PortfolioCase[] }>(`/admin/portfolio/${id}/order`, { direction })
      .then((r) => r.data.data),

  remove: (id: string) => apiClient.delete(`/admin/portfolio/${id}`),

  upload: (file: File) => {
    const form = new FormData()
    form.append('file', file)
    return apiClient
      .post<{ data: { url: string } }>('/admin/upload', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      .then((r) => r.data.data.url)
  },
}
