import { NextRequest, NextResponse } from "next/server"
import { getSessionFromRequest } from "@/lib/auth/session"

// ── Route definitions ──────────────────────────────────────────────────────
const PUBLIC_ROUTES = ["/", "/privacy", "/terms", "/contact"]
const AUTH_ROUTES = ["/auth/login", "/auth/sign-up"]
const PROTECTED_ROUTES = ["/dashboard", "/profile", "/settings", "/withdraw", "/tasks"]
const ADMIN_ROUTES = ["/admin", "/api/admin"]

// ── Security headers ───────────────────────────────────────────────────────
function applySecurityHeaders(response: NextResponse): NextResponse {
  response.headers.set("X-Content-Type-Options", "nosniff")
  response.headers.set("X-Frame-Options", "DENY")
  response.headers.set("X-XSS-Protection", "1; mode=block")
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin")
  response.headers.set("Strict-Transport-Security", "max-age=63072000; includeSubDomains; preload")
  response.headers.set("Cross-Origin-Opener-Policy", "same-origin")
  response.headers.set("Cross-Origin-Resource-Policy", "same-site")
  response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=(), payment=()")
  return response
}

// ── Safe redirect validator ────────────────────────────────────────────────
function getSafeRedirect(redirect: string | null, fallback: string): string {
  if (
    redirect &&
    typeof redirect === "string" &&
    redirect.startsWith("/") &&
    !redirect.startsWith("//") &&
    !redirect.includes("..") &&
    !redirect.toLowerCase().includes("javascript") &&
    redirect.length < 200
  ) {
    return redirect
  }
  return fallback
}

// ── Route matchers ─────────────────────────────────────────────────────────
const isPublicRoute = (p: string) => PUBLIC_ROUTES.includes(p)
const isAuthRoute = (p: string) => AUTH_ROUTES.some((r) => p.startsWith(r))
const isProtectedRoute = (p: string) => PROTECTED_ROUTES.some((r) => p.startsWith(r))
const isAdminRoute = (p: string) => ADMIN_ROUTES.some((r) => p.startsWith(r))

// ── Main proxy function ────────────────────────────────────────────────────
export async function proxy(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl
  const session = getSessionFromRequest(request)
  const isLoggedIn = !!session
  const isAdmin = session?.isAdmin === true

  // ── 1. Force www ──────────────────────────────────────────────────────
  const host = request.headers.get("host") || ""
  if (host === "qyantra.online") {
    const wwwUrl = new URL(request.url)
    wwwUrl.host = "www.qyantra.online"
    return applySecurityHeaders(
      NextResponse.redirect(wwwUrl, { status: 301 })
    )
  }

  // ── 2. Logged in → landing page → dashboard ───────────────────────────
  if (isLoggedIn && pathname === "/") {
    return applySecurityHeaders(
      NextResponse.redirect(new URL("/dashboard", request.url))
    )
  }

  // ── 3. Logged in → auth pages → dashboard ────────────────────────────
  if (isLoggedIn && isAuthRoute(pathname)) {
    return applySecurityHeaders(
      NextResponse.redirect(new URL("/dashboard", request.url))
    )
  }

  // ── 4. Not logged in → protected routes → login ───────────────────────
  if (!isLoggedIn && isProtectedRoute(pathname)) {
    const loginUrl = new URL("/auth/login", request.url)
    loginUrl.searchParams.set("redirect", pathname)
    return applySecurityHeaders(NextResponse.redirect(loginUrl))
  }

  // ── 5. Not logged in → admin → login ──────────────────────────────────
  if (!isLoggedIn && isAdminRoute(pathname)) {
    const loginUrl = new URL("/auth/login", request.url)
    loginUrl.searchParams.set("redirect", pathname)
    return applySecurityHeaders(NextResponse.redirect(loginUrl))
  }

  // ── 6. Logged in but not admin → admin routes → dashboard ────────────
  if (isLoggedIn && !isAdmin && isAdminRoute(pathname)) {
    return applySecurityHeaders(
      NextResponse.redirect(new URL("/dashboard", request.url))
    )
  }

  // ── 7. Unknown route → redirect based on auth ─────────────────────────
  const isKnownRoute =
    isPublicRoute(pathname) ||
    isAuthRoute(pathname) ||
    isProtectedRoute(pathname) ||
    isAdminRoute(pathname)

  if (!isKnownRoute) {
    return applySecurityHeaders(
      NextResponse.redirect(
        new URL(isLoggedIn ? "/dashboard" : "/", request.url)
      )
    )
  }

  // ── 8. Pass through ───────────────────────────────────────────────────
  const response = NextResponse.next()

  // Inject session info into headers for server components
  if (session) {
    response.headers.set("x-user-id", String(session.userId))
    response.headers.set("x-user-is-admin", String(session.isAdmin))
  }

  // No cache for protected routes
  if (isProtectedRoute(pathname) || isAdminRoute(pathname)) {
    response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, private")
    response.headers.set("Pragma", "no-cache")
  }

  return applySecurityHeaders(response)
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|favicon.svg|favicon-96x96.png|apple-touch-icon.png|web-app-manifest-512x512.png|site.webmanifest|robots.txt|sitemap.xml|sw.js|icon.*|.*\\.png|.*\\.svg|.*\\.ico|.*\\.jpg|.*\\.jpeg|.*\\.webp|.*\\.woff|.*\\.woff2).*)",
  ],
}