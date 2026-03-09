'use client'

import { useRef, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Plus, Pencil, Trash2, ChevronUp, ChevronDown, Loader2, Upload, X,
} from 'lucide-react'
import Image from 'next/image'
import { teamApi } from '@/lib/api/team'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog'
import { useToast } from '@/components/ui/toast'

const API_URL = process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '') ?? 'http://localhost:4000'

function resolvePhotoUrl(url: string) {
  if (!url) return ''
  if (url.startsWith('http')) return url
  return `${API_URL}${url}`
}

const schema = z.object({
  name: z.string().min(1, 'Введите имя'),
  photoUrl: z.string().min(1, 'Требуется URL фото'),
  description: z.string().min(1, 'Введите описание'),
})
type FormData = z.infer<typeof schema>

export default function TeamPage() {
  const qc = useQueryClient()
  const { toast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<any>(null)
  const [deleteTarget, setDeleteTarget] = useState<any>(null)
  const [uploading, setUploading] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string>('')

  const { data: members = [], isLoading } = useQuery({
    queryKey: ['team'],
    queryFn: () => teamApi.getList(),
  })

  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const watchedUrl = watch('photoUrl')

  const openCreate = () => {
    setEditing(null)
    reset({ name: '', photoUrl: '', description: '' })
    setPreviewUrl('')
    setDialogOpen(true)
  }

  const openEdit = (item: any) => {
    setEditing(item)
    reset({ name: item.name, photoUrl: item.photoUrl, description: item.description })
    setPreviewUrl(resolvePhotoUrl(item.photoUrl))
    setDialogOpen(true)
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const url = await teamApi.upload(file)
      setValue('photoUrl', url, { shouldValidate: true })
      setPreviewUrl(resolvePhotoUrl(url))
    } catch {
      toast('Ошибка загрузки файла', 'error')
    } finally {
      setUploading(false)
    }
  }

  const createMutation = useMutation({
    mutationFn: (data: FormData) => teamApi.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['team'] })
      setDialogOpen(false)
      toast('Участник добавлен', 'success')
    },
    onError: () => toast('Ошибка при создании', 'error'),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: FormData }) =>
      teamApi.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['team'] })
      setDialogOpen(false)
      toast('Участник обновлён', 'success')
    },
    onError: () => toast('Ошибка при обновлении', 'error'),
  })

  const reorderMutation = useMutation({
    mutationFn: ({ id, direction }: { id: string; direction: 'up' | 'down' }) =>
      teamApi.reorder(id, direction),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['team'] }),
    onError: () => toast('Нельзя переместить', 'error'),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => teamApi.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['team'] })
      setDeleteTarget(null)
      toast('Участник удалён', 'success')
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
        <h1 className="text-xl font-semibold">Команда</h1>
        <Button size="sm" onClick={openCreate}>
          <Plus className="w-4 h-4" />
          Добавить участника
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      ) : !members.length ? (
        <div className="border border-dashed border-border rounded-lg py-16 text-center text-muted-foreground text-sm">
          Нет участников. Добавьте первого.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3">
          {members.map((item: any, i: number) => (
            <div
              key={item.id}
              className="flex items-center gap-4 border border-border rounded-lg p-3 bg-card"
            >
              {/* Avatar */}
              <div className="w-20 h-20 rounded overflow-hidden shrink-0 bg-muted relative">
                {item.photoUrl ? (
                  <Image
                    src={resolvePhotoUrl(item.photoUrl)}
                    alt=""
                    fill
                    className="object-cover"
                    unoptimized
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                    <Upload className="w-4 h-4" />
                  </div>
                )}
              </div>

              {/* Name + Description */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground">{item.name}</p>
                <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{item.description}</p>
              </div>

              {/* Reorder */}
              <div className="flex flex-col gap-0.5 shrink-0">
                <button
                  onClick={() => reorderMutation.mutate({ id: item.id, direction: 'up' })}
                  disabled={i === 0}
                  className="p-1 rounded hover:bg-accent text-muted-foreground hover:text-foreground disabled:opacity-30"
                >
                  <ChevronUp className="w-4 h-4" />
                </button>
                <button
                  onClick={() => reorderMutation.mutate({ id: item.id, direction: 'down' })}
                  disabled={i === members.length - 1}
                  className="p-1 rounded hover:bg-accent text-muted-foreground hover:text-foreground disabled:opacity-30"
                >
                  <ChevronDown className="w-4 h-4" />
                </button>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1 shrink-0">
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
            </div>
          ))}
        </div>
      )}

      {/* Create / Edit dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? 'Редактировать участника' : 'Новый участник'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1.5">
              <Label>Имя</Label>
              <Input {...register('name')} placeholder="Екатерина Карпенко" />
              {errors.name && (
                <p className="text-xs text-destructive">{errors.name.message}</p>
              )}
            </div>

            {/* Photo */}
            <div className="space-y-1.5">
              <Label>Фото</Label>
              {/* Preview */}
              {(previewUrl || watchedUrl) && (
                <div className="relative w-full aspect-square rounded overflow-hidden bg-muted mb-2">
                  <Image
                    src={previewUrl || resolvePhotoUrl(watchedUrl)}
                    alt="preview"
                    fill
                    className="object-cover"
                    unoptimized
                  />
                  <button
                    type="button"
                    onClick={() => { setValue('photoUrl', ''); setPreviewUrl('') }}
                    className="absolute top-1 right-1 bg-black/50 rounded-full p-0.5 text-white hover:bg-black/70"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}
              {/* Upload button */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={handleFileChange}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
              >
                {uploading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Upload className="w-4 h-4" />
                )}
                {uploading ? 'Загрузка...' : 'Загрузить файл'}
              </Button>
              <p className="text-xs text-muted-foreground">или введите URL вручную:</p>
              <Input {...register('photoUrl')} placeholder="https://... или /uploads/..." />
              {errors.photoUrl && (
                <p className="text-xs text-destructive">{errors.photoUrl.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label>Описание / должность</Label>
              <Textarea {...register('description')} rows={2} placeholder="Основатель и ведущий организатор" />
              {errors.description && (
                <p className="text-xs text-destructive">{errors.description.message}</p>
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

      {/* Delete confirm */}
      <Dialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Удалить участника?</DialogTitle>
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
