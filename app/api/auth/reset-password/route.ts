import { NextRequest, NextResponse } from "next/server"
import { verifyPasswordResetToken, clearPasswordResetToken } from "@/lib/db/email-tokens"
import { updateUserPassword } from "@/lib/db/users"
import { hashPassword } from "@/lib/auth/password"

export async function POST(request: NextRequest) {
  try {
    const { token, password } = await request.json()

    if (!token || !password) {
      return NextResponse.json(
        { error: "Token and password are required" },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters" },
        { status: 400 }
      )
    }

    // Verify token
    const userId = await verifyPasswordResetToken(token)

    if (!userId) {
      return NextResponse.json(
        { error: "Invalid or expired reset token" },
        { status: 400 }
      )
    }

    // Update password
    const passwordHash = await hashPassword(password)
    await updateUserPassword(userId, passwordHash)

    // Clear reset token
    await clearPasswordResetToken(userId)

    return NextResponse.json({
      success: true,
      message: "Password has been reset successfully",
    })
  } catch (error) {
    console.error("Reset password error:", error)
    return NextResponse.json(
      { error: "An error occurred during password reset" },
      { status: 500 }
    )
  }
}
