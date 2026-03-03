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
      .from('task_completions')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error

    // Get user emails separately
    const userIds = [...new Set((data || []).map((c: any) => c.user_id))]
    const { data: users } = await (supabaseAdmin as any)
      .from('users')
      .select('id, email')
      .in('id', userIds)

    const userMap = Object.fromEntries((users || []).map((u: any) => [u.id, u.email]))

    const completions = (data || []).map((c: any) => ({
      ...c,
      user_email: userMap[c.user_id] || null,
    }))

    return NextResponse.json({ completions })
  } catch (error) {
    console.error('Error fetching completions:', error)
    return NextResponse.json({ error: 'Failed to fetch completions' }, { status: 500 })
  }
}