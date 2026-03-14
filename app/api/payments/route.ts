import { NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/auth/session"
import { getUserPayments, createPayment, getUserPendingPaymentTotal, getUserCompletedPaymentTotal } from "@/lib/db/payments"
import { getUserById } from "@/lib/db/users"
import { getUserEarningsSummary } from "@/lib/db/earnings"
import { supabaseAdmin } from "@/lib/supabase/client"

// Security: validate UPI ID format
function isValidUpiId(upiId: string): boolean {
  const upiRegex = /^[a-zA-Z0-9._-]{3,}@[a-zA-Z]{3,}$/
  return upiRegex.test(upiId.trim())
}

async function getSettings() {
  try {
    const { data } = await (supabaseAdmin as any)
      .from("settings")
      .select("key, value")
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

    // Only return this user's OWN payments — security: never expose other users' data
    const payments = await getUserPayments(session.userId)
    const earnings = await getUserEarningsSummary(session.userId)
    const totalEarnings = Number(earnings.totalEarnings || 0)
    const completedPayouts = await getUserCompletedPaymentTotal(session.userId)
    const pendingPayouts = await getUserPendingPaymentTotal(session.userId)
    const availableBalance = Math.max(0, totalEarnings - completedPayouts - pendingPayouts)

    // Also return current limits so UI can display them correctly
    const settings = await getSettings()

    return NextResponse.json({
      payments,
      summary: {
        totalEarnings,
        completedPayouts,
        pendingPayouts,
        availableBalance,
      },
      limits: settings,
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

    let body: any
    try {
      body = await request.json()
    } catch {
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 })
    }

    const amount = Number(body.amount)

    // Security: validate amount
    if (!amount || isNaN(amount) || amount <= 0)
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 })

    // Round to 2 decimal places to prevent floating point exploits
    const safeAmount = Math.round(amount * 100) / 100

    if (safeAmount < min_payout)
      return NextResponse.json({ error: `Minimum payout is ₹${min_payout}` }, { status: 400 })
    if (safeAmount > max_payout)
      return NextResponse.json({ error: `Maximum payout per request is ₹${max_payout}` }, { status: 400 })

    // Fetch user
    const user = await getUserById(session.userId)
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 })

    // Security: must have UPI ID set
    if (!user.upi_id)
      return NextResponse.json({ error: "UPI ID required. Please update your profile first." }, { status: 400 })

    // Security: validate UPI format
    if (!isValidUpiId(user.upi_id))
      return NextResponse.json({ error: "Invalid UPI ID format. Please update your profile." }, { status: 400 })

    // Calculate real available balance from DB — never trust client-side value
    const earnings = await getUserEarningsSummary(session.userId)
    const totalEarnings = Number(earnings.totalEarnings || 0)
    const completedPayouts = await getUserCompletedPaymentTotal(session.userId)
    const pendingPayouts = await getUserPendingPaymentTotal(session.userId)
    const availableBalance = totalEarnings - completedPayouts - pendingPayouts

    // Security: check sufficient balance
    if (safeAmount > availableBalance)
      return NextResponse.json({
        error: `Insufficient balance. Available: ₹${Math.max(0, availableBalance).toFixed(2)}`
      }, { status: 400 })

    // Security: daily payout limit
    if (pendingPayouts + safeAmount > max_daily_payout)
      return NextResponse.json({
        error: `Daily payout limit of ₹${max_daily_payout} exceeded. You have ₹${(max_daily_payout - pendingPayouts).toFixed(0)} remaining.`
      }, { status: 400 })

    // Security: check no duplicate pending request for same amount in last 60 seconds
    const oneMinuteAgo = new Date(Date.now() - 60000).toISOString()
    const { data: recentRequest } = await (supabaseAdmin as any)
      .from("payments")
      .select("id")
      .eq("user_id", session.userId)
      .eq("amount", safeAmount)
      .eq("status", "pending")
      .gte("created_at", oneMinuteAgo)
      .maybeSingle()

    if (recentRequest)
      return NextResponse.json({
        error: "Duplicate request detected. Please wait before trying again."
      }, { status: 429 })

    const payment = await createPayment({
      user_id: session.userId,
      amount: safeAmount,
      upi_id: user.upi_id,
    })

    return NextResponse.json({
      payment,
      message: "Payout request submitted successfully. Admin will process it within 24 hours.",
    }, { status: 201 })

  } catch (error) {
    console.error("Error creating payment:", error)
    return NextResponse.json({ error: "Failed to create payout request" }, { status: 500 })
  }
}