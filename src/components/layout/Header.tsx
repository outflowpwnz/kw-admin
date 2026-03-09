'use client'

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { Menu, X } from 'lucide-react'
import { useMe } from '@/hooks/useAuth'
import { SidebarNav } from './SidebarNav'
import { cn } from '@/lib/utils'

export function Header() {
  const { data: me } = useMe()
  const [open, setOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  const displayName = me?.name ?? me?.login ?? 'Администратор'
  const initials = displayName[0].toUpperCase()

  useEffect(() => { setMounted(true) }, [])

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  const close = () => setOpen(false)

  return (
    <>
      <header className="h-14 shrink-0 flex items-center justify-between px-4 md:px-6 border-b border-border bg-card">
        {/* Бургер — только mobile */}
        <button
          className="md:hidden flex items-center justify-center w-8 h-8 text-muted-foreground hover:text-foreground transition-colors"
          onClick={() => setOpen(true)}
          aria-label="Открыть меню"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="hidden md:block" />

        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground hidden sm:block">
            {displayName}
          </span>
          <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xs font-medium select-none">
            {initials}
          </div>
        </div>
      </header>

      {/* Mobile drawer */}
      {mounted && createPortal(
        <div
          className={cn(
            'fixed inset-0 z-[200]',
            open ? 'pointer-events-auto' : 'pointer-events-none'
          )}
          aria-hidden={!open}
        >
          {/* Overlay */}
          <div
            className={cn(
              'absolute inset-0 bg-black/50 transition-opacity duration-300',
              open ? 'opacity-100' : 'opacity-0'
            )}
            onClick={close}
          />

          {/* Drawer */}
          <aside
            className={cn(
              'absolute top-0 left-0 h-full w-64 flex flex-col bg-sidebar shadow-xl',
              'transition-transform duration-300 ease-in-out',
              open ? 'translate-x-0' : '-translate-x-full'
            )}
          >
            {/* Header */}
            <div className="h-14 flex items-center justify-between px-5 border-b border-sidebar-border shrink-0">
              <span className="text-sm font-semibold tracking-wide uppercase text-sidebar-foreground">
                KW Admin
              </span>
              <button
                onClick={close}
                aria-label="Закрыть меню"
                className="w-7 h-7 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <SidebarNav onNavigate={close} />
          </aside>
        </div>,
        document.body
      )}
    </>
  )
}
