'use client'

import { SidebarNav } from './SidebarNav'

export function Sidebar() {
  return (
    <aside className="hidden md:flex w-56 shrink-0 flex-col border-r border-border bg-sidebar h-full">
      <div className="h-14 flex items-center px-5 border-b border-sidebar-border">
        <span className="text-sm font-semibold tracking-wide uppercase text-sidebar-foreground">
          KW Admin
        </span>
      </div>
      <SidebarNav />
    </aside>
  )
}
