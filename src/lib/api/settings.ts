import { apiClient } from './client'

export type SettingsRecord = Record<string, string>

export const SETTING_KEYS = [
  'stat_weddings_count',
  'stat_years_experience',
  'stat_team_size',
  'stat_rating',
  'phone',
  'instagram_url',
  'vk_url',
  'telegram_url',
  'countdown_next_wedding_date',
  'countdown_total_weddings',
] as const

export type SettingKey = (typeof SETTING_KEYS)[number]

export const settingsApi = {
  getAll: () =>
    apiClient.get<{ data: SettingsRecord }>('/admin/settings').then((r) => r.data.data),

  update: (settings: SettingsRecord) =>
    apiClient.put<{ data: SettingsRecord }>('/admin/settings', { settings }).then((r) => r.data.data),
}
