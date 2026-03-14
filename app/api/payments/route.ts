import { NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/auth/session"
import { getUserPayments, createPayment, getUserPendingPaymentTotal, getUserCompletedPaymentTotal } from "@/lib/db/payments"
import { getUserById } from "@/lib/db/users"
import { getUserEarningsSummary } from "@/lib/db/earnings"
import { supabaseAdmin } from "@/lib/supabase/client"

function isValidUpiId(upiId: string): boolean {
  const upiRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9]+$/
  return upiRegex.test(upiId)
}

async function getSettings() {
  try {
    const { data } = await (supabaseAdmin as any).from("settings").select("key, value")
    const map: Record<string, number> = {}
    ;(data || []).forEach((s: any) => { map[s.key] = Number(s.value) })
    return {
      min_payout: map.min_payout || 50,
      max_payout: map.max_payout || 5000,
      max_daily_payout: map.max_daily_payout || 10000,
    }
  } catch {
    return { min_payout: 50, max_payout: 5000, max_daily_payout: 10000 }
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const payments = await getUserPayments(session.userId)
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
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { min_payout, max_payout, max_daily_payout } = await getSettings()
    const body = await request.json()
    const amount = Number(body.amount)

    if (!amount || isNaN(amount))
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 })
    if (amount < min_payout)
      return NextResponse.json({ error: `Minimum payout is ₹${min_payout}` }, { status: 400 })
    if (amount > max_payout)
      return NextResponse.json({ error: `Maximum payout per request is ₹${max_payout}` }, { status: 400 })

    const user = await getUserById(session.userId)
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 })
    if (!user.upi_id)
      return NextResponse.json({ error: "UPI ID required. Please update your profile first." }, { status: 400 })
    if (!isValidUpiId(user.upi_id))
      return NextResponse.json({ error: "Invalid UPI ID format. Please update your profile." }, { status: 400 })

    const earnings = await getUserEarningsSummary(session.userId)
    const totalEarnings = Number(earnings.totalEarnings || 0)
    const completedPayouts = await getUserCompletedPaymentTotal(session.userId)
    const pendingPayouts = await getUserPendingPaymentTotal(session.userId)
    const availableBalance = totalEarnings - completedPayouts - pendingPayouts

    if (amount > availableBalance)
      return NextResponse.json({ error: `Insufficient balance. Available: ₹${availableBalance.toFixed(2)}` }, { status: 400 })
    if (pendingPayouts + amount > max_daily_payout)
      return NextResponse.json({ error: `Daily payout limit of ₹${max_daily_payout} exceeded` }, { status: 400 })

    const payment = await createPayment({ user_id: session.userId, amount, upi_id: user.upi_id })

    return NextResponse.json({
      payment,
      message: "Payout request submitted. Admin will process it within 24 hours."
    }, { status: 201 })
  } catch (error) {
    console.error("Error creating payment:", error)
    return NextResponse.json({ error: "Failed to create payment request" }, { status: 500 })
  }
}