import { NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/auth/session"
import { supabaseAdmin } from "@/lib/supabase/client"

// Get notifications for current user
export async function GET(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { data: notifications } = await (supabaseAdmin as any)
      .from("notifications")
      .select("*")
      .eq("user_id", session.userId)
      .order("created_at", { ascending: false })
      .limit(50)

    const unreadCount = (notifications || []).filter((n: any) => !n.is_read).length

    return NextResponse.json({
      notifications: notifications || [],
      unreadCount,
    })
  } catch (error) {
    console.error("Error fetching notifications:", error)
    return NextResponse.json({ error: "Failed to fetch notifications" }, { status: 500 })
  }
}

// Mark notification(s) as read
export async function PATCH(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { id, markAllRead } = await request.json()

    if (markAllRead) {
      await (supabaseAdmin as any)
        .from("notifications")
        .update({ is_read: true })
        .eq("user_id", session.userId)
        .eq("is_read", false)
    } else if (id) {
      await (supabaseAdmin as any)
        .from("notifications")
        .update({ is_read: true })
        .eq("id", id)
        .eq("user_id", session.userId)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error marking notification read:", error)
    return NextResponse.json({ error: "Failed to update notification" }, { status: 500 })
  }
}