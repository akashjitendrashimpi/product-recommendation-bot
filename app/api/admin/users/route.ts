import { NextResponse } from "next/server"
import { getSession } from "@/lib/auth/session"
import { supabaseAdmin } from "@/lib/supabase/client"

export async function GET() {
  try {
    const session = await getSession()
    if (!session || !session.isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data, error } = await (supabaseAdmin as any)
      .from('users')
      .select('id, email, display_name, is_admin, upi_id, created_at, phone')
      .order('created_at', { ascending: false })

    if (error) throw error

    return NextResponse.json({ users: data || [] })
  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 })
  }
}