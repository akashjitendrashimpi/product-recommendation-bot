import { NextRequest, NextResponse } from "next/server"
import { getSessionFromRequest } from "@/lib/auth/session"

export async function proxy(request: NextRequest) {
  const session = getSessionFromRequest(request)
  const response = NextResponse.next()

  // Protect dashboard and admin routes
  if (
    (request.nextUrl.pathname.startsWith("/dashboard") ||
      request.nextUrl.pathname.startsWith("/api/admin")) &&
    !session
  ) {
    const url = request.nextUrl.clone()
    url.pathname = "/auth/login"
    return NextResponse.redirect(url)
  }

  return response
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
}
