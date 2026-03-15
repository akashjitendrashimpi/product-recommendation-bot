import { NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/auth/session"
import { supabaseAdmin } from "@/lib/supabase/client"

// Save or update push subscription
export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { endpoint, p256dh, auth } = await request.json()
    if (!endpoint || !p256dh || !auth) {
      return NextResponse.json({ error: "Invalid subscription data" }, { status: 400 })
    }

    // Upsert subscription
    const { error } = await (supabaseAdmin as any)
      .from("push_subscriptions")
      .upsert({
        user_id: session.userId,
        endpoint,
        p256dh,
        auth,
        updated_at: new Date().toISOString(),
      }, { onConflict: "user_id,endpoint" })

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error saving push subscription:", error)
    return NextResponse.json({ error: "Failed to save subscription" }, { status: 500 })
  }
}

// Delete push subscription (when user disables notifications)
export async function DELETE(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { endpoint } = await request.json()

    await (supabaseAdmin as any)
      .from("push_subscriptions")
      .delete()
      .eq("user_id", session.userId)
      .eq("endpoint", endpoint)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting push subscription:", error)
    return NextResponse.json({ error: "Failed to delete subscription" }, { status: 500 })
  }
}