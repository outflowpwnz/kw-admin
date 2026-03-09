'use client'

import * as React from 'react'
import * as PopoverPrimitive from '@radix-ui/react-popover'
import { DayPicker } from 'react-day-picker'
import { ru } from 'date-fns/locale'
import { format, parseISO, isValid } from 'date-fns'
import { CalendarIcon, X } from 'lucide-react'
import { cn } from '@/lib/utils'

import 'react-day-picker/style.css'

// ── Popover primitives ──────────────────────────────────────────────

const Popover = PopoverPrimitive.Root
const PopoverTrigger = PopoverPrimitive.Trigger

const PopoverContent = React.forwardRef<
  React.ElementRef<typeof PopoverPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Content>
>(({ className, align = 'start', sideOffset = 4, ...props }, ref) => (
  <PopoverPrimitive.Portal>
    <PopoverPrimitive.Content
      ref={ref}
      align={align}
      sideOffset={sideOffset}
      className={cn(
        'z-50 rounded-md border border-border bg-card shadow-md outline-none',
        'data-[state=open]:animate-in data-[state=closed]:animate-out',
        'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
        'data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
        'data-[side=bottom]:slide-in-from-top-2 data-[side=top]:slide-in-from-bottom-2',
        className,
      )}
      {...props}
    />
  </PopoverPrimitive.Portal>
))
PopoverContent.displayName = PopoverPrimitive.Content.displayName

// ── DatePicker ──────────────────────────────────────────────────────

interface DatePickerProps {
  /** ISO date string (YYYY-MM-DD) or undefined */
  value?: string
  onChange?: (iso: string | undefined) => void
  placeholder?: string
  className?: string
  disabled?: boolean
}

export function DatePicker({
  value,
  onChange,
  placeholder = 'Выберите дату',
  className,
  disabled,
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false)

  const selected = React.useMemo(() => {
    if (!value) return undefined
    const d = parseISO(value)
    return isValid(d) ? d : undefined
  }, [value])

  const handleSelect = (day: Date | undefined) => {
    onChange?.(day ? format(day, 'yyyy-MM-dd') : undefined)
    if (day) setOpen(false)
  }

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation()
    onChange?.(undefined)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          disabled={disabled}
          className={cn(
            'flex h-9 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm',
            'focus:outline-none focus:ring-2 focus:ring-ring',
            'disabled:cursor-not-allowed disabled:opacity-50',
            !selected && 'text-muted-foreground',
            className,
          )}
        >
          <span className="flex items-center gap-2">
            <CalendarIcon className="h-4 w-4 shrink-0 opacity-50" />
            {selected ? format(selected, 'dd.MM.yyyy') : placeholder}
          </span>
          {selected && (
            <span
              role="button"
              onClick={handleClear}
              className="ml-2 rounded-sm opacity-50 hover:opacity-100 transition-opacity"
            >
              <X className="h-3.5 w-3.5" />
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-3">
        <DayPicker
          mode="single"
          selected={selected}
          onSelect={handleSelect}
          locale={ru}
          showOutsideDays
          classNames={{
            root: 'text-sm',
            months: 'flex flex-col',
            month: 'space-y-3',
            month_caption: 'flex justify-center items-center h-7 relative',
            caption_label: 'text-sm font-medium capitalize',
            nav: 'flex items-center absolute inset-x-0 top-0 justify-between px-1',
            button_previous: cn(
              'flex items-center justify-center h-7 w-7 rounded-md',
              'hover:bg-accent transition-colors opacity-50 hover:opacity-100',
            ),
            button_next: cn(
              'flex items-center justify-center h-7 w-7 rounded-md',
              'hover:bg-accent transition-colors opacity-50 hover:opacity-100',
            ),
            month_grid: 'w-full border-collapse',
            weekdays: 'flex',
            weekday: 'text-muted-foreground w-9 font-normal text-[0.8rem] text-center',
            week: 'flex w-full mt-2',
            day: 'relative p-0 text-center',
            day_button: cn(
              'h-9 w-9 rounded-md text-sm font-normal',
              'hover:bg-accent hover:text-accent-foreground transition-colors',
              'focus:outline-none focus:ring-2 focus:ring-ring',
            ),
            selected: '[&>button]:bg-primary [&>button]:text-primary-foreground [&>button]:hover:bg-primary/90',
            today: '[&>button]:font-semibold [&>button]:underline',
            outside: '[&>button]:text-muted-foreground [&>button]:opacity-50',
            disabled: '[&>button]:text-muted-foreground [&>button]:opacity-50 [&>button]:cursor-not-allowed',
          }}
        />
      </PopoverContent>
    </Popover>
  )
}
