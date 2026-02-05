import { NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/auth/session"
import { getUserPayments, createPayment } from "@/lib/db/payments"
import { getUserById } from "@/lib/db/users"
import { getUserEarningsSummary } from "@/lib/db/earnings"

export async function GET(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const payments = await getUserPayments(session.userId)
    return NextResponse.json({ payments })
  } catch (error) {
    console.error("Error fetching payments:", error)
    return NextResponse.json(
      { error: "Failed to fetch payments" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { amount, payment_date } = await request.json()

    // Get user to check UPI ID
    const user = await getUserById(session.userId)
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    if (!user.upi_id) {
      return NextResponse.json(
        { error: "UPI ID required. Please update your profile." },
        { status: 400 }
      )
    }

    // Get earnings summary to validate amount
    const earnings = await getUserEarningsSummary(session.userId)
    if (amount > earnings.totalEarnings) {
      return NextResponse.json(
        { error: "Amount exceeds available earnings" },
        { status: 400 }
      )
    }

    const payment = await createPayment({
      user_id: session.userId,
      amount,
      upi_id: user.upi_id,
      payment_date: payment_date || new Date().toISOString().split("T")[0],
    })

    return NextResponse.json({ payment }, { status: 201 })
  } catch (error) {
    console.error("Error creating payment:", error)
    return NextResponse.json(
      { error: "Failed to create payment request" },
      { status: 500 }
    )
  }
}
