'use client'

import { useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { Loader2 } from 'lucide-react'
import { settingsApi, SETTING_KEYS, SettingKey } from '@/lib/api/settings'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { PhoneInput } from '@/components/ui/phone-input'
import { DatePicker } from '@/components/ui/date-picker'
import { useToast } from '@/components/ui/toast'

type FormData = Record<SettingKey, string>

const SECTIONS: { title: string; keys: SettingKey[] }[] = [
  {
    title: 'Статистика',
    keys: ['stat_weddings_count', 'stat_years_experience', 'stat_team_size', 'stat_rating'],
  },
  {
    title: 'Контакты',
    keys: ['phone', 'instagram_url', 'vk_url', 'telegram_url'],
  },
  {
    title: 'Обратный отсчёт',
    keys: ['countdown_next_wedding_date', 'countdown_total_weddings'],
  },
]

const LABELS: Record<SettingKey, string> = {
  stat_weddings_count: 'Количество свадеб',
  stat_years_experience: 'Лет опыта',
  stat_team_size: 'Размер команды',
  stat_rating: 'Рейтинг',
  phone: 'Телефон',
  instagram_url: 'Instagram URL',
  vk_url: 'ВКонтакте URL',
  telegram_url: 'Telegram URL',
  countdown_next_wedding_date: 'Дата следующей свадьбы (ISO 8601)',
  countdown_total_weddings: 'Всего свадеб (для счётчика)',
}

const PLACEHOLDER: Record<SettingKey, string> = {
  stat_weddings_count: '150',
  stat_years_experience: '8',
  stat_team_size: '12',
  stat_rating: '5.0',
  phone: '+7 (999) 000-00-00',
  instagram_url: 'https://instagram.com/...',
  vk_url: 'https://vk.com/...',
  telegram_url: 'https://t.me/...',
  countdown_next_wedding_date: '2025-06-15',
  countdown_total_weddings: '200',
}

export default function SettingsPage() {
  const qc = useQueryClient()
  const { toast } = useToast()

  const { data, isLoading } = useQuery({
    queryKey: ['settings'],
    queryFn: () => settingsApi.getAll(),
  })

  const { register, handleSubmit, reset, watch, setValue } = useForm<FormData>()

  useEffect(() => {
    if (data) {
      const defaults = {} as FormData
      SETTING_KEYS.forEach((key) => {
        defaults[key] = data[key] ?? ''
      })
      reset(defaults)
    }
  }, [data, reset])

  const updateMutation = useMutation({
    mutationFn: (formData: FormData) => {
      const settings: Record<string, string> = {}
      SETTING_KEYS.forEach((key) => {
        if (formData[key]) settings[key] = formData[key]
      })
      return settingsApi.update(settings)
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['settings'] })
      toast('Настройки сохранены', 'success')
    },
    onError: () => toast('Ошибка при сохранении', 'error'),
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold">Настройки сайта</h1>
      </div>

      <form onSubmit={handleSubmit((data) => updateMutation.mutate(data))}>
        <div className="space-y-6 max-w-2xl">
          {SECTIONS.map((section) => (
            <div key={section.title} className="border border-border rounded-lg p-5 bg-card">
              <h2 className="text-sm font-semibold mb-4 text-muted-foreground uppercase tracking-wide">
                {section.title}
              </h2>
              <div className="grid grid-cols-2 gap-4">
                {section.keys.map((key) => (
                  <div key={key} className="space-y-1.5">
                    <Label htmlFor={key}>{LABELS[key]}</Label>
                    {key === 'phone' ? (
                      <PhoneInput
                        id={key}
                        value={watch(key) ?? ''}
                        onChange={(v) => setValue(key, v)}
                      />
                    ) : key === 'countdown_next_wedding_date' ? (
                      <DatePicker
                        value={watch(key) ?? ''}
                        onChange={(v) => setValue(key, v ?? '')}
                        placeholder={PLACEHOLDER[key]}
                      />
                    ) : (
                      <Input
                        id={key}
                        {...register(key)}
                        placeholder={PLACEHOLDER[key]}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}

          <div className="flex justify-end">
            <Button type="submit" disabled={updateMutation.isPending}>
              {updateMutation.isPending ? 'Сохранение…' : 'Сохранить настройки'}
            </Button>
          </div>
        </div>
      </form>
    </div>
  )
}
