import { NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/auth/session"
import { rateLimit } from "@/lib/security/rate-limit"
import {
  getUserPayments,
  createPayment,
  getUserPendingPaymentTotal,
  getUserCompletedPaymentTotal,
} from "@/lib/db/payments"
import { getUserById } from "@/lib/db/users"
import { getUserEarningsSummary } from "@/lib/db/earnings"
import { supabaseAdmin } from "@/lib/supabase/client"
import { validateUpiId, validateAmount, validateId } from "@/lib/security/validation"

// ── Settings cache ────────────────────────────────────────────────────────
let settingsCache: {
  min_payout: number
  max_payout: number
  max_daily_payout: number
  max_pending_requests: number
} | null = null
let settingsCachedAt = 0
const SETTINGS_TTL = 60_000 // 1 minute cache

async function getSettings() {
  const now = Date.now()
  if (settingsCache && now - settingsCachedAt < SETTINGS_TTL) {
    return settingsCache
  }

  try {
    const { data } = await (supabaseAdmin as any)
      .from("settings")
      .select("key, value")

    const map: Record<string, number> = {}
    ;(data || []).forEach((s: any) => {
      map[s.key] = Number(s.value)
    })

    settingsCache = {
      min_payout: map.min_payout || 50,
      max_payout: map.max_payout || 5000,
      max_daily_payout: map.max_daily_payout || 10000,
      max_pending_requests: map.max_pending_requests || 3,
    }
    settingsCachedAt = now
    return settingsCache
  } catch {
    return {
      min_payout: 50,
      max_payout: 5000,
      max_daily_payout: 10000,
      max_pending_requests: 3,
    }
  }
}

// ── GET — fetch user payments ─────────────────────────────────────────────
export async function GET(request: NextRequest) {
  try {
    // 1. Auth
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // 2. Rate limit
    const rateLimitRes = rateLimit(request, 20, 60_000)
    if (rateLimitRes) return rateLimitRes

    // 3. Fetch all data in parallel
    const [payments, earnings, completedPayouts, pendingPayouts, settings] =
      await Promise.all([
        getUserPayments(session.userId),
        getUserEarningsSummary(session.userId),
        getUserCompletedPaymentTotal(session.userId),
        getUserPendingPaymentTotal(session.userId),
        getSettings(),
      ])

    const totalEarnings = Math.max(0, Number(earnings.totalEarnings || 0))
    const availableBalance = Math.max(
      0,
      totalEarnings - completedPayouts - pendingPayouts
    )

    return NextResponse.json(
      {
        payments,
        summary: {
          totalEarnings,
          completedPayouts,
          pendingPayouts,
          availableBalance,
        },
        limits: {
          min_payout: settings.min_payout,
          max_payout: settings.max_payout,
          max_daily_payout: settings.max_daily_payout,
        },
      },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate",
        },
      }
    )
  } catch (error) {
    console.error("[payments/GET] Error:", error)
    return NextResponse.json(
      { error: "Failed to fetch payments" },
      { status: 500 }
    )
  }
}

