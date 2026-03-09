import { apiClient } from './client'

export interface TeamMember {
  id: string
  name: string
  description: string
  photoUrl: string
  sortOrder: number
}

export const teamApi = {
  getList: () =>
    apiClient.get<{ data: TeamMember[] }>('/admin/team').then((r) => r.data.data),

  create: (data: { name: string; description: string; photoUrl: string }) =>
    apiClient.post<{ data: TeamMember }>('/admin/team', data).then((r) => r.data.data),

  update: (id: string, data: { name?: string; description?: string; photoUrl?: string }) =>
    apiClient.patch<{ data: TeamMember }>(`/admin/team/${id}`, data).then((r) => r.data.data),

  reorder: (id: string, direction: 'up' | 'down') =>
    apiClient
      .patch<{ data: TeamMember[] }>(`/admin/team/${id}/order`, { direction })
      .then((r) => r.data.data),

  remove: (id: string) =>
    apiClient.delete<void>(`/admin/team/${id}`),

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
