'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Plus, Pencil, Trash2, ChevronUp, ChevronDown, Loader2 } from 'lucide-react'
import { faqApi, FaqItem } from '@/lib/api/faq'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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
  question: z.string().min(1, 'Введите вопрос'),
  answer: z.string().min(1, 'Введите ответ'),
  isActive: z.boolean(),
})
type FormData = z.infer<typeof schema>

export default function FaqPage() {
  const qc = useQueryClient()
  const { toast } = useToast()

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<FaqItem | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<FaqItem | null>(null)

  const { data: items = [], isLoading } = useQuery({
    queryKey: ['faq'],
    queryFn: () => faqApi.getList(),
  })

  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { question: '', answer: '', isActive: true },
  })
  const isActive = watch('isActive')

  const openCreate = () => {
    setEditing(null)
    reset({ question: '', answer: '', isActive: true })
    setDialogOpen(true)
  }

  const openEdit = (item: FaqItem) => {
    setEditing(item)
    reset({ question: item.question, answer: item.answer, isActive: item.isActive })
    setDialogOpen(true)
  }

  const createMutation = useMutation({
    mutationFn: (data: FormData) => faqApi.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['faq'] })
      setDialogOpen(false)
      toast('FAQ добавлен', 'success')
    },
    onError: () => toast('Ошибка при создании', 'error'),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: FormData }) => faqApi.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['faq'] })
      setDialogOpen(false)
      toast('FAQ обновлён', 'success')
    },
    onError: () => toast('Ошибка при обновлении', 'error'),
  })

  const reorderMutation = useMutation({
    mutationFn: ({ id, direction }: { id: string; direction: 'up' | 'down' }) =>
      faqApi.reorder(id, direction),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['faq'] }),
    onError: () => toast('Нельзя переместить', 'error'),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => faqApi.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['faq'] })
      setDeleteTarget(null)
      toast('FAQ удалён', 'success')
    },
    onError: () => toast('Ошибка при удалении', 'error'),
  })

  const toggleActive = (item: FaqItem) => {
    updateMutation.mutate({ id: item.id, data: { question: item.question, answer: item.answer, isActive: !item.isActive } })
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
        <h1 className="text-xl font-semibold">FAQ</h1>
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
              <TableHead>Вопрос</TableHead>
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
                  Нет элементов
                </TableCell>
              </TableRow>
            ) : (
              items.map((item, i) => (
                <TableRow key={item.id}>
                  <TableCell className="text-muted-foreground text-sm">{i + 1}</TableCell>
                  <TableCell>
                    <div className="text-sm font-medium line-clamp-1">{item.question}</div>
                    <div className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{item.answer}</div>
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

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? 'Редактировать FAQ' : 'Новый FAQ'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1.5">
              <Label>Вопрос</Label>
              <Input {...register('question')} placeholder="Введите вопрос" />
              {errors.question && <p className="text-xs text-destructive">{errors.question.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label>Ответ</Label>
              <Textarea {...register('answer')} placeholder="Введите ответ" rows={4} />
              {errors.answer && <p className="text-xs text-destructive">{errors.answer.message}</p>}
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

      {/* Delete Dialog */}
      <Dialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Удалить вопрос?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground line-clamp-2">{deleteTarget?.question}</p>
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
