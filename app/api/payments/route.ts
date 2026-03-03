import { NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/auth/session"
import { getUserPayments, createPayment, getUserPendingPaymentTotal, getUserCompletedPaymentTotal } from "@/lib/db/payments"
import { getUserById } from "@/lib/db/users"
import { getUserEarningsSummary } from "@/lib/db/earnings"

// Minimum and maximum payout limits
const MIN_PAYOUT = 50    // ₹50 minimum
const MAX_PAYOUT = 5000  // ₹5000 maximum per request
const MAX_DAILY_PAYOUT = 10000 // ₹10000 per day

// Validate UPI ID format
function isValidUpiId(upiId: string): boolean {
  const upiRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9]+$/
  return upiRegex.test(upiId)
}

export async function GET(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const payments = await getUserPayments(session.userId)

    // Get earnings summary for available balance
    const earnings = await getUserEarningsSummary(session.userId)
    const totalEarnings = Number(earnings.totalEarnings || 0)
    const completedPayouts = await getUserCompletedPaymentTotal(session.userId)
    const pendingPayouts = await getUserPendingPaymentTotal(session.userId)
    const availableBalance = totalEarnings - completedPayouts - pendingPayouts

    return NextResponse.json({
      payments,
      summary: {
        totalEarnings,
        completedPayouts,
        pendingPayouts,
        availableBalance: Math.max(0, availableBalance),
      }
    })
  } catch (error) {
    console.error("Error fetching payments:", error)
    return NextResponse.json({ error: "Failed to fetch payments" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const amount = Number(body.amount)

    // Validate amount
    if (!amount || isNaN(amount)) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 })
    }
    if (amount < MIN_PAYOUT) {
      return NextResponse.json(
        { error: `Minimum payout is ₹${MIN_PAYOUT}` },
        { status: 400 }
      )
    }
    if (amount > MAX_PAYOUT) {
      return NextResponse.json(
        { error: `Maximum payout per request is ₹${MAX_PAYOUT}` },
        { status: 400 }
      )
    }

    // Get user to check UPI ID
    const user = await getUserById(session.userId)
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    if (!user.upi_id) {
      return NextResponse.json(
        { error: "UPI ID required. Please update your profile first." },
        { status: 400 }
      )
    }

    // Validate UPI ID format
    if (!isValidUpiId(user.upi_id)) {
      return NextResponse.json(
        { error: "Invalid UPI ID format. Please update your profile." },
        { status: 400 }
      )
    }

    // Check available balance
    const earnings = await getUserEarningsSummary(session.userId)
    const totalEarnings = Number(earnings.totalEarnings || 0)
    const completedPayouts = await getUserCompletedPaymentTotal(session.userId)
    const pendingPayouts = await getUserPendingPaymentTotal(session.userId)
    const availableBalance = totalEarnings - completedPayouts - pendingPayouts

    if (amount > availableBalance) {
      return NextResponse.json(
        { error: `Insufficient balance. Available: ₹${availableBalance.toFixed(2)}` },
        { status: 400 }
      )
    }

    // Check daily payout limit
    if (pendingPayouts + amount > MAX_DAILY_PAYOUT) {
      return NextResponse.json(
        { error: `Daily payout limit of ₹${MAX_DAILY_PAYOUT} exceeded` },
        { status: 400 }
      )
    }

    // Create payment request (pending admin approval)
    const payment = await createPayment({
      user_id: session.userId,
      amount,
      upi_id: user.upi_id,
    })

    return NextResponse.json({
      payment,
      message: "Payout request submitted. Admin will process it within 24 hours."
    }, { status: 201 })

  } catch (error) {
    console.error("Error creating payment:", error)
    return NextResponse.json({ error: "Failed to create payment request" }, { status: 500 })
  }
}