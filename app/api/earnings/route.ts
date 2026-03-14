import { NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/auth/session"
import { getUserEarningsSummary, getUserMonthlyEarnings } from "@/lib/db/earnings"
import { getUserPendingPaymentTotal, getUserCompletedPaymentTotal } from "@/lib/db/payments"
import { supabaseAdmin } from "@/lib/supabase/client"

export async function GET(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const url = new URL(request.url)
    const month = url.searchParams.get("month")
    const year = url.searchParams.get("year")

    if (month && year) {
      const monthlyEarnings = await getUserMonthlyEarnings(
        session.userId,
        parseInt(year, 10),
        parseInt(month, 10)
      )
      return NextResponse.json({ earnings: monthlyEarnings })
    }

    // ── FIX: removed .limit(20) so rejected completions are never silently dropped ──
    // Without all completions, isTaskRetryable() in the frontend would never fire
    const { data: completions } = await (supabaseAdmin as any)
      .from("task_completions")
      .select("*")
      .eq("user_id", session.userId)
      .order("created_at", { ascending: false })

    const completionList = completions || []

    // Fetch tasks separately — only for tasks that still exist
    const taskIds = [...new Set(completionList.map((c: any) => c.task_id))]
    let taskMap: Record<number, any> = {}
    if (taskIds.length > 0) {
      const { data: tasks } = await (supabaseAdmin as any)
        .from("tasks")
        .select("id, title, app_name, app_icon_url, action_type, user_payout, requires_proof, proof_instructions")
        .in("id", taskIds)
      ;(tasks || []).forEach((t: any) => { taskMap[t.id] = t })
    }

    // Merge — if task deleted, fall back gracefully
    const enrichedCompletions = completionList.map((c: any) => ({
      ...c,
      task_title: taskMap[c.task_id]?.title || c.task_title || "Task (removed)",
      app_name: taskMap[c.task_id]?.app_name || null,
      app_icon_url: taskMap[c.task_id]?.app_icon_url || null,
      action_type: taskMap[c.task_id]?.action_type || "other",
      requires_proof: taskMap[c.task_id]?.requires_proof ?? false,
      proof_instructions: taskMap[c.task_id]?.proof_instructions || null,
      user_payout: c.user_payout || taskMap[c.task_id]?.user_payout || 0,
      task_deleted: !taskMap[c.task_id],
    }))

    const [summary, completedPayouts, pendingPayouts] = await Promise.all([
      getUserEarningsSummary(session.userId),
      getUserCompletedPaymentTotal(session.userId),
      getUserPendingPaymentTotal(session.userId),
    ])

    const totalEarnings = Number(summary.totalEarnings || 0)
    const availableBalance = Math.max(0, totalEarnings - completedPayouts - pendingPayouts)

    return NextResponse.json({
      summary: {
        ...summary,
        totalEarnings,
        availableBalance,
        pendingEarnings: availableBalance,
        paidEarnings: completedPayouts,
        pendingPayouts,
      },
      recentCompletions: enrichedCompletions,
    })
  } catch (error) {
    console.error("Error fetching earnings:", error)
    return NextResponse.json({ error: "Failed to fetch earnings" }, { status: 500 })
  }
}