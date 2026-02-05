import { NextRequest, NextResponse } from "next/server"
import { createUser, getUserByEmail } from "@/lib/db/users"
import { createEmailVerificationToken } from "@/lib/db/email-tokens"
import { sendVerificationEmail } from "@/lib/email/resend"

export async function POST(request: NextRequest) {
  try {
    const { email, password, displayName, phone, upiId } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUser = await getUserByEmail(email)
    if (existingUser) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 400 }
      )
    }

    // Create user
    const user = await createUser({
      email,
      password,
      display_name: displayName || null,
      phone: phone || null,
      upi_id: upiId || null,
      is_admin: false,
    })

    // Create verification token and send email
    try {
      const token = await createEmailVerificationToken(user.id)
      await sendVerificationEmail(email, token, displayName || undefined)
    } catch (emailError) {
      console.error("Failed to send verification email:", emailError)
      // Don't fail signup if email fails, but log it
    }

    return NextResponse.json({
      success: true,
      message: "Account created. Please check your email to verify your email address.",
      user: {
        id: user.id,
        email: user.email,
        display_name: user.display_name,
        phone: user.phone,
        upi_id: user.upi_id,
      },
    })
  } catch (error) {
    console.error("Signup error:", error)
    return NextResponse.json(
      { error: "An error occurred during signup" },
      { status: 500 }
    )
  }
}
