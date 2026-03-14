import { NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/auth/session"
import { supabaseAdmin } from "@/lib/supabase/client"

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession()
    if (!session || !session.isAdmin)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { id } = await params
    const { status, transaction_id } = await request.json()

    if (!["completed", "rejected"].includes(status))
      return NextResponse.json({ error: "Invalid status" }, { status: 400 })

    // Fetch payment to get user_id, amount, completion_id
    const { data: payment, error: fetchError } = await (supabaseAdmin as any)
      .from("payments")
      .select("*")
      .eq("id", parseInt(id))
      .single()

    if (fetchError || !payment)
      return NextResponse.json({ error: "Payment not found" }, { status: 404 })

    // Update payment status
    const { error } = await (supabaseAdmin as any)
      .from("payments")
      .update({
        status,
        transaction_id: transaction_id || null,
        updated_at: new Date().toISOString(),
        paid_at: status === "completed" ? new Date().toISOString() : null,
      })
      .eq("id", parseInt(id))

    if (error) throw error

    if (status === "completed") {
      // Mark the task_completion as verified
      if (payment.completion_id) {
        await (supabaseAdmin as any)
          .from("task_completions")
          .update({
            status: "verified",
            verified_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq("id", payment.completion_id)
      }

      // Credit user earnings
      const payout = Number(payment.amount)
      const userId = payment.user_id
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

    } else if (status === "rejected") {
      // Mark the task_completion as rejected too
      if (payment.completion_id) {
        await (supabaseAdmin as any)
          .from("task_completions")
          .update({
            status: "rejected",
            updated_at: new Date().toISOString(),
          })
          .eq("id", payment.completion_id)
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error updating payment:", error)
    return NextResponse.json({ error: "Failed to update payment" }, { status: 500 })
  }
}