import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function proxy(request: NextRequest) {
  const sessionToken = request.cookies.get('session')?.value
  const { pathname } = request.nextUrl

  const isProtectedPath =
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/settings') ||
    pathname.startsWith('/habits')

  const isAuthPath = pathname === '/login' || pathname === '/signup'

  if (isProtectedPath && !sessionToken) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  if (isAuthPath && sessionToken) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/settings/:path*',
    '/habits/:path*',
    '/login',
    '/signup',
  ],
}
