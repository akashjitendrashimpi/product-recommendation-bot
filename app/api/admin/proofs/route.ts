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
      (supabaseAdmin as any).from("users").select("id, email, display_name").in("id", userIds),
      (supabaseAdmin as any).from("tasks").select("id, title, user_payout, requires_proof").in("id", taskIds),
    ])

    const userMap = Object.fromEntries((usersRes.data || []).map((u: any) => [u.id, u]))
    const taskMap = Object.fromEntries((tasksRes.data || []).map((t: any) => [t.id, t]))

    const completions = (data || []).map((c: any) => ({
      ...c,
      user_email: userMap[c.user_id]?.email || null,
      user_name: userMap[c.user_id]?.display_name || null,
      task_title: taskMap[c.task_id]?.title || null,
      user_payout: c.payout || c.user_payout || taskMap[c.task_id]?.user_payout || 0,
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

    const { completion_id, action } = await request.json()
    if (!["approve", "reject"].includes(action))
      return NextResponse.json({ error: "Invalid action" }, { status: 400 })

    const newStatus = action === "approve" ? "verified" : "rejected"

    const { data: completion, error: fetchError } = await (supabaseAdmin as any)
      .from("task_completions")
      .select("*")
      .eq("id", completion_id)
      .single()

    if (fetchError || !completion)
      return NextResponse.json({ error: "Completion not found" }, { status: 404 })

    const { data: task } = await (supabaseAdmin as any)
      .from("tasks")
      .select("id, title, user_payout, reward")
      .eq("id", completion.task_id)
      .single()

    await (supabaseAdmin as any)
      .from("task_completions")
      .update({ status: newStatus, verified_at: action === "approve" ? new Date().toISOString() : null, updated_at: new Date().toISOString() })
      .eq("id", completion_id)

    if (action === "approve") {
      const payout = Number(completion.payout || completion.user_payout || task?.user_payout || task?.reward || 0)
      const userId = completion.user_id
      const today = new Date().toISOString().split("T")[0]

      const { data: earn } = await (supabaseAdmin as any)
        .from("user_earnings").select("id, daily_earnings, tasks_completed")
        .eq("user_id", userId).eq("date", today).maybeSingle()

      if (earn) {
        await (supabaseAdmin as any).from("user_earnings")
          .update({ daily_earnings: Number(earn.daily_earnings) + payout, tasks_completed: Number(earn.tasks_completed) + 1, amount: Number(earn.daily_earnings) + payout })
          .eq("id", earn.id)
      } else {
        await (supabaseAdmin as any).from("user_earnings")
          .insert({ user_id: userId, date: today, daily_earnings: payout, tasks_completed: 1, amount: payout })
      }

      const { data: user } = await (supabaseAdmin as any)
        .from("users").select("upi_id").eq("id", userId).single()

      const { data: existingPayment } = await (supabaseAdmin as any)
        .from("payments").select("id").eq("completion_id", completion_id).maybeSingle()

      if (!existingPayment) {
        const { error: paymentError } = await (supabaseAdmin as any).from("payments").insert({
          user_id: userId,
          amount: payout,
          upi_id: user?.upi_id || "NOT_SET",
          status: "pending",
          completion_id: completion_id,
          description: "Task: " + (task?.title || "Task"),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        if (paymentError) console.error("Payment insert error:", paymentError)
      }
    }

    return NextResponse.json({ success: true, status: newStatus })
  } catch (error) {
    console.error("Error updating proof:", error)
    return NextResponse.json({ error: "Failed to update" }, { status: 500 })
  }
}
