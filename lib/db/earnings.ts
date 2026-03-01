import { supabaseAdmin } from '@/lib/supabase/client'
import type { UserEarning } from '@/lib/types'

export async function getUserDailyEarning(userId: number, date: string): Promise<UserEarning | null> {
  const { data, error } = await (supabaseAdmin as any)
    .from('user_earnings')
    .select('*')
    .eq('user_id', userId)
    .eq('date', date)
    .single()
  if (error && error.code !== 'PGRST116') throw error
  return (data || null) as UserEarning | null
}

export async function getUserMonthlyEarnings(userId: number, year: number, month: number): Promise<UserEarning[]> {
  const { data, error } = await (supabaseAdmin as any)
    .from('user_earnings')
    .select('*')
    .eq('user_id', userId)
    .gte('date', `${year}-${String(month).padStart(2, '0')}-01`)
    .lt('date', `${year}-${String(month + 1).padStart(2, '0')}-01`)
    .order('date', { ascending: false })
  if (error) throw error
  return (data || []) as UserEarning[]
}

export async function getUserTotalEarnings(userId: number): Promise<number> {
  const { data, error } = await (supabaseAdmin as any)
    .from('user_earnings')
    .select('daily_earnings')
    .eq('user_id', userId)
  if (error) throw error
  return (data || []).reduce((sum: number, r: any) => sum + Number(r.daily_earnings || 0), 0)
}

export async function updateDailyEarning(userId: number, date: string, amount: number): Promise<void> {
  const existing = await getUserDailyEarning(userId, date)
  if (existing) {
    const { error } = await (supabaseAdmin as any)
      .from('user_earnings')
      .update({
        amount: Number(existing.amount || 0) + amount,
        daily_earnings: Number(existing.daily_earnings || 0) + amount,
        tasks_completed: (existing.tasks_completed || 0) + 1,
      })
      .eq('user_id', userId)
      .eq('date', date)
    if (error) throw error
  } else {
    const { error } = await (supabaseAdmin as any)
      .from('user_earnings')
      .insert({
        user_id: userId,
        date,
        amount: amount,
        daily_earnings: amount,
        tasks_completed: 1,
        earning_type: 'task',
      })
    if (error) throw error
  }
}

export async function getUserEarningsSummary(userId: number): Promise<{
  totalEarnings: number
  dailyEarnings: number
  monthlyEarnings: number
  tasksCompleted: number
}> {
  const today = new Date().toISOString().split('T')[0]
  const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1)
    .toISOString()
    .split('T')[0]

  const [{ data: monthlyData, error: monthlyError }, dailyEarning] = await Promise.all([
    (supabaseAdmin as any)
      .from('user_earnings')
      .select('*')
      .eq('user_id', userId)
      .gte('date', startOfMonth)
      .order('date', { ascending: false }),
    getUserDailyEarning(userId, today),
  ])

  if (monthlyError) throw monthlyError

  const total = await getUserTotalEarnings(userId)
  const monthlyTotal = (monthlyData || []).reduce((sum: number, e: any) => sum + Number(e.daily_earnings || 0), 0)

  const { data: tasks, error: tasksError } = await (supabaseAdmin as any)
    .from('task_completions')
    .select('id', { count: 'exact' })
    .eq('user_id', userId)
    .in('status', ['completed', 'verified'])

  if (tasksError) throw tasksError

  return {
    totalEarnings: total,
    dailyEarnings: dailyEarning ? Number(dailyEarning.daily_earnings || 0) : 0,
    monthlyEarnings: monthlyTotal,
    tasksCompleted: tasks?.length || 0,
  }
}