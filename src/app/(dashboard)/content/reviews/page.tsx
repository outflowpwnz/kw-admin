'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Plus, Pencil, Trash2, ChevronUp, ChevronDown, Loader2 } from 'lucide-react'
import { reviewsApi, Review } from '@/lib/api/reviews'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useToast } from '@/components/ui/toast'

const schema = z.object({
  text: z.string().min(1, 'Введите текст отзыва'),
  isActive: z.boolean(),
})
type FormData = z.infer<typeof schema>

export default function ReviewsPage() {
  const qc = useQueryClient()
  const { toast } = useToast()

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Review | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Review | null>(null)

  const { data: items = [], isLoading } = useQuery({
    queryKey: ['reviews'],
    queryFn: () => reviewsApi.getList(),
  })

  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { text: '', isActive: true },
  })
  const isActive = watch('isActive')

  const openCreate = () => {
    setEditing(null)
    reset({ text: '', isActive: true })
    setDialogOpen(true)
  }

  const openEdit = (item: Review) => {
    setEditing(item)
    reset({ text: item.text, isActive: item.isActive })
    setDialogOpen(true)
  }

  const createMutation = useMutation({
    mutationFn: (data: FormData) => reviewsApi.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['reviews'] })
      setDialogOpen(false)
      toast('Отзыв добавлен', 'success')
    },
    onError: () => toast('Ошибка при создании', 'error'),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: FormData }) => reviewsApi.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['reviews'] })
      setDialogOpen(false)
      toast('Отзыв обновлён', 'success')
    },
    onError: () => toast('Ошибка при обновлении', 'error'),
  })

  const reorderMutation = useMutation({
    mutationFn: ({ id, direction }: { id: string; direction: 'up' | 'down' }) =>
      reviewsApi.reorder(id, direction),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['reviews'] }),
    onError: () => toast('Нельзя переместить', 'error'),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => reviewsApi.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['reviews'] })
      setDeleteTarget(null)
      toast('Отзыв удалён', 'success')
    },
    onError: () => toast('Ошибка при удалении', 'error'),
  })

  const toggleActive = (item: Review) => {
    updateMutation.mutate({ id: item.id, data: { text: item.text, isActive: !item.isActive } })
  }

  const onSubmit = (data: FormData) => {
    if (editing) {
      updateMutation.mutate({ id: editing.id, data })
    } else {
      createMutation.mutate(data)
    }
  }

  const isPending = createMutation.isPending || updateMutation.isPending

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold">Отзывы</h1>
        <Button size="sm" onClick={openCreate}>
          <Plus className="w-4 h-4" />
          Добавить
        </Button>
      </div>

      <div className="border border-border rounded-lg overflow-hidden bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10">#</TableHead>
              <TableHead>Текст</TableHead>
              <TableHead className="w-24 text-center">Активен</TableHead>
              <TableHead className="w-24 text-center">Порядок</TableHead>
              <TableHead className="w-24 text-right">Действия</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="h-32 text-center">
                  <Loader2 className="w-5 h-5 animate-spin mx-auto text-muted-foreground" />
                </TableCell>
              </TableRow>
            ) : !items.length ? (
              <TableRow>
                <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                  Нет отзывов
                </TableCell>
              </TableRow>
            ) : (
              items.map((item, i) => (
                <TableRow key={item.id}>
                  <TableCell className="text-muted-foreground text-sm">{i + 1}</TableCell>
                  <TableCell>
                    <p className="text-sm line-clamp-2">{item.text}</p>
                  </TableCell>
                  <TableCell className="text-center">
                    <Switch
                      checked={item.isActive}
                      onCheckedChange={() => toggleActive(item)}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-center gap-1">
                      <button
                        onClick={() => reorderMutation.mutate({ id: item.id, direction: 'up' })}
                        className="p-1 rounded hover:bg-accent text-muted-foreground hover:text-foreground disabled:opacity-30"
                        disabled={i === 0}
                      >
                        <ChevronUp className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => reorderMutation.mutate({ id: item.id, direction: 'down' })}
                        className="p-1 rounded hover:bg-accent text-muted-foreground hover:text-foreground disabled:opacity-30"
                        disabled={i === items.length - 1}
                      >
                        <ChevronDown className="w-4 h-4" />
                      </button>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button size="sm" variant="ghost" onClick={() => openEdit(item)}>
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-destructive hover:text-destructive"
                        onClick={() => setDeleteTarget(item)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? 'Редактировать отзыв' : 'Новый отзыв'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1.5">
              <Label>Текст отзыва</Label>
              <Textarea {...register('text')} placeholder="Введите текст отзыва" rows={5} />
              {errors.text && <p className="text-xs text-destructive">{errors.text.message}</p>}
            </div>
            <div className="flex items-center gap-3">
              <Switch
                checked={isActive}
                onCheckedChange={(v) => setValue('isActive', v)}
              />
              <Label>Активен</Label>
            </div>
            <DialogFooter className="gap-2">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Отмена
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? 'Сохранение…' : 'Сохранить'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Удалить отзыв?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground line-clamp-2">{deleteTarget?.text}</p>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>Отмена</Button>
            <Button
              variant="destructive"
              onClick={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
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
