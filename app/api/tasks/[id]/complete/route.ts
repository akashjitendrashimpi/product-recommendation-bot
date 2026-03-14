import { NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/auth/session"
import { supabaseAdmin } from "@/lib/supabase/client"

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { id } = await params
    const taskId = parseInt(id)

    // Security: validate taskId is a valid number
    if (isNaN(taskId) || taskId <= 0)
      return NextResponse.json({ error: "Invalid task ID" }, { status: 400 })

    // Fetch task — must be active
    const { data: task } = await (supabaseAdmin as any)
      .from("tasks")
      .select("*")
      .eq("id", taskId)
      .eq("is_active", true)
      .single()

    if (!task) return NextResponse.json({ error: "Task not found or inactive" }, { status: 404 })

    // Security: check task is not expired
    if (task.expires_at && new Date(task.expires_at) < new Date())
      return NextResponse.json({ error: "This task has expired" }, { status: 400 })

    // Check max_completions limit — rejected completions don't occupy slots
    if (task.max_completions) {
      const { count } = await (supabaseAdmin as any)
        .from("task_completions")
        .select("id", { count: "exact", head: true })
        .eq("task_id", taskId)
        .neq("status", "rejected")

      if ((count || 0) >= Number(task.max_completions))
        return NextResponse.json({ error: "This task has reached its maximum completions limit" }, { status: 400 })
    }

    // Check already completed — rejected completions allow retry
    const { data: existing } = await (supabaseAdmin as any)
      .from("task_completions")
      .select("id")
      .eq("task_id", taskId)
      .eq("user_id", session.userId)
      .neq("status", "rejected")
      .maybeSingle()

    if (existing) return NextResponse.json({ error: "Task already completed" }, { status: 400 })

    const requiresProof = task.requires_proof === true
    const payout = Number(task.user_payout) > 0 ? Number(task.user_payout) : Number(task.reward || 0)

    // Security: payout must be positive
    if (payout <= 0)
      return NextResponse.json({ error: "Invalid task payout" }, { status: 400 })

    // With proof → pending_verification (user uploads screenshot, admin approves → earnings credited)
    // No proof → verified immediately → earnings credited to balance right away
    const initialStatus = requiresProof ? "pending_verification" : "verified"

    const { data: completion, error } = await (supabaseAdmin as any)
      .from("task_completions")
      .insert({
        task_id: taskId,
        user_id: session.userId,
        status: initialStatus,
        user_payout: payout,
        network_payout: Number(task.network_payout || 0),
        completed_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) throw error

    // Option B: No proof tasks → credit earnings to balance immediately
    // User then requests a single payout when balance is enough
    // NO separate payment record created per task
    if (!requiresProof) {
      const today = new Date().toISOString().split("T")[0]

      const { data: earn } = await (supabaseAdmin as any)
        .from("user_earnings")
        .select("id, daily_earnings, tasks_completed")
        .eq("user_id", session.userId)
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
            user_id: session.userId,
            date: today,
            daily_earnings: payout,
            tasks_completed: 1,
            amount: payout,
          })
      }
    }

    return NextResponse.json({ success: true, completion, requiresProof, payout })
  } catch (error) {
    console.error("Error completing task:", error)
    return NextResponse.json({ error: "Failed to complete task" }, { status: 500 })
  }
}