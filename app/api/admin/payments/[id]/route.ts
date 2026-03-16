import { NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/auth/session"
import { supabaseAdmin } from "@/lib/supabase/client"
import { createNotification, sendPushNotification } from "@/app/api/admin/send-notification/route"

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

    if (isNaN(paymentId) || paymentId <= 0)
      return NextResponse.json({ error: "Invalid payment ID" }, { status: 400 })

    let body: any
    try {
      body = await request.json()
    } catch {
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 })
    }

    const { status, transaction_id, rejection_reason } = body

    if (!["completed", "rejected"].includes(status))
      return NextResponse.json({ error: "Invalid status" }, { status: 400 })

    const safeTxnId = transaction_id
      ? String(transaction_id).trim().slice(0, 100)
      : null

    // Fetch payment — must be pending
    const { data: payment, error: fetchError } = await (supabaseAdmin as any)
      .from("payments")
      .select("*")
      .eq("id", paymentId)
      .eq("status", "pending")
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

    const userId = payment.user_id
    const amount = Number(payment.amount).toFixed(0)

    // ── Notify user on approve ──
    if (status === "completed") {
      const title = "Payment Sent! 💸"
      const notifBody = `₹${amount} has been sent to ${payment.upi_id}.${safeTxnId ? ` Txn: ${safeTxnId}` : ''}`
      await Promise.allSettled([
        createNotification({ userId, title, body: notifBody, type: 'success', actionUrl: '/dashboard/earnings' }),
        sendPushNotification({ userId, title, body: notifBody, actionUrl: '/dashboard/earnings' }),
      ])
    }

    // ── Notify user on reject ──
    if (status === "rejected") {
      const reason = rejection_reason?.trim() || "Please contact support for details."
      const title = "Payout Rejected ❌"
      const notifBody = `Your ₹${amount} payout request was rejected. ${reason}`
      await Promise.allSettled([
        createNotification({ userId, title, body: notifBody, type: 'error', actionUrl: '/dashboard/earnings' }),
        sendPushNotification({ userId, title, body: notifBody, actionUrl: '/dashboard/earnings' }),
      ])
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error updating payment:", error)
    return NextResponse.json({ error: "Failed to update payment" }, { status: 500 })
  }
}