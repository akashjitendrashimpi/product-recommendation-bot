import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase/client"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = Math.min(50, Math.max(1, Number(searchParams.get("limit") || 20)))

    // 1. Get real, completed payments
    const { data: recentPayments, count } = await (supabaseAdmin as any)
      .from("payments")
      .select(`
        id, 
        amount, 
        created_at,
        user_id,
        users ( email, display_name )
      `, { count: 'exact' })
      .eq("status", "completed")
      .order("created_at", { ascending: false })
      .limit(limit)

    // 2. Threshold check: only show if at least 10 real payouts
    if (!count || count < 10 || !recentPayments || recentPayments.length < 10) {
      return NextResponse.json({ 
        success: true, 
        visible: false, 
        feed: [] 
      })
    }

    // 3. Mask name/email for privacy
    const feed = recentPayments.map((payment: any) => {
      const user = payment.users
      let name = "Someone"
      
      if (user?.display_name) {
        // e.g. "Rahul Sharma" -> "Ra***" or "Rahul"
        const parts = user.display_name.split(' ')
        name = parts[0]
      } else if (user?.email) {
        // e.g. "test@example.com" -> "t***@..."
        const emailParts = user.email.split('@')
        if (emailParts.length === 2) {
          name = emailParts[0].substring(0, 1) + "***"
        }
      }

      return {
        id: payment.id,
        name: name,
        amount: Number(payment.amount),
        timeAgo: getTimeAgo(new Date(payment.created_at))
      }
    })

    return NextResponse.json({
      success: true,
      visible: true,
      feed
    })
  } catch (error) {
    console.error("[activity-feed] Error:", error)
    return NextResponse.json(
      { visible: false, feed: [] },
      { status: 500 }
    )
  }
}

function getTimeAgo(date: Date) {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000)
  let interval = seconds / 31536000
  if (interval > 1) return Math.floor(interval) + "y ago"
  interval = seconds / 2592000
  if (interval > 1) return Math.floor(interval) + "mo ago"
  interval = seconds / 86400
  if (interval > 1) return Math.floor(interval) + "d ago"
  interval = seconds / 3600
  if (interval > 1) return Math.floor(interval) + "h ago"
  interval = seconds / 60
  if (interval > 1) return Math.floor(interval) + "m ago"
  return "Just now"
}
