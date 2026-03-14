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
      .from("task_completions").select("id")
      .eq("task_id", taskId).eq("user_id", session.userId)
      .neq("status", "rejected").maybeSingle()
    if (existing) return NextResponse.json({ error: "Task already completed" }, { status: 400 })

    const requiresProof = task.requires_proof === true
const payout = Number(task.user_payout) > 0 ? Number(task.user_payout) : Number(task.reward || 0)

// With proof → pending_verification (user must upload screenshot, then admin approves)
// No proof → pending (admin just needs to pay, no verification needed)
const initialStatus = requiresProof ? "pending_verification" : "pending"

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
      .select().single()

    if (error) throw error

    // No proof needed → create payment record for admin to pay
    // DO NOT credit user_earnings here — credit only when admin marks payment as completed
    if (!requiresProof) {
      const { data: user } = await (supabaseAdmin as any)
        .from("users").select("upi_id").eq("id", session.userId).single()

      await (supabaseAdmin as any).from("payments").insert({
        user_id: session.userId,
        amount: payout,
        upi_id: user?.upi_id || "NOT_SET",
        status: "pending",
        completion_id: completion.id,
        description: "Task: " + (task.title || "Task"),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
    }

    return NextResponse.json({ success: true, completion, requiresProof, payout })
  } catch (error) {
    console.error("Error completing task:", error)
    return NextResponse.json({ error: "Failed to complete task" }, { status: 500 })
  }
}