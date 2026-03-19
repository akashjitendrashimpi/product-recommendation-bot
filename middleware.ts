import { NextRequest, NextResponse } from "next/server"
import { verifyUser } from "@/lib/db/users"
import { rateLimit } from "@/lib/security/rate-limit"
import { createSession } from "@/lib/auth/session"

// ── Email & password validators ───────────────────────────────────────────
function isValidEmail(email: string): boolean {
  return (
    typeof email === "string" &&
    email.length <= 254 &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
  )
}

function isValidPassword(password: string): boolean {
  return (
    typeof password === "string" &&
    password.length >= 6 &&
    password.length <= 128
  )
}

// ── Safe redirect validator ───────────────────────────────────────────────
function getSafeRedirect(redirect: string | null): string {
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
  return "/dashboard"
}

export async function POST(request: NextRequest) {
  try {

    // ── 1. Rate limit — 5 attempts per 60 seconds per IP ───────────────
    const rateLimitResponse = rateLimit(request, 5, 60000)
    if (rateLimitResponse) return rateLimitResponse

    // ── 2. Parse body safely ────────────────────────────────────────────
    let body: unknown
    try {
      body = await request.json()
    } catch {
      return NextResponse.json(
        { error: "Invalid request body" },
        { status: 400 }
      )
    }

    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { error: "Invalid request body" },
        { status: 400 }
      )
    }

    const { email, password, redirect } = body as Record<string, unknown>

    // ── 3. Validate inputs ──────────────────────────────────────────────
    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      )
    }

    if (!isValidEmail(email as string)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      )
    }

    if (!isValidPassword(password as string)) {
      return NextResponse.json(
        { error: "Invalid password format" },
        { status: 400 }
      )
    }

    // ── 4. Verify user credentials ──────────────────────────────────────
    const user = await verifyUser(
      (email as string).trim().toLowerCase(),
      password as string
    )

    // ── 5. Generic error — don't reveal if email exists or not ─────────
    if (!user) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      )
    }

    // ── 6. Check banned ─────────────────────────────────────────────────
    if ((user as any).is_banned) {
      return NextResponse.json(
        { error: "Your account has been suspended. Contact contact@qyantra.online" },
        { status: 403 }
      )
    }

    // ── 7. Check email verified (if you have this field) ────────────────
    if ((user as any).is_email_verified === false) {
      return NextResponse.json(
        { error: "Please verify your email before logging in. Check your inbox." },
        { status: 403 }
      )
    }

    // ── 8. Create session ───────────────────────────────────────────────
    await createSession({
      userId: user.id,
      email: user.email,
      isAdmin: user.is_admin ?? false,
    })

    // ── 9. Determine safe redirect ──────────────────────────────────────
    const redirectTo = getSafeRedirect(
      typeof redirect === "string" ? redirect : null
    )

    // ── 10. Return success with redirect ────────────────────────────────
    return NextResponse.json(
      {
        success: true,
        redirectTo,
        user: {
          id: user.id,
          email: user.email,
          isAdmin: user.is_admin ?? false,
        },
      },
      {
        status: 200,
        headers: {
          // Prevent login response from being cached anywhere
          "Cache-Control": "no-store, no-cache, must-revalidate",
          "Pragma": "no-cache",
        },
      }
    )

  } catch (error) {
    console.error("[auth/login] Unhandled error:", error)
    return NextResponse.json(
      { error: "An error occurred during login. Please try again." },
      { status: 500 }
    )
  }
}