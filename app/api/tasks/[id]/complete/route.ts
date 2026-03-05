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

    const { data: task } = await (supabaseAdmin as any)
      .from("tasks").select("*").eq("id", taskId).single()

    if (!task) return NextResponse.json({ error: "Task not found" }, { status: 404 })

    const { data: existing } = await (supabaseAdmin as any)
      .from("task_completions").select("id")
      .eq("task_id", taskId).eq("user_id", session.userId)
      .neq("status", "rejected").maybeSingle()

    if (existing) return NextResponse.json({ error: "Task already completed" }, { status: 400 })

    const requiresProof = task.requires_proof === true
    const initialStatus = requiresProof ? "pending_verification" : "verified"
    const payout = Number(task.user_payout || task.reward || 0)

    const { data: completion, error } = await (supabaseAdmin as any)
      .from("task_completions")
      .insert({
        task_id: taskId,
        user_id: session.userId,
        status: initialStatus,
        payout: payout,
        user_payout: payout,
        completed_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select().single()

    if (error) throw error

    if (!requiresProof) {
      const today = new Date().toISOString().split("T")[0]
      const { data: earn } = await (supabaseAdmin as any)
        .from("user_earnings").select("id, daily_earnings, tasks_completed")
        .eq("user_id", session.userId).eq("date", today).maybeSingle()

      if (earn) {
        await (supabaseAdmin as any).from("user_earnings")
          .update({
            daily_earnings: Number(earn.daily_earnings) + payout,
            tasks_completed: Number(earn.tasks_completed) + 1,
            amount: Number(earn.daily_earnings) + payout,
          })
          .eq("id", earn.id)
      } else {
        await (supabaseAdmin as any).from("user_earnings")
          .insert({
            user_id: session.userId,
            date: today,
            daily_earnings: payout,
            tasks_completed: 1,
            amount: payout,
          })
      }
    }

    return NextResponse.json({ success: true, completion, requiresProof })
  } catch (error) {
    console.error("Error completing task:", error)
    return NextResponse.json({ error: "Failed to complete task" }, { status: 500 })
  }
}
