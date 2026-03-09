import * as React from 'react'
import { cn } from '@/lib/utils'

interface SpinnerProps {
  className?: string
  size?: 'sm' | 'default' | 'lg'
}

function Spinner({ className, size = 'default' }: SpinnerProps) {
  const sizeClasses = {
    sm: 'h-4 w-4 border-2',
    default: 'h-6 w-6 border-2',
    lg: 'h-8 w-8 border-[3px]',
  }

  return (
    <div
      className={cn(
        'animate-spin rounded-full border-border border-t-foreground',
        sizeClasses[size],
        className,
      )}
      role="status"
      aria-label="Загрузка"
    />
  )
}

export { Spinner }
