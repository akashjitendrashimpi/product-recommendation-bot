import { NextRequest, NextResponse } from "next/server"

const protectedRoutes = ['/dashboard', '/admin']
const authRoutes = ['/auth/login', '/auth/sign-up']

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const session = request.cookies.get('auth_session')

  // If trying to access protected route without session → redirect to login
  if (protectedRoutes.some(route => pathname.startsWith(route))) {
    if (!session) {
      return NextResponse.redirect(new URL('/auth/login', request.url))
    }
  }

  // If already logged in and trying to access auth pages → redirect to dashboard
  if (authRoutes.some(route => pathname.startsWith(route))) {
    if (session) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*', '/admin/:path*', '/auth/:path*']
}