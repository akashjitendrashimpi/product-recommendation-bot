import { NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/auth/session"
import { supabaseAdmin } from "@/lib/supabase/client"

export async function GET(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session || !session.isAdmin)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { data, error } = await (supabaseAdmin as any)
      .from("payments")
      .select("*")
      .order("created_at", { ascending: false })

    if (error) throw error

    const userIds = [...new Set((data || []).map((p: any) => p.user_id))]
    const completionIds = (data || []).map((p: any) => p.completion_id).filter(Boolean)

    const [usersRes, completionsRes] = await Promise.all([
      userIds.length > 0
        ? (supabaseAdmin as any).from("users").select("id, email, display_name, upi_id").in("id", userIds)
        : { data: [] },
      completionIds.length > 0
        ? (supabaseAdmin as any).from("task_completions").select("id, task_id, tasks(title)").in("id", completionIds)
        : { data: [] },
    ])

    const userMap = Object.fromEntries((usersRes.data || []).map((u: any) => [u.id, u]))
    const completionMap = Object.fromEntries((completionsRes.data || []).map((c: any) => [c.id, c]))

    const payments = (data || []).map((p: any) => ({
      ...p,
      user_email: userMap[p.user_id]?.email || null,
      user_name: userMap[p.user_id]?.display_name || null,
      task_title: completionMap[p.completion_id]?.tasks?.title || p.description || null,
    }))

    return NextResponse.json({ payments })
  } catch (error) {
    console.error("Error fetching payments:", error)
    return NextResponse.json({ error: "Failed to fetch payments" }, { status: 500 })
  }
}
