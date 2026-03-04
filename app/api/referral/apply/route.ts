import { NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/auth/session"
import { supabaseAdmin } from "@/lib/supabase/client"

const REFERRAL_BONUS_REFERRER = 20  // ₹20 for person who referred
const REFERRAL_BONUS_NEW_USER = 10  // ₹10 for new user

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { referral_code } = await request.json()
    if (!referral_code) return NextResponse.json({ error: "Referral code required" }, { status: 400 })

    // Check if user already used a referral code
    const { data: currentUser } = await (supabaseAdmin as any)
      .from("users")
      .select("id, referred_by, referral_code")
      .eq("id", session.userId)
      .single()

    if (currentUser?.referred_by) {
      return NextResponse.json({ error: "You already used a referral code" }, { status: 400 })
    }

    // Can't use your own code
    if (currentUser?.referral_code === referral_code.toUpperCase()) {
      return NextResponse.json({ error: "You cannot use your own referral code" }, { status: 400 })
    }

    // Find referrer
    const { data: referrer } = await (supabaseAdmin as any)
      .from("users")
      .select("id, email, referral_earnings")
      .eq("referral_code", referral_code.toUpperCase())
      .single()

    if (!referrer) {
      return NextResponse.json({ error: "Invalid referral code" }, { status: 404 })
    }

    // Update current user — set referred_by
    await (supabaseAdmin as any)
      .from("users")
      .update({ referred_by: referrer.id })
      .eq("id", session.userId)

    // Credit referrer bonus
    await (supabaseAdmin as any)
      .from("users")
      .update({ referral_earnings: (Number(referrer.referral_earnings) + REFERRAL_BONUS_REFERRER) })
      .eq("id", referrer.id)

    // Credit new user bonus via user_earnings
    const today = new Date().toISOString().split('T')[0]
    await (supabaseAdmin as any)
      .from("user_earnings")
      .insert({
        user_id: session.userId,
        date: today,
        amount: REFERRAL_BONUS_NEW_USER,
        daily_earnings: REFERRAL_BONUS_NEW_USER,
        tasks_completed: 0,
        earning_type: 'referral',
        description: 'Referral signup bonus'
      })

    return NextResponse.json({
      success: true,
      bonus: REFERRAL_BONUS_NEW_USER,
      message: `Referral applied! You earned ₹${REFERRAL_BONUS_NEW_USER} bonus!`
    })

  } catch (error) {
    console.error("Error applying referral:", error)
    return NextResponse.json({ error: "Failed to apply referral" }, { status: 500 })
  }
}