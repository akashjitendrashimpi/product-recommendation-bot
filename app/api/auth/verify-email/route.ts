import { NextRequest, NextResponse } from "next/server"
import { verifyEmailToken } from "@/lib/db/email-tokens"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get("token")

    if (!token) {
      return NextResponse.json(
        { error: "Verification token is required" },
        { status: 400 }
      )
    }

    const userId = await verifyEmailToken(token)

    if (!userId) {
      return NextResponse.json(
        { error: "Invalid or expired verification token" },
        { status: 400 }
      )
    }

    // Redirect to login with success message
    const url = new URL("/auth/login", request.url)
    url.searchParams.set("verified", "true")
    
    return NextResponse.redirect(url)
  } catch (error) {
    console.error("Email verification error:", error)
    return NextResponse.json(
      { error: "An error occurred during email verification" },
      { status: 500 }
    )
  }
}
