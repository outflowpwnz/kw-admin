'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

// Маска: +7 (___) ___-__-__
// Принимает только цифры, форматирует в реальном времени

interface PhoneInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value'> {
  value?: string
  onChange?: (value: string) => void
}

function applyMask(raw: string): string {
  // Оставляем только цифры
  const digits = raw.replace(/\D/g, '')

  // Если начинается с 8 или 7 — заменяем на 7
  const normalized = digits.startsWith('8') || digits.startsWith('7')
    ? digits.slice(1)
    : digits

  const d = normalized.slice(0, 10)

  let result = ''
  if (d.length === 0) return ''
  result = '+7'
  if (d.length >= 1) result += ` (${d.slice(0, 3)}`
  if (d.length >= 4) result += `) ${d.slice(3, 6)}`
  if (d.length >= 7) result += `-${d.slice(6, 8)}`
  if (d.length >= 9) result += `-${d.slice(8, 10)}`

  return result
}

function extractDigits(masked: string): string {
  return masked.replace(/\D/g, '')
}

export const PhoneInput = React.forwardRef<HTMLInputElement, PhoneInputProps>(
  ({ className, value = '', onChange, ...props }, ref) => {
    const [display, setDisplay] = React.useState(() => applyMask(value))

    React.useEffect(() => {
      setDisplay(applyMask(value))
    }, [value])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const raw = e.target.value
      const masked = applyMask(raw)
      setDisplay(masked)
      onChange?.(extractDigits(masked))
    }

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      // Разрешаем Backspace удалять символы вместе с маской
      if (e.key === 'Backspace') {
        const input = e.currentTarget
        const pos = input.selectionStart ?? display.length
        // Если курсор стоит после нецифрового символа — прыгаем дальше назад
        const before = display.slice(0, pos)
        const lastDigitPos = before.search(/\d(?=\D*$)/)
        if (lastDigitPos !== -1) {
          const newDigits = extractDigits(display.slice(0, lastDigitPos) + display.slice(lastDigitPos + 1))
          const masked = newDigits ? applyMask(newDigits) : ''
          setDisplay(masked)
          onChange?.(extractDigits(masked))
          e.preventDefault()
        }
      }
    }

    return (
      <input
        ref={ref}
        type="tel"
        inputMode="tel"
        autoComplete="tel"
        value={display}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder="+7 (___) ___-__-__"
        maxLength={18}
        className={cn(
          'flex h-9 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm',
          'placeholder:text-muted-foreground',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
          'disabled:cursor-not-allowed disabled:opacity-50',
          className,
        )}
        {...props}
      />
    )
  },
)
PhoneInput.displayName = 'PhoneInput'
