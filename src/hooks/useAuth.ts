'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { authApi, LoginPayload } from '@/lib/api/auth'

export function useMe() {
  return useQuery({
    queryKey: ['me'],
    queryFn: () => authApi.me(),
    retry: false,
    staleTime: 5 * 60_000,
  })
}

export function useLogin() {
  const router = useRouter()
  const qc = useQueryClient()

  return useMutation({
    mutationFn: (data: LoginPayload) => authApi.login(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['me'] })
      router.push('/')
    },
  })
}

export function useLogout() {
  const router = useRouter()
  const qc = useQueryClient()

  return useMutation({
    mutationFn: () => authApi.logout(),
    onSuccess: () => {
      qc.clear()
      router.push('/login')
    },
  })
}
