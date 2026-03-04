import { NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/auth/session"
import { supabaseAdmin } from "@/lib/supabase/client"

export async function GET() {
  try {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { data: user } = await (supabaseAdmin as any)
      .from("users")
      .select("referral_code, referral_earnings")
      .eq("id", session.userId)
      .single()

    // Get people who used this referral code
    const { data: referrals } = await (supabaseAdmin as any)
      .from("users")
      .select("id, display_name, email, created_at")
      .eq("referred_by", session.userId)
      .order("created_at", { ascending: false })

    return NextResponse.json({
      referral_code: user?.referral_code,
      referral_earnings: user?.referral_earnings || 0,
      referrals: referrals || [],
      total_referrals: referrals?.length || 0
    })
  } catch (error) {
    console.error("Error fetching referral:", error)
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 })
  }
}