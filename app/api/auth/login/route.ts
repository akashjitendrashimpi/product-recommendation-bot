import { NextRequest, NextResponse } from "next/server"
import { verifyUser } from "@/lib/db/users"
import { createSession } from "@/lib/auth/session"

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      )
    }

    const user = await verifyUser(email, password)

    if (!user) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      )
    }

    const response = NextResponse.json({ success: true, user: { id: user.id, email: user.email } })

    // Set session cookie
    const sessionValue = encodeURIComponent(
      JSON.stringify({
        userId: user.id,
        email: user.email,
        isAdmin: user.is_admin,
      })
    )

    response.cookies.set("auth_session", sessionValue, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    })

    return response
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json(
      { error: "An error occurred during login" },
      { status: 500 }
    )
  }
}
