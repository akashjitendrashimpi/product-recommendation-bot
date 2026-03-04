import { NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/auth/session"
import { supabaseAdmin } from "@/lib/supabase/client"

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const taskId = parseInt(id)

    // Get task details
    const { data: task, error: taskError } = await (supabaseAdmin as any)
      .from("tasks")
      .select("*")
      .eq("id", taskId)
      .single()

    if (taskError || !task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 })
    }

    // Check if already completed
    const { data: existing } = await (supabaseAdmin as any)
      .from("task_completions")
      .select("id, status")
      .eq("task_id", taskId)
      .eq("user_id", session.userId)
      .neq("status", "rejected")
      .single()

    if (existing) {
      return NextResponse.json({ error: "Task already completed" }, { status: 400 })
    }

    // requires_proof logic:
    // If requires_proof is false → status = verified immediately, credit earnings
    // If requires_proof is true → status = pending_verification, wait for admin
    const requiresProof = task.requires_proof !== false

    const initialStatus = requiresProof ? "pending_verification" : "verified"

    // Create completion record
    const { data: completion, error: completionError } = await (supabaseAdmin as any)
      .from("task_completions")
      .insert({
        task_id: taskId,
        user_id: session.userId,
        status: initialStatus,
        payout: task.user_payout,
        completed_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (completionError) throw completionError

    // If no proof required → credit earnings immediately
    if (!requiresProof) {
      const today = new Date().toISOString().split("T")[0]

      // Upsert daily earnings
      const { data: existingEarning } = await (supabaseAdmin as any)
        .from("user_earnings")
        .select("id, daily_earnings, tasks_completed")
        .eq("user_id", session.userId)
        .eq("date", today)
        .single()

      if (existingEarning) {
        await (supabaseAdmin as any)
          .from("user_earnings")
          .update({
            daily_earnings: Number(existingEarning.daily_earnings) + Number(task.user_payout),
            tasks_completed: Number(existingEarning.tasks_completed) + 1,
            amount: Number(existingEarning.daily_earnings) + Number(task.user_payout),
          })
          .eq("id", existingEarning.id)
      } else {
        await (supabaseAdmin as any)
          .from("user_earnings")
          .insert({
            user_id: session.userId,
            date: today,
            daily_earnings: Number(task.user_payout),
            tasks_completed: 1,
            amount: Number(task.user_payout),
          })
      }
    }

    return NextResponse.json({
      success: true,
      completion,
      requiresProof,
      message: requiresProof
        ? "Task completed! Upload screenshot to get paid."
        : `Task completed! ₹${Number(task.user_payout).toFixed(2)} will be credited soon.`,
    })
  } catch (error) {
    console.error("Error completing task:", error)
    return NextResponse.json({ error: "Failed to complete task" }, { status: 500 })
  }
}