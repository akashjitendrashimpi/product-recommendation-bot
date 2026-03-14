import { NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/auth/session"
import { supabaseAdmin } from "@/lib/supabase/client"

export async function GET(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session || !session.isAdmin)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { data, error } = await (supabaseAdmin as any)
      .from("task_completions")
      .select("*")
      .eq("status", "pending_verification")
      .order("created_at", { ascending: false })

    if (error) throw error

    const userIds = [...new Set((data || []).map((c: any) => c.user_id))]
    const taskIds = [...new Set((data || []).map((c: any) => c.task_id))]

    const [usersRes, tasksRes] = await Promise.all([
      userIds.length > 0
        ? (supabaseAdmin as any).from("users").select("id, email, display_name").in("id", userIds)
        : { data: [] },
      taskIds.length > 0
        ? (supabaseAdmin as any).from("tasks").select("id, title, user_payout, requires_proof").in("id", taskIds)
        : { data: [] },
    ])

    const userMap = Object.fromEntries((usersRes.data || []).map((u: any) => [u.id, u]))
    const taskMap = Object.fromEntries((tasksRes.data || []).map((t: any) => [t.id, t]))

    const completions = (data || []).map((c: any) => ({
      ...c,
      user_email: userMap[c.user_id]?.email || null,
      user_name: userMap[c.user_id]?.display_name || null,
      task_title: taskMap[c.task_id]?.title || "Task (removed)",
      user_payout: Number(c.user_payout || taskMap[c.task_id]?.user_payout || 0),
    }))

    return NextResponse.json({ completions })
  } catch (error) {
    console.error("Error fetching pending proofs:", error)
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session || !session.isAdmin)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const body = await request.json()
    const { completion_id, action } = body

    // Security: validate inputs
    if (!completion_id || !Number.isInteger(Number(completion_id)))
      return NextResponse.json({ error: "Invalid completion ID" }, { status: 400 })
    if (!["approve", "reject"].includes(action))
      return NextResponse.json({ error: "Invalid action" }, { status: 400 })

    // Fetch completion — must be pending_verification
    const { data: completion, error: fetchError } = await (supabaseAdmin as any)
      .from("task_completions")
      .select("*")
      .eq("id", completion_id)
      .eq("status", "pending_verification") // Security: can only act on pending ones
      .single()

    if (fetchError || !completion)
      return NextResponse.json({ error: "Completion not found or already processed" }, { status: 404 })

    const { data: task } = await (supabaseAdmin as any)
      .from("tasks")
      .select("id, title, user_payout, reward")
      .eq("id", completion.task_id)
      .single()

    const payout = Number(completion.user_payout || task?.user_payout || task?.reward || 0)
    const userId = completion.user_id

    if (action === "approve") {
      // 1. Mark completion as verified
      await (supabaseAdmin as any)
        .from("task_completions")
        .update({
          status: "verified",
          verified_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", completion_id)

      // 2. Option B: Credit earnings to user balance
      // User will request a payout themselves when balance is sufficient
      const today = new Date().toISOString().split("T")[0]

      const { data: earn } = await (supabaseAdmin as any)
        .from("user_earnings")
        .select("id, daily_earnings, tasks_completed")
        .eq("user_id", userId)
        .eq("date", today)
        .maybeSingle()

      if (earn) {
        await (supabaseAdmin as any)
          .from("user_earnings")
          .update({
            daily_earnings: Number(earn.daily_earnings) + payout,
            tasks_completed: Number(earn.tasks_completed) + 1,
            amount: Number(earn.daily_earnings) + payout,
          })
          .eq("id", earn.id)
      } else {
        await (supabaseAdmin as any)
          .from("user_earnings")
          .insert({
            user_id: userId,
            date: today,
            daily_earnings: payout,
            tasks_completed: 1,
            amount: payout,
          })
      }

      // NO payment record created here — user requests payout manually from earnings page

    } else {
      // REJECT — mark completion rejected, slot freed, user can retry
      await (supabaseAdmin as any)
        .from("task_completions")
        .update({
          status: "rejected",
          verified_at: null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", completion_id)
    }

    return NextResponse.json({
      success: true,
      status: action === "approve" ? "verified" : "rejected",
    })
  } catch (error) {
    console.error("Error updating proof:", error)
    return NextResponse.json({ error: "Failed to update" }, { status: 500 })
  }
}