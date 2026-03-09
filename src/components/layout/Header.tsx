'use client'

import { useMe } from '@/hooks/useAuth'

export function Header() {
  const { data: me } = useMe()
  const initials = me?.login ? me.login[0].toUpperCase() : 'А'

  return (
    <header className="h-14 shrink-0 flex items-center justify-between px-6 border-b border-border bg-card">
      <div />

      <div className="flex items-center gap-3">
        <span className="text-sm text-muted-foreground">
          {me?.login ?? 'Администратор'}
        </span>
        <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xs font-medium select-none">
          {initials}
        </div>
      </div>
    </header>
  )
}
