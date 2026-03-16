import { NextRequest, NextResponse } from "next/server"
import { verifyUser } from "@/lib/db/users"
import { rateLimit } from "@/lib/security/rate-limit"
import { createSession } from "@/lib/auth/session"

export async function POST(request: NextRequest) {
  try {
    const rateLimitResponse = rateLimit(request, 5, 60000)
    if (rateLimitResponse) return rateLimitResponse

    const { email, password } = await request.json()

    if (!email || !password)
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 })

    const user = await verifyUser(email, password)
    if (!user)
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 })

    // Block banned users from logging in
    if ((user as any).is_banned)
      return NextResponse.json({ error: "Your account has been suspended. Contact support@qyantra.com" }, { status: 403 })

    await createSession({
      userId: user.id,
      email: user.email,
      isAdmin: user.is_admin,
    })

    return NextResponse.json({ success: true, user: { id: user.id, email: user.email } })

  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json({ error: "An error occurred during login" }, { status: 500 })
  }
}