// ── POST — create payout request ──────────────────────────────────────────
export async function POST(request: NextRequest) {
  try {
    // 1. Auth
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // 2. Strict rate limit — max 5 payout requests per minute
    const rateLimitRes = rateLimit(request, 5, 60_000, { keyPrefix: "payout:" })
    if (rateLimitRes) return rateLimitRes

    // 3. Parse body
    let body: unknown
    try {
      body = await request.json()
    } catch {
      return NextResponse.json(
        { error: "Invalid request body" },
        { status: 400 }
      )
    }

    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { error: "Invalid request body" },
        { status: 400 }
      )
    }

    const { amount } = body as Record<string, unknown>

    // 4. Validate amount
    const safeAmount = validateAmount(amount)
    if (!safeAmount) {
      return NextResponse.json(
        { error: "Invalid amount" },
        { status: 400 }
      )
    }

    // 5. Load settings
    const settings = await getSettings()

    if (safeAmount < settings.min_payout) {
      return NextResponse.json(
        { error: `Minimum payout is ₹${settings.min_payout}` },
        { status: 400 }
      )
    }

    if (safeAmount > settings.max_payout) {
      return NextResponse.json(
        { error: `Maximum payout per request is ₹${settings.max_payout}` },
        { status: 400 }
      )
    }

    // 6. Validate user exists
    const user = await getUserById(session.userId)
    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      )
    }

    // 7. Check banned
    if ((user as any).is_banned) {
      return NextResponse.json(
        { error: "Account suspended. Contact contact@qyantra.online" },
        { status: 403 }
      )
    }

    // 8. UPI ID required
    if (!user.upi_id) {
      return NextResponse.json(
        { error: "UPI ID required. Please update your profile first." },
        { status: 400 }
      )
    }

    // 9. Validate UPI format using centralized validator
    if (!validateUpiId(user.upi_id)) {
      return NextResponse.json(
        { error: "Invalid UPI ID format. Please update your profile." },
        { status: 400 }
      )
    }

    // 10. Calculate real balance from DB — never trust client
    const [earnings, completedPayouts, pendingPayouts] = await Promise.all([
      getUserEarningsSummary(session.userId),
      getUserCompletedPaymentTotal(session.userId),
      getUserPendingPaymentTotal(session.userId),
    ])

    const totalEarnings = Math.max(0, Number(earnings.totalEarnings || 0))
    const availableBalance = totalEarnings - completedPayouts - pendingPayouts

    // 11. Check sufficient balance
    if (safeAmount > availableBalance) {
      return NextResponse.json(
        {
          error: `Insufficient balance. Available: ₹${Math.max(0, availableBalance).toFixed(2)}`,
        },
        { status: 400 }
      )
    }

    // 12. Daily payout limit
    if (pendingPayouts + safeAmount > settings.max_daily_payout) {
      const remaining = Math.max(
        0,
        settings.max_daily_payout - pendingPayouts
      ).toFixed(0)
      return NextResponse.json(
        {
          error: `Daily payout limit of ₹${settings.max_daily_payout} exceeded. You have ₹${remaining} remaining.`,
        },
        { status: 400 }
      )
    }

    // 13. Max pending requests limit — prevent request spam
    const { data: pendingRequests } = await (supabaseAdmin as any)
      .from("payments")
      .select("id")
      .eq("user_id", session.userId)
      .in("status", ["pending", "processing"])

    if (
      (pendingRequests || []).length >= settings.max_pending_requests
    ) {
      return NextResponse.json(
        {
          error: `You already have ${settings.max_pending_requests} pending payout requests. Please wait for them to be processed.`,
        },
        { status: 429 }
      )
    }

    // 14. Duplicate request check — same amount in last 60 seconds
    const oneMinuteAgo = new Date(Date.now() - 60_000).toISOString()
    const { data: recentRequest } = await (supabaseAdmin as any)
      .from("payments")
      .select("id")
      .eq("user_id", session.userId)
      .eq("amount", safeAmount)
      .eq("status", "pending")
      .gte("created_at", oneMinuteAgo)
      .maybeSingle()

    if (recentRequest) {
      return NextResponse.json(
        { error: "Duplicate request detected. Please wait before trying again." },
        { status: 429 }
      )
    }

    // 15. Create payment
    const payment = await createPayment({
      user_id: session.userId,
      amount: safeAmount,
      upi_id: user.upi_id.trim().toLowerCase(),
    })

    // 16. Log for audit trail
    console.info(
      `[payments] Payout request created — user:${session.userId} amount:₹${safeAmount}`
    )

    return NextResponse.json(
      {
        payment,
        message:
          "Payout request submitted successfully. Admin will process it within 24 hours.",
      },
      {
        status: 201,
        headers: {
          "Cache-Control": "no-store",
        },
      }
    )
  } catch (error) {
    console.error("[payments/POST] Error:", error)
    return NextResponse.json(
      { error: "Failed to create payout request" },
      { status: 500 }
    )
  }
}