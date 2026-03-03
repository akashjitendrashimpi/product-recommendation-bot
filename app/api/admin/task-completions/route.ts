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
      .select('*, users(email)')
      .order('created_at', { ascending: false })

    if (error) throw error

    const completions = (data || []).map((c: any) => ({
      ...c,
      user_email: c.users?.email || null,
    }))

    return NextResponse.json({ completions })
  } catch (error) {
    console.error('Error fetching completions:', error)
    return NextResponse.json({ error: 'Failed to fetch completions' }, { status: 500 })
  }
}