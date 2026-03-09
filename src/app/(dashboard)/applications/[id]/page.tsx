'use client'

import { use } from 'react'
import Link from 'next/link'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { applicationsApi, Application } from '@/lib/api/applications'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/components/ui/toast'

const STATUS_LABELS = { new: 'Новая', in_progress: 'В работе', closed: 'Закрыта' }
const STATUS_VARIANTS = {
  new: 'default',
  in_progress: 'secondary',
  closed: 'outline',
} as const

function Field({ label, value }: { label: string; value: string | number | boolean | null | undefined }) {
  if (value === null || value === undefined || value === '') return null
  const display =
    typeof value === 'boolean' ? (value ? 'Да' : 'Нет') : String(value)
  return (
    <div>
      <dt className="text-xs text-muted-foreground mb-0.5">{label}</dt>
      <dd className="text-sm">{display}</dd>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border border-border rounded-lg p-5 bg-card">
      <h2 className="text-sm font-semibold mb-4 text-muted-foreground uppercase tracking-wide">
        {title}
      </h2>
      <dl className="grid grid-cols-2 gap-x-6 gap-y-3">{children}</dl>
    </div>
  )
}

export default function ApplicationDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const qc = useQueryClient()
  const { toast } = useToast()

  const { data: app, isLoading } = useQuery({
    queryKey: ['application', id],
    queryFn: () => applicationsApi.getOne(id),
  })

  const takeMutation = useMutation({
    mutationFn: () => applicationsApi.take(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['application', id] })
      qc.invalidateQueries({ queryKey: ['applications'] })
      toast('Анкета взята в работу', 'success')
    },
  })

  const closeMutation = useMutation({
    mutationFn: () => applicationsApi.close(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['application', id] })
      qc.invalidateQueries({ queryKey: ['applications'] })
      toast('Анкета отмечена отработанной', 'success')
    },
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!app) {
    return (
      <div className="text-center py-16 text-muted-foreground">
        Анкета не найдена
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link href="/applications">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4" />
            Назад
          </Button>
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-semibold">
              {app.coupleName ?? app.instagram}
            </h1>
            <Badge variant={STATUS_VARIANTS[app.status]}>
              {STATUS_LABELS[app.status]}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-0.5">
            Подана: {new Date(app.createdAt).toLocaleString('ru-RU')}
            {app.assignedTo && ` · Ответственный: ${app.assignedTo.login}`}
            {app.completedAt && ` · Закрыта: ${new Date(app.completedAt).toLocaleString('ru-RU')}`}
          </p>
        </div>
        <div className="flex gap-2">
          {app.status === 'new' && (
            <Button onClick={() => takeMutation.mutate()} disabled={takeMutation.isPending}>
              Взять в работу
            </Button>
          )}
          {app.status === 'in_progress' && (
            <Button onClick={() => closeMutation.mutate()} disabled={closeMutation.isPending}>
              Отметить отработанной
            </Button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="space-y-4">
        <Section title="Контакты">
          <Field label="Пара" value={app.coupleName} />
          <Field label="Instagram" value={app.instagram} />
          <Field label="Контакт (тел / TG)" value={app.contact} />
          <Field label="Источник" value={app.source} />
          <Field label="Как нашли" value={app.howFound} />
          <Field label="Удобное время для встречи" value={app.preferredMeetingTime} />
        </Section>

        <Section title="Свадьба">
          <Field label="Дата свадьбы" value={app.weddingDate} />
          <Field label="Гостей" value={app.guestsCount} />
          <Field label="Бюджет" value={app.budget} />
          <Field label="Предпочтения по площадке" value={app.venuePreferences} />
          <Field label="Церемония" value={app.hasCeremony} />
          <Field label="Прогулка" value={app.hasWalk} />
          <Field label="Фуршет" value={app.hasBuffet} />
        </Section>

        <Section title="Подрядчики">
          <Field label="Стилист" value={app.stylistService} />
          <Field label="Фотограф" value={app.photographerService} />
          <Field label="Видеограф" value={app.videographerService} />
          <Field label="Ведущий" value={app.hostService} />
          <Field label="Вечерняя программа" value={app.eveningEntertainment} />
          <Field label="Декор" value={app.decor} />
        </Section>

        <Section title="Видение и пожелания">
          <div className="col-span-2">
            <Field label="Видение свадьбы" value={app.vision} />
          </div>
          <div className="col-span-2">
            <Field label="Что точно не нравится" value={app.noGo} />
          </div>
          <div className="col-span-2">
            <Field label="Впечатления от других свадеб" value={app.otherWeddingsFeedback} />
          </div>
        </Section>
      </div>
    </div>
  )
}
