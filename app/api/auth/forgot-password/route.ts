import { NextRequest, NextResponse } from "next/server"
import { getUserByEmail } from "@/lib/db/users"
import { createPasswordResetToken } from "@/lib/db/email-tokens"
import { sendPasswordResetEmail } from "@/lib/email/resend"

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      )
    }

    // Check if user exists
    const user = await getUserByEmail(email)
    
    // Always return success (don't reveal if user exists)
    if (user) {
      try {
        const token = await createPasswordResetToken(email)
        if (token) {
          await sendPasswordResetEmail(email, token, user.display_name || undefined)
        }
      } catch (emailError) {
        console.error("Failed to send password reset email:", emailError)
      }
    }

    // Always return success to prevent email enumeration
    return NextResponse.json({
      success: true,
      message: "If an account with that email exists, a password reset link has been sent.",
    })
  } catch (error) {
    console.error("Forgot password error:", error)
    return NextResponse.json(
      { error: "An error occurred" },
      { status: 500 }
    )
  }
}
