import { supabaseAdmin } from '@/lib/supabase/client'
import type { Payment } from '@/lib/types'

export async function getUserPayments(userId: number): Promise<Payment[]> {
  const { data, error } = await supabaseAdmin
    .from('payments')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return (data || []) as Payment[]
}

export async function getPaymentById(id: number): Promise<Payment | null> {
  const { data, error } = await supabaseAdmin
    .from('payments')
    .select('*')
    .eq('id', id)
    .single()
  if (error && error.code !== 'PGRST116') throw error
  return (data || null) as Payment | null
}

export async function createPayment(data: {
  user_id: number
  amount: number
  upi_id: string
  payment_date: string
}): Promise<Payment> {
  const { data: payment, error } = await supabaseAdmin
    .from('payments')
    .insert({ ...data, status: 'pending' })
    .select()
    .single()
  if (error) throw error
  return payment as Payment
}

export async function updatePaymentStatus(
  id: number,
  status: 'processing' | 'completed' | 'failed',
  paymentReference?: string | null,
  errorMessage?: string | null
): Promise<void> {
  const updates: Record<string, any> = { status }
  if (paymentReference !== undefined) updates.payment_reference = paymentReference
  if (errorMessage !== undefined) updates.error_message = errorMessage
  if (status === 'completed' || status === 'failed') {
    updates.processed_at = new Date().toISOString()
  }
  const { error } = await supabaseAdmin
    .from('payments')
    .update(updates)
    .eq('id', id)
  if (error) throw error
}

export async function getPendingPayments(): Promise<Payment[]> {
  const { data, error } = await supabaseAdmin
    .from('payments')
    .select('*')
    .eq('status', 'pending')
    .order('payment_date', { ascending: true })
  if (error) throw error
  return (data || []) as Payment[]
}

export async function getPaymentsByDate(date: string): Promise<Payment[]> {
  const { data, error } = await supabaseAdmin
    .from('payments')
    .select('*')
    .eq('payment_date', date)
    .order('created_at', { ascending: false })
  if (error) throw error
  return (data || []) as Payment[]
}