'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ExternalLink, Download, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react'
import { applicationsApi, ApplicationsFilter, ApplicationStatus } from '@/lib/api/applications'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { useToast } from '@/components/ui/toast'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { DatePicker } from '@/components/ui/date-picker'

const STATUS_LABELS: Record<ApplicationStatus, string> = {
  new: 'Новая',
  in_progress: 'В работе',
  closed: 'Закрыта',
}

const STATUS_VARIANTS: Record<ApplicationStatus, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  new: 'default',
  in_progress: 'secondary',
  closed: 'outline',
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

export default function ApplicationsPage() {
  const qc = useQueryClient()
  const { toast } = useToast()

  const [filter, setFilter] = useState<ApplicationsFilter>({ page: 1, limit: 20 })
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const { data, isLoading } = useQuery({
    queryKey: ['applications', filter],
    queryFn: () => applicationsApi.getList(filter),
  })

  const takeMutation = useMutation({
    mutationFn: (id: string) => applicationsApi.take(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['applications'] })
      toast('Анкета взята в работу', 'success')
    },
    onError: () => toast('Не удалось взять анкету', 'error'),
  })

  const closeMutation = useMutation({
    mutationFn: (id: string) => applicationsApi.close(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['applications'] })
      toast('Анкета отмечена отработанной', 'success')
    },
    onError: () => toast('Не удалось закрыть анкету', 'error'),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => applicationsApi.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['applications'] })
      setDeleteId(null)
      toast('Анкета удалена', 'success')
    },
    onError: () => toast('Не удалось удалить анкету', 'error'),
  })

  const setPage = (page: number) => setFilter((f) => ({ ...f, page }))

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold">Анкеты</h1>
        <a href={applicationsApi.exportCsv(filter)} download>
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4" />
            Экспорт CSV
          </Button>
        </a>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-4 flex-wrap items-center">
        <Select
          value={filter.status ?? 'all'}
          onValueChange={(v) =>
            setFilter((f) => ({ ...f, status: v === 'all' ? undefined : (v as ApplicationStatus), page: 1 }))
          }
        >
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Все статусы" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Все статусы</SelectItem>
            <SelectItem value="new">Новые</SelectItem>
            <SelectItem value="in_progress">В работе</SelectItem>
            <SelectItem value="closed">Закрытые</SelectItem>
          </SelectContent>
        </Select>

        <DatePicker
          value={filter.dateFrom}
          onChange={(v) => setFilter((f) => ({ ...f, dateFrom: v, page: 1 }))}
          placeholder="Дата от"
          className="w-44"
        />
        <span className="text-muted-foreground text-sm">—</span>
        <DatePicker
          value={filter.dateTo}
          onChange={(v) => setFilter((f) => ({ ...f, dateTo: v, page: 1 }))}
          placeholder="Дата до"
          className="w-44"
        />
      </div>

      {/* Table */}
      <div className="border border-border rounded-lg overflow-hidden bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Дата</TableHead>
              <TableHead>Пара / Instagram</TableHead>
              <TableHead>Контакт</TableHead>
              <TableHead>Дата свадьбы</TableHead>
              <TableHead>Статус</TableHead>
              <TableHead>Ответственный</TableHead>
              <TableHead className="text-right">Действия</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
                  <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                </TableCell>
              </TableRow>
            ) : !data?.data.length ? (
              <TableRow>
                <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
                  Анкет не найдено
                </TableCell>
              </TableRow>
            ) : (
              data.data.map((app) => (
                <TableRow key={app.id}>
                  <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                    {formatDate(app.createdAt)}
                  </TableCell>
                  <TableCell>
                    <div className="text-sm font-medium">{app.coupleName ?? '—'}</div>
                    <div className="text-xs text-muted-foreground">{app.instagram}</div>
                  </TableCell>
                  <TableCell className="text-sm">{app.contact}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {app.weddingDate ? formatDate(app.weddingDate) : '—'}
                  </TableCell>
                  <TableCell>
                    <Badge variant={STATUS_VARIANTS[app.status]}>
                      {STATUS_LABELS[app.status]}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {app.assignedTo?.login ?? '—'}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {app.status === 'new' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => takeMutation.mutate(app.id)}
                          disabled={takeMutation.isPending}
                        >
                          Взять
                        </Button>
                      )}
                      {app.status === 'in_progress' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => closeMutation.mutate(app.id)}
                          disabled={closeMutation.isPending}
                        >
                          Закрыть
                        </Button>
                      )}
                      <Link href={`/applications/${app.id}`}>
                        <Button size="sm" variant="ghost">
                          <ExternalLink className="w-4 h-4" />
                        </Button>
                      </Link>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-destructive hover:text-destructive"
                        onClick={() => setDeleteId(app.id)}
                      >
                        ✕
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {data && data.totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <p className="text-sm text-muted-foreground">
            Всего: {data.total}
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(data.page - 1)}
              disabled={data.page <= 1}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="text-sm">
              {data.page} / {data.totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(data.page + 1)}
              disabled={data.page >= data.totalPages}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Delete confirm dialog */}
      <Dialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Удалить анкету?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Это действие нельзя отменить.
          </p>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setDeleteId(null)}>
              Отмена
            </Button>
            <Button
              variant="destructive"
              onClick={() => deleteId && deleteMutation.mutate(deleteId)}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? 'Удаление…' : 'Удалить'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
