import { NextRequest, NextResponse } from "next/server"
import { getSessionFromRequest } from "@/lib/auth/session"

// ── Route definitions ──────────────────────────────────────────────────────
const PUBLIC_ROUTES = ["/", "/privacy", "/terms", "/contact", "/blog"]
const AUTH_ROUTES = [
  "/auth/login",
  "/auth/sign-up",
  "/auth/sign-up-success",
  "/auth/forgot-password",
  "/auth/reset-password",
  "/auth/verify-email",
]
const PROTECTED_ROUTES = ["/dashboard"]
const ADMIN_ROUTES = ["/admin"]

// ── Security headers ───────────────────────────────────────────────────────
function applySecurityHeaders(response: NextResponse): NextResponse {
  response.headers.set("X-Content-Type-Options", "nosniff")
  response.headers.set("X-Frame-Options", "DENY")
  response.headers.set("X-XSS-Protection", "1; mode=block")
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin")
  response.headers.set("Strict-Transport-Security", "max-age=63072000; includeSubDomains; preload")
  response.headers.set("Cross-Origin-Opener-Policy", "same-origin")
  response.headers.set("Cross-Origin-Resource-Policy", "same-site")
  response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=(), payment=(), usb=(), bluetooth=()")
  return response
}

// ── Safe redirect validator — prevents open redirect attacks ───────────────
function getSafeRedirect(redirect: string | null, fallback: string): string {
  if (
    redirect &&
    typeof redirect === "string" &&
    redirect.startsWith("/") &&
    !redirect.startsWith("//") &&
    !redirect.includes("..") &&
    !redirect.toLowerCase().includes("javascript") &&
    !redirect.toLowerCase().includes("%2f%2f") &&
    !redirect.toLowerCase().includes("%0a") &&
    !redirect.toLowerCase().includes("%0d") &&
    redirect.length < 200
  ) {
    return redirect
  }
  return fallback
}

// ── Route matchers ─────────────────────────────────────────────────────────
const isPublicRoute = (p: string) => PUBLIC_ROUTES.includes(p)
const isAuthRoute = (p: string) => AUTH_ROUTES.some(r => p.startsWith(r))
const isProtectedRoute = (p: string) => PROTECTED_ROUTES.some(r => p.startsWith(r))
const isAdminRoute = (p: string) => ADMIN_ROUTES.some(r => p.startsWith(r))

// ── Static/service worker file check — NEVER redirect these ───────────────
function isStaticFile(pathname: string): boolean {
  return (
    pathname.includes("OneSignal") ||
    pathname.includes(".sw.js") ||
    pathname.endsWith("sw.js") ||
    pathname.endsWith(".js") ||
    pathname.endsWith(".png") ||
    pathname.endsWith(".jpg") ||
    pathname.endsWith(".jpeg") ||
    pathname.endsWith(".webp") ||
    pathname.endsWith(".svg") ||
    pathname.endsWith(".ico") ||
    pathname.endsWith(".woff") ||
    pathname.endsWith(".woff2") ||
    pathname.endsWith(".ttf") ||
    pathname.endsWith(".webmanifest") ||
    pathname.endsWith(".xml") ||
    pathname.endsWith(".txt") ||
    pathname === "/sitemap.xml" ||
    pathname === "/robots.txt" ||
    pathname === "/site.webmanifest"
  )
}

// ── Main proxy function ────────────────────────────────────────────────────
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // ── CRITICAL: Never intercept static files or service workers ────────────
  // This was breaking OneSignal push notifications
  if (isStaticFile(pathname)) {
    return NextResponse.next()
  }

  const session = getSessionFromRequest(request)
  const isLoggedIn = !!session
  const isAdmin = session?.isAdmin === true

  // ── 1. Force www — skip if already www ───────────────────────────────────
  const host = request.headers.get("host") || ""
  if (host === "qyantra.online") {
    const wwwUrl = new URL(request.url)
    wwwUrl.host = "www.qyantra.online"
    return applySecurityHeaders(
      NextResponse.redirect(wwwUrl, { status: 301 })
    )
  }

  // ── 2. Logged in + landing page → dashboard ───────────────────────────────
  if (isLoggedIn && pathname === "/") {
    return applySecurityHeaders(
      NextResponse.redirect(new URL("/dashboard", request.url))
    )
  }

  // ── 3. Logged in + auth pages → dashboard ────────────────────────────────
  if (isLoggedIn && isAuthRoute(pathname)) {
    return applySecurityHeaders(
      NextResponse.redirect(new URL("/dashboard", request.url))
    )
  }

  // ── 4. Not logged in + protected routes → login ───────────────────────────
  if (!isLoggedIn && isProtectedRoute(pathname)) {
    const loginUrl = new URL("/auth/login", request.url)
    // Safe redirect — validate before setting
    const safeFrom = getSafeRedirect(pathname, "/dashboard")
    loginUrl.searchParams.set("from", safeFrom)
    return applySecurityHeaders(NextResponse.redirect(loginUrl))
  }

  // ── 5. Not logged in + admin routes → login ───────────────────────────────
  if (!isLoggedIn && isAdminRoute(pathname)) {
    return applySecurityHeaders(
      NextResponse.redirect(new URL("/auth/login", request.url))
    )
  }

  // ── 6. Logged in but not admin + admin routes → dashboard ─────────────────
  if (isLoggedIn && !isAdmin && isAdminRoute(pathname)) {
    return applySecurityHeaders(
      NextResponse.redirect(new URL("/dashboard", request.url))
    )
  }

  // ── 7. Unknown routes → 404 (NOT a redirect) ──────────────────────────────
  // IMPORTANT: Do NOT redirect unknown routes — this was breaking OneSignal
  // and is bad UX. Let Next.js handle with the proper 404 page.
  const isKnownRoute =
    isPublicRoute(pathname) ||
    isAuthRoute(pathname) ||
    isProtectedRoute(pathname) ||
    isAdminRoute(pathname) ||
    pathname.startsWith("/chat") ||
    pathname.startsWith("/api")

  if (!isKnownRoute) {
    // Let Next.js show the 404 page — never redirect unknown routes
    return applySecurityHeaders(NextResponse.next())
  }

  // ── 8. Pass through with security headers ─────────────────────────────────
  const response = NextResponse.next()

  // Inject session info for server components — avoids re-reading cookie
  if (session) {
    response.headers.set("x-user-id", String(session.userId))
    response.headers.set("x-user-is-admin", String(session.isAdmin))
    response.headers.set("x-user-email", session.email)
  }

  // No cache for protected and admin routes
  if (isProtectedRoute(pathname) || isAdminRoute(pathname)) {
    response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, private")
    response.headers.set("Pragma", "no-cache")
    response.headers.set("Expires", "0")
  }

  return applySecurityHeaders(response)
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|favicon.svg|favicon-96x96.png|apple-touch-icon.png|web-app-manifest-192x192.png|web-app-manifest-512x512.png|site.webmanifest|robots.txt|sitemap.xml|sw.js|OneSignalSDKWorker.js|OneSignalSDK.sw.js|.*\\.png|.*\\.svg|.*\\.ico|.*\\.jpg|.*\\.jpeg|.*\\.webp|.*\\.woff|.*\\.woff2|.*\\.ttf|.*\\.js).*)",
  ],
}