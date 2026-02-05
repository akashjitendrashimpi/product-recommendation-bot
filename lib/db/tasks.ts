import { query, queryOne, execute } from "./connection"
import type { Task, TaskCompletion } from "@/lib/types"

// Get all active tasks
export async function getAllTasks(country: string = "IN"): Promise<Task[]> {
  return query<Task>(
    `SELECT * FROM tasks 
     WHERE is_active = TRUE 
     AND country = ?
     AND (expires_at IS NULL OR expires_at > NOW())
     ORDER BY created_at DESC`,
    [country]
  )
}

// Get task by ID
export async function getTaskById(id: number): Promise<Task | null> {
  return queryOne<Task>(`SELECT * FROM tasks WHERE id = ?`, [id])
}

// Get tasks by network
export async function getTasksByNetwork(networkId: number): Promise<Task[]> {
  return query<Task>(
    `SELECT * FROM tasks WHERE network_id = ? ORDER BY created_at DESC`,
    [networkId]
  )
}

// Get task by network ID and task ID (for syncing)
export async function getTaskByNetworkId(
  networkId: number,
  taskId: string
): Promise<Task | null> {
  return queryOne<Task>(
    `SELECT * FROM tasks WHERE network_id = ? AND task_id = ?`,
    [networkId, taskId]
  )
}

// Create task (manual or from network sync)
export async function createTask(data: {
  network_id?: number | null
  task_id: string
  title: string
  description?: string | null
  action_type: "install" | "signup" | "time_spent" | "other"
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
  const result = await execute(
    `INSERT INTO tasks (
      network_id, task_id, title, description, action_type, app_name, app_icon_url,
      task_url, network_payout, user_payout, currency, country, requirements, expires_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      data.network_id || null,
      data.task_id,
      data.title,
      data.description || null,
      data.action_type,
      data.app_name || null,
      data.app_icon_url || null,
      data.task_url,
      data.network_payout,
      data.user_payout,
      data.currency || "INR",
      data.country || "IN",
      data.requirements || null,
      data.expires_at || null,
    ]
  )

  if (!result.insertId) {
    throw new Error("Failed to create task")
  }

  const task = await getTaskById(result.insertId)
  if (!task) throw new Error("Failed to create task")
  return task
}

// Update task
export async function updateTask(
  id: number,
  data: {
    title?: string
    description?: string | null
    app_name?: string | null
    app_icon_url?: string | null
    task_url?: string
    network_payout?: number
    user_payout?: number
    is_active?: boolean
    expires_at?: string | null
  }
): Promise<void> {
  const updates: string[] = []
  const values: any[] = []

  if (data.title !== undefined) {
    updates.push("title = ?")
    values.push(data.title)
  }
  if (data.description !== undefined) {
    updates.push("description = ?")
    values.push(data.description)
  }
  if (data.app_name !== undefined) {
    updates.push("app_name = ?")
    values.push(data.app_name)
  }
  if (data.app_icon_url !== undefined) {
    updates.push("app_icon_url = ?")
    values.push(data.app_icon_url)
  }
  if (data.task_url !== undefined) {
    updates.push("task_url = ?")
    values.push(data.task_url)
  }
  if (data.network_payout !== undefined) {
    updates.push("network_payout = ?")
    values.push(data.network_payout)
  }
  if (data.user_payout !== undefined) {
    updates.push("user_payout = ?")
    values.push(data.user_payout)
  }
  if (data.is_active !== undefined) {
    updates.push("is_active = ?")
    values.push(data.is_active)
  }
  if (data.expires_at !== undefined) {
    updates.push("expires_at = ?")
    values.push(data.expires_at)
  }

  if (updates.length === 0) return

  updates.push("updated_at = CURRENT_TIMESTAMP")
  values.push(id)

  await execute(`UPDATE tasks SET ${updates.join(", ")} WHERE id = ?`, values)
}

// Delete task
export async function deleteTask(id: number): Promise<void> {
  await execute("DELETE FROM tasks WHERE id = ?", [id])
}

// Get user's task completions
export async function getUserTaskCompletions(userId: number): Promise<TaskCompletion[]> {
  return query<TaskCompletion>(
    `SELECT * FROM task_completions WHERE user_id = ? ORDER BY created_at DESC`,
    [userId]
  )
}

// Check if user has completed a task
export async function hasUserCompletedTask(
  userId: number,
  taskId: number
): Promise<TaskCompletion | null> {
  return queryOne<TaskCompletion>(
    `SELECT * FROM task_completions WHERE user_id = ? AND task_id = ?`,
    [userId, taskId]
  )
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
  const result = await execute(
    `INSERT INTO task_completions (
      user_id, task_id, network_payout, user_payout, 
      completion_proof, network_response, completed_at, status
    ) VALUES (?, ?, ?, ?, ?, ?, NOW(), 'completed')`,
    [
      data.user_id,
      data.task_id,
      data.network_payout,
      data.user_payout,
      data.completion_proof || null,
      data.network_response ? JSON.stringify(data.network_response) : null,
    ]
  )

  if (!result.insertId) {
    throw new Error("Failed to create task completion")
  }

  const completion = await queryOne<TaskCompletion>(
    `SELECT * FROM task_completions WHERE id = ?`,
    [result.insertId]
  )
  if (!completion) throw new Error("Failed to create task completion")
  return completion
}

// Verify task completion
export async function verifyTaskCompletion(
  id: number,
  status: "verified" | "rejected"
): Promise<void> {
  await execute(
    `UPDATE task_completions 
     SET status = ?, verified_at = NOW() 
     WHERE id = ?`,
    [status, id]
  )
}
