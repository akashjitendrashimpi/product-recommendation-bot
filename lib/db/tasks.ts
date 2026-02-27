import { supabaseAdmin } from '@/lib/supabase/client'
import type { Task, TaskCompletion } from '@/lib/types'

// Get all active tasks
export async function getAllTasks(country: string = 'IN'): Promise<Task[]> {
  const { data, error } = await supabaseAdmin
    .from('tasks')
    .select('*')
    .eq('is_active', true)
    .eq('country_code', country)
    .or(`expires_at.is.null,expires_at.gt.${new Date().toISOString()}`)
    .order('created_at', { ascending: false })

  if (error) throw error
  return (data || []) as Task[]
}

// Get task by ID
export async function getTaskById(id: number): Promise<Task | null> {
  const { data, error } = await supabaseAdmin
    .from('tasks')
    .select('*')
    .eq('id', id)
    .single()

  if (error && error.code !== 'PGRST116') throw error
  return (data || null) as Task | null
}

// Get tasks by network
export async function getTasksByNetwork(networkId: number): Promise<Task[]> {
  const { data, error } = await supabaseAdmin
    .from('tasks')
    .select('*')
    .eq('network_id', networkId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return (data || []) as Task[]
}

// Get task by network ID and task ID (for syncing)
export async function getTaskByNetworkId(networkId: number, taskId: string): Promise<Task | null> {
  const { data, error } = await supabaseAdmin
    .from('tasks')
    .select('*')
    .eq('network_id', networkId)
    .eq('task_id', taskId)
    .single()

  if (error && error.code !== 'PGRST116') throw error
  return (data || null) as Task | null
}

// Create task
export async function createTask(data: {
  network_id?: number | null
  task_id: string
  title: string
  description?: string | null
  action_type: 'install' | 'signup' | 'time_spent' | 'other'
  app_name?: string | null
  app_icon_url?: string | null
  task_url: string
  network_payout: number
  user_payout: number
  currency?: string
  country?: string
  requirements?: string | null
  expires_at?: string | null
}): Promise<Task> {
  const { data: task, error } = await supabaseAdmin
    .from('tasks')
    .insert({
      network_id: data.network_id || null,
      task_id: data.task_id,
      title: data.title,
      description: data.description || null,
      action_type: data.action_type,
      app_name: data.app_name || null,
      app_icon_url: data.app_icon_url || null,
      task_url: data.task_url,
      network_payout: data.network_payout,
      user_payout: data.user_payout,
      currency: data.currency || 'INR',
      country: data.country || 'IN',
      requirements: data.requirements || null,
      expires_at: data.expires_at || null,
    })
    .select()
    .single()

  if (error) throw error
  return task as Task
}

// Update task
export async function updateTask(
  id: number,
  data: Partial<Task>
): Promise<void> {
  const updates: Record<string, any> = {}
  Object.keys(data).forEach(key => {
    if (data[key as keyof Task] !== undefined) {
      updates[key] = data[key as keyof Task]
    }
  })

  if (Object.keys(updates).length === 0) return

  const { error } = await supabaseAdmin
    .from('tasks')
    .update(updates)
    .eq('id', id)

  if (error) throw error
}

// Delete task
export async function deleteTask(id: number): Promise<void> {
  const { error } = await supabaseAdmin.from('tasks').delete().eq('id', id)
  if (error) throw error
}

// Get user's task completions
export async function getUserTaskCompletions(userId: number): Promise<TaskCompletion[]> {
  const { data, error } = await supabaseAdmin
    .from('task_completions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return (data || []) as TaskCompletion[]
}

// Check if user has completed a task
export async function hasUserCompletedTask(userId: number, taskId: number): Promise<TaskCompletion | null> {
  const { data, error } = await supabaseAdmin
    .from('task_completions')
    .select('*')
    .eq('user_id', userId)
    .eq('task_id', taskId)
    .single()

  if (error && error.code !== 'PGRST116') throw error
  return (data || null) as TaskCompletion | null
}

// Create task completion
export async function createTaskCompletion(data: {
  user_id: number
  task_id: number
  network_payout: number
  user_payout: number
  completion_proof?: string | null
  network_response?: Record<string, any> | null
}): Promise<TaskCompletion> {
  const { data: completion, error } = await supabaseAdmin
    .from('task_completions')
    .insert({
      user_id: data.user_id,
      task_id: data.task_id,
      status: 'completed',
      network_payout: data.network_payout,
      user_payout: data.user_payout,
      completion_proof: data.completion_proof || null,
      network_response: data.network_response || null,
      completed_at: new Date().toISOString(),
    })
    .select()
    .single()

  if (error) throw error
  return completion as TaskCompletion
}

// Verify task completion
export async function verifyTaskCompletion(id: number, status: 'verified' | 'rejected'): Promise<void> {
  const { error } = await supabaseAdmin
    .from('task_completions')
    .update({ status, verified_at: new Date().toISOString() })
    .eq('id', id)

  if (error) throw error
}