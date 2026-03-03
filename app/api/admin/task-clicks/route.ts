import { NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/auth/session"
import { supabaseAdmin } from "@/lib/supabase/client"

export async function GET(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session || !session.isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get click stats per task
    const { data, error } = await (supabaseAdmin as any)
      .from('task_clicks')
      .select('task_id, converted, clicked_at')
      .order('clicked_at', { ascending: false })

    if (error) throw error

    // Group by task
    const taskStats: Record<number, { clicks: number, conversions: number }> = {}
    for (const click of data || []) {
      if (!taskStats[click.task_id]) {
        taskStats[click.task_id] = { clicks: 0, conversions: 0 }
      }
      taskStats[click.task_id].clicks++
      if (click.converted) taskStats[click.task_id].conversions++
    }

    return NextResponse.json({
      taskStats,
      totalClicks: data?.length || 0,
      recentClicks: (data || []).slice(0, 50)
    })
  } catch (error) {
    console.error('Error fetching clicks:', error)
    return NextResponse.json({ error: 'Failed to fetch clicks' }, { status: 500 })
  }
}