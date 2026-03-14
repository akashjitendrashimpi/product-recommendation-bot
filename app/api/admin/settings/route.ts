import { NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/auth/session"
import { supabaseAdmin } from "@/lib/supabase/client"

export async function GET() {
  try {
    const session = await getSession()
    if (!session || !session.isAdmin)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { data, error } = await (supabaseAdmin as any)
      .from("settings")
      .select("*")
      .order("key")

    if (error) throw error
    return NextResponse.json({ settings: data || [] })
  } catch (error) {
    console.error("Error fetching settings:", error)
    return NextResponse.json({ error: "Failed to fetch settings" }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session || !session.isAdmin)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { key, value } = await request.json()
    if (!key || value === undefined)
      return NextResponse.json({ error: "Key and value required" }, { status: 400 })

    const { error } = await (supabaseAdmin as any)
      .from("settings")
      .upsert({ key, value: String(value), updated_at: new Date().toISOString() })
      .eq("key", key)

    if (error) throw error
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error updating setting:", error)
    return NextResponse.json({ error: "Failed to update setting" }, { status: 500 })
  }
}