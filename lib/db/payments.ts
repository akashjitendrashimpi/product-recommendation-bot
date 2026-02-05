import { query, queryOne, execute } from "./connection"
import type { Payment } from "@/lib/types"

// Get user's payments
export async function getUserPayments(userId: number): Promise<Payment[]> {
  return query<Payment>(
    `SELECT * FROM payments WHERE user_id = ? ORDER BY created_at DESC`,
    [userId]
  )
}

// Get payment by ID
export async function getPaymentById(id: number): Promise<Payment | null> {
  return queryOne<Payment>(`SELECT * FROM payments WHERE id = ?`, [id])
}

// Create payment record
export async function createPayment(data: {
  user_id: number
  amount: number
  upi_id: string
  payment_date: string
}): Promise<Payment> {
  const result = await execute(
    `INSERT INTO payments (user_id, amount, upi_id, payment_date, status)
     VALUES (?, ?, ?, ?, 'pending')`,
    [data.user_id, data.amount, data.upi_id, data.payment_date]
  )

  if (!result.insertId) {
    throw new Error("Failed to create payment")
  }

  const payment = await getPaymentById(result.insertId)
  if (!payment) throw new Error("Failed to create payment")
  return payment
}

// Update payment status
export async function updatePaymentStatus(
  id: number,
  status: "processing" | "completed" | "failed",
  paymentReference?: string | null,
  errorMessage?: string | null
): Promise<void> {
  const updates: string[] = []
  const values: any[] = []

  updates.push("status = ?")
  values.push(status)

  if (paymentReference !== undefined) {
    updates.push("payment_reference = ?")
    values.push(paymentReference)
  }
  if (errorMessage !== undefined) {
    updates.push("error_message = ?")
    values.push(errorMessage)
  }
  if (status === "completed" || status === "failed") {
    updates.push("processed_at = NOW()")
  }

  updates.push("updated_at = CURRENT_TIMESTAMP")
  values.push(id)

  await execute(`UPDATE payments SET ${updates.join(", ")} WHERE id = ?`, values)
}

// Get pending payments
export async function getPendingPayments(): Promise<Payment[]> {
  return query<Payment>(
    `SELECT * FROM payments WHERE status = 'pending' ORDER BY payment_date ASC, created_at ASC`
  )
}

// Get payments by date
export async function getPaymentsByDate(date: string): Promise<Payment[]> {
  return query<Payment>(
    `SELECT * FROM payments WHERE payment_date = ? ORDER BY created_at DESC`,
    [date]
  )
}
