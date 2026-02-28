import { NextRequest, NextResponse } from "next/server"
import { getSessionFromRequest } from "@/lib/auth/session"

const protectedRoutes = ["/dashboard", "/api/admin", "/admin"]
const authRoutes = ["/auth/login", "/auth/sign-up"]
const adminRoutes = ["/admin", "/api/admin"]

export async function proxy(request: NextRequest) {
  const session = getSessionFromRequest(request)
  const { pathname } = request.nextUrl

  // 1. Protect dashboard/admin routes
  if (protectedRoutes.some(route => pathname.startsWith(route))) {
    if (!session) {
      const url = request.nextUrl.clone()
      url.pathname = "/auth/login"
      url.searchParams.set("return", pathname)
      return NextResponse.redirect(url)
    }

    // 2. Admin-only routes
    if (adminRoutes.some(route => pathname.startsWith(route)) && !session.isAdmin) {
      const url = request.nextUrl.clone()
      url.pathname = "/dashboard"
      return NextResponse.redirect(url)
    }
  }

  // 3. Redirect logged-in users away from auth pages
  if (session && authRoutes.some(route => pathname.startsWith(route))) {
    const url = request.nextUrl.clone()
    url.pathname = "/dashboard"
    return NextResponse.redirect(url)
  }

  const response = NextResponse.next()

  // 4. Security headers
  response.headers.set("X-Content-Type-Options", "nosniff")
  response.headers.set("X-Frame-Options", "DENY")
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin")
  response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()")

  // 5. No caching for protected pages
  if (protectedRoutes.some(route => pathname.startsWith(route))) {
    response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, private")
    response.headers.set("Pragma", "no-cache")
  }

  return response
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
}