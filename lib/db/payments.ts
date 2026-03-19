import { supabaseAdmin } from "@/lib/supabase/client"
import type { Payment } from "@/lib/types"
import { validateId, validateAmount } from "@/lib/security/validation"

// ── Get user payments (paginated) ─────────────────────────────────────────
export async function getUserPayments(
  userId: number,
  limit = 50,
  offset = 0
): Promise<Payment[]> {
  const safeUserId = validateId(userId)
  if (!safeUserId) throw new Error("Invalid userId")

  const safeLimit = Math.min(100, Math.max(1, limit))
  const safeOffset = Math.max(0, offset)

  const { data, error } = await (supabaseAdmin as any)
    .from("payments")
    .select("id, user_id, amount, upi_id, status, payment_method, transaction_id, created_at, updated_at")
    .eq("user_id", safeUserId)
    .order("created_at", { ascending: false })
    .range(safeOffset, safeOffset + safeLimit - 1)

  if (error) {
    console.error("[payments] getUserPayments error:", error)
    throw error
  }

  return (data || []) as Payment[]
}

// ── Get payment by ID ─────────────────────────────────────────────────────
export async function getPaymentById(id: number): Promise<Payment | null> {
  const safeId = validateId(id)
  if (!safeId) throw new Error("Invalid payment id")

  const { data, error } = await (supabaseAdmin as any)
    .from("payments")
    .select("*")
    .eq("id", safeId)
    .single()

  if (error && error.code !== "PGRST116") {
    console.error("[payments] getPaymentById error:", error)
    throw error
  }

  return (data || null) as Payment | null
}

// ── Create payment ────────────────────────────────────────────────────────
export async function createPayment(input: {
  user_id: number
  amount: number
  upi_id: string
}): Promise<Payment> {
  const safeUserId = validateId(input.user_id)
  if (!safeUserId) throw new Error("Invalid userId")

  const safeAmount = validateAmount(input.amount)
  if (!safeAmount) throw new Error("Invalid amount")

  // Sanitize UPI ID
  const safeUpiId = input.upi_id.trim().toLowerCase().slice(0, 100)
  if (!safeUpiId) throw new Error("Invalid UPI ID")

  const { data: payment, error } = await (supabaseAdmin as any)
    .from("payments")
    .insert({
      user_id: safeUserId,
      amount: safeAmount,
      upi_id: safeUpiId,
      status: "pending",
      payment_method: "upi",
      created_at: new Date().toISOString(),
    })
    .select("id, user_id, amount, upi_id, status, payment_method, created_at")
    .single()

  if (error) {
    console.error("[payments] createPayment error:", error)
    throw error
  }

  return payment as Payment
}

// ── Update payment status ─────────────────────────────────────────────────
export async function updatePaymentStatus(
  id: number,
  status: "pending" | "processing" | "completed" | "failed" | "rejected",
  transactionId?: string | null
): Promise<void> {
  const safeId = validateId(id)
  if (!safeId) throw new Error("Invalid payment id")

  const validStatuses = ["pending", "processing", "completed", "failed", "rejected"]
  if (!validStatuses.includes(status)) throw new Error("Invalid status")

  const updates: Record<string, any> = {
    status,
    updated_at: new Date().toISOString(),
  }

  if (transactionId !== undefined) {
    // Sanitize transaction ID
    updates.transaction_id = transactionId
      ? transactionId.trim().slice(0, 100)
      : null
  }

  const { error } = await (supabaseAdmin as any)
    .from("payments")
    .update(updates)
    .eq("id", safeId)

  if (error) {
    console.error("[payments] updatePaymentStatus error:", error)
    throw error
  }
}

// ── Get pending payments (admin) ──────────────────────────────────────────
export async function getPendingPayments(): Promise<Payment[]> {
  const { data, error } = await (supabaseAdmin as any)
    .from("payments")
    .select("*")
    .in("status", ["pending", "processing"])
    .order("created_at", { ascending: true })

  if (error) {
    console.error("[payments] getPendingPayments error:", error)
    throw error
  }

  return (data || []) as Payment[]
}

// ── Get all payments (admin) ──────────────────────────────────────────────
export async function getAllPayments(
  limit = 100,
  offset = 0
): Promise<Payment[]> {
  const safeLimit = Math.min(500, Math.max(1, limit))
  const safeOffset = Math.max(0, offset)

  const { data, error } = await (supabaseAdmin as any)
    .from("payments")
    .select("*")
    .order("created_at", { ascending: false })
    .range(safeOffset, safeOffset + safeLimit - 1)

  if (error) {
    console.error("[payments] getAllPayments error:", error)
    throw error
  }

  return (data || []) as Payment[]
}

// ── Get user pending payment total ────────────────────────────────────────
export async function getUserPendingPaymentTotal(
  userId: number
): Promise<number> {
  const safeUserId = validateId(userId)
  if (!safeUserId) throw new Error("Invalid userId")

  const { data, error } = await (supabaseAdmin as any)
    .from("payments")
    .select("amount")
    .eq("user_id", safeUserId)
    .in("status", ["pending", "processing"])

  if (error) {
    console.error("[payments] getUserPendingPaymentTotal error:", error)
    throw error
  }

  return (data || []).reduce(
    (sum: number, p: any) => sum + Math.max(0, Number(p.amount || 0)),
    0
  )
}

// ── Get user completed payment total ─────────────────────────────────────
export async function getUserCompletedPaymentTotal(
  userId: number
): Promise<number> {
  const safeUserId = validateId(userId)
  if (!safeUserId) throw new Error("Invalid userId")

  const { data, error } = await (supabaseAdmin as any)
    .from("payments")
    .select("amount")
    .eq("user_id", safeUserId)
    .eq("status", "completed")

  if (error) {
    console.error("[payments] getUserCompletedPaymentTotal error:", error)
    throw error
  }

  return (data || []).reduce(
    (sum: number, p: any) => sum + Math.max(0, Number(p.amount || 0)),
    0
  )
}