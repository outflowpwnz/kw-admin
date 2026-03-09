'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Plus, Pencil, Trash2, ChevronUp, ChevronDown, Loader2 } from 'lucide-react'
import { packagesApi, Package } from '@/lib/api/packages'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
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
  name: z.string().min(1, 'Введите название'),
  shortDescription: z.string().min(1, 'Введите краткое описание'),
  fullDescription: z.string().min(1, 'Введите полное описание'),
  price: z.string().optional(),
})
type FormData = z.infer<typeof schema>

export default function PackagesPage() {
  const qc = useQueryClient()
  const { toast } = useToast()

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Package | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Package | null>(null)

  const { data: packages = [], isLoading } = useQuery({
    queryKey: ['packages'],
    queryFn: () => packagesApi.getList(),
  })

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const openCreate = () => {
    setEditing(null)
    reset({ name: '', shortDescription: '', fullDescription: '', price: '' })
    setDialogOpen(true)
  }

  const openEdit = (pkg: Package) => {
    setEditing(pkg)
    reset({
      name: pkg.name,
      shortDescription: pkg.shortDescription,
      fullDescription: pkg.fullDescription,
      price: pkg.price ?? '',
    })
    setDialogOpen(true)
  }

  const createMutation = useMutation({
    mutationFn: (data: FormData) =>
      packagesApi.create({ ...data, price: data.price || null }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['packages'] })
      setDialogOpen(false)
      toast('Пакет добавлен', 'success')
    },
    onError: () => toast('Ошибка при создании', 'error'),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: FormData }) =>
      packagesApi.update(id, { ...data, price: data.price || null }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['packages'] })
      setDialogOpen(false)
      toast('Пакет обновлён', 'success')
    },
    onError: () => toast('Ошибка при обновлении', 'error'),
  })

  const reorderMutation = useMutation({
    mutationFn: ({ id, direction }: { id: string; direction: 'up' | 'down' }) =>
      packagesApi.reorder(id, direction),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['packages'] }),
    onError: () => toast('Нельзя переместить', 'error'),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => packagesApi.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['packages'] })
      setDeleteTarget(null)
      toast('Пакет удалён', 'success')
    },
    onError: () => toast('Ошибка при удалении', 'error'),
  })

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
        <h1 className="text-xl font-semibold">Пакеты услуг</h1>
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
              <TableHead>Название</TableHead>
              <TableHead>Краткое описание</TableHead>
              <TableHead className="w-32">Цена</TableHead>
              <TableHead className="w-24 text-center">Порядок</TableHead>
              <TableHead className="w-24 text-right">Действия</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="h-32 text-center">
                  <Loader2 className="w-5 h-5 animate-spin mx-auto text-muted-foreground" />
                </TableCell>
              </TableRow>
            ) : !packages.length ? (
              <TableRow>
                <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                  Нет пакетов
                </TableCell>
              </TableRow>
            ) : (
              packages.map((pkg, i) => (
                <TableRow key={pkg.id}>
                  <TableCell className="text-muted-foreground text-sm">{i + 1}</TableCell>
                  <TableCell className="text-sm font-medium">{pkg.name}</TableCell>
                  <TableCell className="text-sm text-muted-foreground max-w-xs">
                    <p className="line-clamp-2">{pkg.shortDescription}</p>
                  </TableCell>
                  <TableCell className="text-sm">{pkg.price ?? '—'}</TableCell>
                  <TableCell>
                    <div className="flex items-center justify-center gap-1">
                      <button
                        onClick={() => reorderMutation.mutate({ id: pkg.id, direction: 'up' })}
                        className="p-1 rounded hover:bg-accent text-muted-foreground hover:text-foreground disabled:opacity-30"
                        disabled={i === 0}
                      >
                        <ChevronUp className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => reorderMutation.mutate({ id: pkg.id, direction: 'down' })}
                        className="p-1 rounded hover:bg-accent text-muted-foreground hover:text-foreground disabled:opacity-30"
                        disabled={i === packages.length - 1}
                      >
                        <ChevronDown className="w-4 h-4" />
                      </button>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button size="sm" variant="ghost" onClick={() => openEdit(pkg)}>
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-destructive hover:text-destructive"
                        onClick={() => setDeleteTarget(pkg)}
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
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>{editing ? 'Редактировать пакет' : 'Новый пакет'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1.5">
              <Label>Название</Label>
              <Input {...register('name')} />
              {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label>Цена (необязательно)</Label>
              <Input {...register('price')} placeholder="например: от 50 000 ₽" />
            </div>
            <div className="space-y-1.5">
              <Label>Краткое описание</Label>
              <Textarea {...register('shortDescription')} rows={2} />
              {errors.shortDescription && (
                <p className="text-xs text-destructive">{errors.shortDescription.message}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label>Полное описание</Label>
              <Textarea {...register('fullDescription')} rows={5} />
              {errors.fullDescription && (
                <p className="text-xs text-destructive">{errors.fullDescription.message}</p>
              )}
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
            <DialogTitle>Удалить пакет?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">{deleteTarget?.name}</p>
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
