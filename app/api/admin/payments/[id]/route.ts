import { NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/auth/session"
import { getPaymentById, updatePaymentStatus } from "@/lib/db/payments"

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession()
    if (!session || !session.isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const paymentId = parseInt(id)
    const { status, transaction_id } = await request.json()

    if (!['completed', 'rejected'].includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 })
    }

    // Get payment
    const payment = await getPaymentById(paymentId)
    if (!payment) {
      return NextResponse.json({ error: "Payment not found" }, { status: 404 })
    }

    if (payment.status !== 'pending') {
      return NextResponse.json(
        { error: `Payment is already ${payment.status}` },
        { status: 400 }
      )
    }

    // Update payment status with optional transaction ID
    await updatePaymentStatus(paymentId, status, transaction_id || null)

    return NextResponse.json({
      success: true,
      message: status === 'completed'
        ? `Payment marked as completed`
        : 'Payment rejected'
    })

  } catch (error) {
    console.error('Error processing payment:', error)
    return NextResponse.json({ error: 'Failed to process payment' }, { status: 500 })
  }
}