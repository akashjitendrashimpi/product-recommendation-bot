import { supabaseAdmin } from '@/lib/supabase/client'
import type { Payment } from '@/lib/types'

export async function getUserPayments(userId: number): Promise<Payment[]> {
  const { data, error } = await (supabaseAdmin as any)
    .from('payments')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return (data || []) as Payment[]
}

export async function getPaymentById(id: number): Promise<Payment | null> {
  const { data, error } = await (supabaseAdmin as any)
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
}): Promise<Payment> {
  const { data: payment, error } = await (supabaseAdmin as any)
    .from('payments')
    .insert({
      user_id: data.user_id,
      amount: data.amount,
      upi_id: data.upi_id,
      status: 'pending',
      payment_method: 'upi',
    })
    .select()
    .single()
  if (error) throw error
  return payment as Payment
}

export async function updatePaymentStatus(
  id: number,
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'rejected',
  transactionId?: string | null,
): Promise<void> {
  const updates: Record<string, any> = {
    status,
    updated_at: new Date().toISOString(),
  }
  if (transactionId !== undefined) updates.transaction_id = transactionId

  const { error } = await (supabaseAdmin as any)
    .from('payments')
    .update(updates)
    .eq('id', id)
  if (error) throw error
}

export async function getPendingPayments(): Promise<Payment[]> {
  const { data, error } = await (supabaseAdmin as any)
    .from('payments')
    .select('*')
    .eq('status', 'pending')
    .order('created_at', { ascending: true })
  if (error) throw error
  return (data || []) as Payment[]
}

export async function getAllPayments(): Promise<Payment[]> {
  const { data, error } = await (supabaseAdmin as any)
    .from('payments')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw error
  return (data || []) as Payment[]
}

export async function getUserPendingPaymentTotal(userId: number): Promise<number> {
  const { data, error } = await (supabaseAdmin as any)
    .from('payments')
    .select('amount')
    .eq('user_id', userId)
    .in('status', ['pending', 'processing'])
  if (error) throw error
  return (data || []).reduce((sum: number, p: any) => sum + Number(p.amount || 0), 0)
}

export async function getUserCompletedPaymentTotal(userId: number): Promise<number> {
  const { data, error } = await (supabaseAdmin as any)
    .from('payments')
    .select('amount')
    .eq('user_id', userId)
    .eq('status', 'completed')
  if (error) throw error
  return (data || []).reduce((sum: number, p: any) => sum + Number(p.amount || 0), 0)
}