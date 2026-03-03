import Razorpay from 'razorpay'
import crypto from 'crypto'

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
})

export interface PayoutResult {
  success: boolean
  transactionId?: string
  error?: string
}

// Validate UPI ID via Razorpay
export async function validateUpiId(upiId: string): Promise<boolean> {
  try {
    // Basic format check
    const upiRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9]+$/
    if (!upiRegex.test(upiId)) return false
    return true
  } catch (error) {
    console.error('UPI validation error:', error)
    return false
  }
}

// Send UPI payout via Razorpay
export async function sendUpiPayout(
  upiId: string,
  amount: number, // in INR
  paymentId: number,
  userName: string
): Promise<PayoutResult> {
  try {
    // Generate idempotency key to prevent duplicate payouts
    const idempotencyKey = crypto
      .createHash('sha256')
      .update(`payment_${paymentId}_${upiId}_${amount}`)
      .digest('hex')

    // Convert INR to paise (Razorpay uses paise)
    const amountInPaise = Math.round(amount * 100)

    // Minimum payout check
    if (amountInPaise < 100) {
      return { success: false, error: 'Amount too low (minimum ₹1)' }
    }

    const payout = await (razorpay as any).payouts.create({
      account_number: process.env.RAZORPAY_ACCOUNT_NUMBER, // Your Razorpay account
      fund_account: {
        account_type: 'vpa',
        vpa: { address: upiId },
        contact: {
          name: userName,
          type: 'customer',
        },
      },
      amount: amountInPaise,
      currency: 'INR',
      mode: 'UPI',
      purpose: 'payout',
      queue_if_low_balance: true,
      reference_id: idempotencyKey,
      narration: `Qyantra Earnings Payout`,
    })

    return {
      success: true,
      transactionId: payout.id,
    }
  } catch (error: any) {
    console.error('Razorpay payout error:', error)
    return {
      success: false,
      error: error?.error?.description || error?.message || 'Payout failed',
    }
  }
}

// Verify Razorpay webhook signature
export function verifyWebhookSignature(
  body: string,
  signature: string,
  secret: string
): boolean {
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(body)
    .digest('hex')
  return crypto.timingSafeEqual(
    Buffer.from(expectedSignature),
    Buffer.from(signature)
  )
}