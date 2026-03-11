import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Пути, доступные без авторизации
const PUBLIC_PATHS = ['/login']

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const isPublic = PUBLIC_PATHS.some((p) => pathname.startsWith(p))

  // Наличие cookie — достаточное условие для пропуска на фронте.
  // Реальная проверка подписи JWT происходит на бэкенде при каждом API-запросе.
  const hasToken = request.cookies.has('access_token')

  if (!isPublic && !hasToken) {
    return NextResponse.redirect(new URL('/admin/login', request.url))
  }

  if (isPublic && hasToken) {
    return NextResponse.redirect(new URL('/admin/', request.url))
  }

  return NextResponse.next()
}

export const config = {
  // Не трогаем статику и внутренние роуты Next.js
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
