import { NextResponse } from "next/server"
import { getSession } from "@/lib/auth/session"
import { getUserById } from "@/lib/db/users"
import { supabaseAdmin } from "@/lib/supabase/client"

export const dynamic = "force-dynamic"

export async function GET() {
  // ── Auth: admin only ────────────────────────────────────────────────────────
  const session = await getSession()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const user = await getUserById(session.userId)
  if (!user || !user.is_admin)
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  try {
    // ── Batch all queries in parallel ──────────────────────────────────────────
    const [
      usersRes,
      paidOutRes,
      pendingProofsRes,
      pendingPaymentsRes,
      dailySignupsRes,
      taskCompletionsRes,
      topEarnersRes,
    ] = await Promise.all([
      // 1. Total users
      (supabaseAdmin as any).from("users").select("id", { count: "exact", head: true }),

      // 2. Total paid out
      (supabaseAdmin as any)
        .from("payments")
        .select("amount")
        .eq("status", "completed"),

      // 3. Pending proofs
      (supabaseAdmin as any)
        .from("task_completions")
        .select("id", { count: "exact", head: true })
        .eq("status", "pending_verification"),

      // 4. Pending payments
      (supabaseAdmin as any)
        .from("payments")
        .select("id", { count: "exact", head: true })
        .eq("status", "pending"),

      // 5. Daily signups — last 30 days
      (supabaseAdmin as any)
        .from("users")
        .select("created_at")
        .gte("created_at", new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()),

      // 6. Task completions for completion rate
      (supabaseAdmin as any)
        .from("task_completions")
        .select("task_id, status")
        .in("status", ["pending_verification", "verified", "payment_completed", "rejected"]),

      // 7. Top earners — users with highest balance
      (supabaseAdmin as any)
        .from("users")
        .select("id, display_name, email, balance")
        .order("balance", { ascending: false })
        .limit(10),
    ])

    // ── Process total paid out ─────────────────────────────────────────────────
    const totalPaidOut = (paidOutRes.data || []).reduce(
      (sum: number, p: { amount: number }) => sum + Number(p.amount || 0),
      0
    )

    // ── Process daily signups ──────────────────────────────────────────────────
    const signupsByDate: Record<string, number> = {}
    const now = Date.now()
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now - i * 24 * 60 * 60 * 1000)
      signupsByDate[d.toISOString().slice(0, 10)] = 0
    }
    for (const u of dailySignupsRes.data || []) {
      const day = u.created_at?.slice(0, 10)
      if (day && day in signupsByDate) signupsByDate[day]++
    }
    const dailySignups = Object.entries(signupsByDate).map(([date, count]) => ({ date, count }))

    // ── Process task completion rates ──────────────────────────────────────────
    const taskMap: Record<string, { total: number; successful: number }> = {}
    for (const tc of taskCompletionsRes.data || []) {
      if (!taskMap[tc.task_id]) taskMap[tc.task_id] = { total: 0, successful: 0 }
      taskMap[tc.task_id].total++
      if (tc.status !== "rejected") taskMap[tc.task_id].successful++
    }
    const taskCompletionRates = Object.entries(taskMap).map(([taskId, { total, successful }]) => ({
      taskId: Number(taskId),
      total,
      successful,
      rate: total > 0 ? Math.round((successful / total) * 100) : 0,
    }))

    // ── Process top earners — mask to first name + last initial ────────────────
    const topEarners = (topEarnersRes.data || []).map((u: any) => {
      const name = u.display_name || u.email?.split("@")[0] || "User"
      const masked = name.length > 2 ? name[0].toUpperCase() + name.slice(1, 2) + "***" : name
      return { id: u.id, name: masked, balance: Number(u.balance || 0) }
    })

    const payload = {
      totalUsers: usersRes.count ?? 0,
      totalPaidOut,
      pendingProofs: pendingProofsRes.count ?? 0,
      pendingPayments: pendingPaymentsRes.count ?? 0,
      dailySignups,
      taskCompletionRates,
      topEarners,
    }

    return NextResponse.json(payload, {
      headers: {
        // Cache on Vercel Edge for 60s; serve stale for up to 5 min
        "Cache-Control": "s-maxage=60, stale-while-revalidate=300",
      },
    })
  } catch (err) {
    console.error("[analytics]", err)
    return NextResponse.json({ error: "Failed to load analytics" }, { status: 500 })
  }
}
