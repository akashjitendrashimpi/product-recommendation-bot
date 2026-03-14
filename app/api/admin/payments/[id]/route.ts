import { NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/auth/session"
import { supabaseAdmin } from "@/lib/supabase/client"

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession()
    if (!session || !session.isAdmin)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { id } = await params
    const paymentId = parseInt(id)

    // Security: validate payment ID
    if (isNaN(paymentId) || paymentId <= 0)
      return NextResponse.json({ error: "Invalid payment ID" }, { status: 400 })

    let body: any
    try {
      body = await request.json()
    } catch {
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 })
    }

    const { status, transaction_id } = body

    if (!["completed", "rejected"].includes(status))
      return NextResponse.json({ error: "Invalid status" }, { status: 400 })

    // Security: sanitize transaction_id
    const safeTxnId = transaction_id
      ? String(transaction_id).trim().slice(0, 100)
      : null

    // Fetch payment — must be pending
    const { data: payment, error: fetchError } = await (supabaseAdmin as any)
      .from("payments")
      .select("*")
      .eq("id", paymentId)
      .eq("status", "pending") // Security: can only act on pending payments
      .single()

    if (fetchError || !payment)
      return NextResponse.json({ error: "Payment not found or already processed" }, { status: 404 })

    // Update payment status
    const { error } = await (supabaseAdmin as any)
      .from("payments")
      .update({
        status,
        transaction_id: safeTxnId,
        updated_at: new Date().toISOString(),
        paid_at: status === "completed" ? new Date().toISOString() : null,
      })
      .eq("id", paymentId)

    if (error) throw error

    // Option B: This payment is a MANUAL PAYOUT REQUEST
    // Earnings were already credited when tasks were completed/approved
    // We just need to record the payment as done — NO earnings adjustment needed

    if (status === "rejected") {
      // Payment rejected — user's balance stays intact, they can request again
      // No earnings adjustment needed — balance was never deducted
      // Just log it and let the user know via the status change
    }

    // Note: We intentionally do NOT touch user_earnings here
    // Balance deduction happens via getUserPendingPaymentTotal and getUserCompletedPaymentTotal
    // which are calculated dynamically from the payments table

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error updating payment:", error)
    return NextResponse.json({ error: "Failed to update payment" }, { status: 500 })
  }
}