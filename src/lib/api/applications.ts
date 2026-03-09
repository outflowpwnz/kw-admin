import { apiClient } from './client'

export type ApplicationStatus = 'new' | 'in_progress' | 'closed'

export interface Application {
  id: string
  status: ApplicationStatus
  source: string | null
  coupleName: string | null
  instagram: string
  contact: string
  weddingDate: string | null
  guestsCount: number | null
  budget: string | null
  venuePreferences: string | null
  hasCeremony: boolean | null
  hasWalk: boolean | null
  hasBuffet: boolean | null
  stylistService: string | null
  photographerService: string | null
  videographerService: string | null
  hostService: string | null
  eveningEntertainment: string | null
  decor: string | null
  vision: string | null
  noGo: string | null
  otherWeddingsFeedback: string | null
  howFound: string | null
  preferredMeetingTime: string | null
  createdAt: string
  updatedAt: string
  completedAt: string | null
  assignedTo: { id: string; login: string } | null
}

export interface PaginatedResult<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface ApplicationsFilter {
  status?: ApplicationStatus | ''
  page?: number
  limit?: number
  dateFrom?: string
  dateTo?: string
}

export const applicationsApi = {
  getList: (params: ApplicationsFilter = {}) =>
    apiClient
      .get<PaginatedResult<Application>>('/admin/applications', { params })
      .then((r) => r.data),

  getOne: (id: string) =>
    apiClient.get<{ data: Application }>(`/admin/applications/${id}`).then((r) => r.data.data),

  take: (id: string) =>
    apiClient.post<{ data: Application }>(`/admin/applications/${id}/take`).then((r) => r.data.data),

  close: (id: string) =>
    apiClient.post<{ data: Application }>(`/admin/applications/${id}/close`).then((r) => r.data.data),

  remove: (id: string) =>
    apiClient.delete(`/admin/applications/${id}`),

  exportCsv: (params: Omit<ApplicationsFilter, 'page' | 'limit'> = {}) => {
    const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api/v1'
    const query = new URLSearchParams()
    if (params.status) query.set('status', params.status)
    if (params.dateFrom) query.set('dateFrom', params.dateFrom)
    if (params.dateTo) query.set('dateTo', params.dateTo)
    const qs = query.toString()
    return `${API_URL}/admin/applications/export${qs ? `?${qs}` : ''}`
  },
}
