import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase/client"

export async function GET() {
  try {
    const { data } = await (supabaseAdmin as any)
      .from("settings")
      .select("key, value")

    const map: Record<string, string> = {}
    ;(data || []).forEach((s: any) => { map[s.key] = s.value })

    return NextResponse.json({
      min_payout: Number(map.min_payout || 50),
      max_payout: Number(map.max_payout || 5000),
      max_daily_payout: Number(map.max_daily_payout || 10000),
    })
  } catch {
    return NextResponse.json({ min_payout: 50, max_payout: 5000, max_daily_payout: 10000 })
  }
}