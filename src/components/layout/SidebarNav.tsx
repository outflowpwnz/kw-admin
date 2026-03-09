'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutList,
  MessageSquare,
  HelpCircle,
  Package,
  Settings,
  LogOut,
  Images,
  Users,
  Users2,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useLogout } from '@/hooks/useAuth'

const NAV = [
  { href: '/applications', label: 'Анкеты',         icon: LayoutList },
  { href: '/users',        label: 'Администраторы', icon: Users },
]

const CONTENT_NAV = [
  { href: '/content/faq',       label: 'FAQ',       icon: HelpCircle },
  { href: '/content/reviews',   label: 'Отзывы',    icon: MessageSquare },
  { href: '/content/packages',  label: 'Пакеты',    icon: Package },
  { href: '/content/portfolio', label: 'Портфолио', icon: Images },
  { href: '/content/team',      label: 'Команда',   icon: Users2 },
  { href: '/content/settings',  label: 'Настройки', icon: Settings },
]

interface Props {
  onNavigate?: () => void
}

export function SidebarNav({ onNavigate }: Props) {
  const pathname = usePathname()
  const logout = useLogout()

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + '/')

  const linkClass = (href: string) =>
    cn(
      'flex items-center gap-2.5 px-3 py-2 rounded-md text-sm transition-colors',
      isActive(href)
        ? 'bg-sidebar-accent text-sidebar-accent-foreground font-medium'
        : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
    )

  return (
    <>
      <nav className="flex-1 py-4 px-3 space-y-0.5 overflow-y-auto">
        {NAV.map(({ href, label, icon: Icon }) => (
          <Link key={href} href={href} className={linkClass(href)} onClick={onNavigate}>
            <Icon className="w-4 h-4 shrink-0" />
            {label}
          </Link>
        ))}

        <div className="pt-3 pb-1 px-3">
          <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium">
            Контент
          </p>
        </div>

        {CONTENT_NAV.map(({ href, label, icon: Icon }) => (
          <Link key={href} href={href} className={linkClass(href)} onClick={onNavigate}>
            <Icon className="w-4 h-4 shrink-0" />
            {label}
          </Link>
        ))}
      </nav>

      <div className="p-3 border-t border-sidebar-border">
        <button
          onClick={() => { logout.mutate(); onNavigate?.() }}
          disabled={logout.isPending}
          className={cn(
            'w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-sm',
            'text-muted-foreground hover:bg-sidebar-accent hover:text-destructive',
            'transition-colors disabled:opacity-50',
          )}
        >
          <LogOut className="w-4 h-4 shrink-0" />
          Выйти
        </button>
      </div>
    </>
  )
}
