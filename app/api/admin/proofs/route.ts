import { NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/auth/session"
import { supabaseAdmin } from "@/lib/supabase/client"

export async function GET(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session || !session.isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

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
      (supabaseAdmin as any).from("tasks").select("id, title, user_payout").in("id", taskIds),
    ])

    const userMap = Object.fromEntries((usersRes.data || []).map((u: any) => [u.id, u]))
    const taskMap = Object.fromEntries((tasksRes.data || []).map((t: any) => [t.id, t]))

    const completions = (data || []).map((c: any) => ({
      ...c,
      user_email: userMap[c.user_id]?.email || null,
      user_name: userMap[c.user_id]?.display_name || null,
      task_title: taskMap[c.task_id]?.title || null,
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
    if (!session || !session.isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { completion_id, action } = await request.json()

    if (!["approve", "reject"].includes(action)) {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 })
    }

    const newStatus = action === "approve" ? "verified" : "rejected"

    const { error } = await (supabaseAdmin as any)
      .from("task_completions")
      .update({
        status: newStatus,
        verified_at: action === "approve" ? new Date().toISOString() : null,
        updated_at: new Date().toISOString()
      })
      .eq("id", completion_id)

    if (error) throw error

    return NextResponse.json({ success: true, status: newStatus })
  } catch (error) {
    console.error("Error updating proof:", error)
    return NextResponse.json({ error: "Failed to update" }, { status: 500 })
  }
}