import { query, queryOne, execute } from "./connection"
import type { UserEarning } from "@/lib/types"

// Get user's daily earning for a specific date
export async function getUserDailyEarning(
  userId: number,
  date: string
): Promise<UserEarning | null> {
  return queryOne<UserEarning>(
    `SELECT * FROM user_earnings WHERE user_id = ? AND date = ?`,
    [userId, date]
  )
}

// Get user's monthly earnings
export async function getUserMonthlyEarnings(
  userId: number,
  year: number,
  month: number
): Promise<UserEarning[]> {
  return query<UserEarning>(
    `SELECT * FROM user_earnings 
     WHERE user_id = ? 
     AND YEAR(date) = ? 
     AND MONTH(date) = ?
     ORDER BY date DESC`,
    [userId, year, month]
  )
}

// Get user's total lifetime earnings
export async function getUserTotalEarnings(userId: number): Promise<number> {
  const result = await queryOne<{ total: number | string }>(
    `SELECT COALESCE(SUM(daily_earnings), 0) as total 
     FROM user_earnings 
     WHERE user_id = ?`,
    [userId]
  )
  // Convert to number (MySQL DECIMAL returns as string)
  return result?.total ? Number(result.total) : 0
}

// Update or create daily earning
export async function updateDailyEarning(
  userId: number,
  date: string,
  amount: number
): Promise<void> {
  // Check if record exists
  const existing = await getUserDailyEarning(userId, date)

  if (existing) {
    // Update existing
    await execute(
      `UPDATE user_earnings 
       SET daily_earnings = daily_earnings + ?, 
           tasks_completed = tasks_completed + 1,
           updated_at = CURRENT_TIMESTAMP
       WHERE user_id = ? AND date = ?`,
      [amount, userId, date]
    )
  } else {
    // Create new
    await execute(
      `INSERT INTO user_earnings (user_id, date, daily_earnings, tasks_completed)
       VALUES (?, ?, ?, 1)`,
      [userId, date, amount]
    )
  }
}

// Get user's earnings summary (last 30 days)
export async function getUserEarningsSummary(userId: number): Promise<{
  totalEarnings: number
  dailyEarnings: number
  monthlyEarnings: number
  tasksCompleted: number
}> {
  const today = new Date().toISOString().split("T")[0]
  const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1)
    .toISOString()
    .split("T")[0]

  const [total, daily, monthly, tasks] = await Promise.all([
    getUserTotalEarnings(userId),
    getUserDailyEarning(userId, today),
    query<UserEarning>(
      `SELECT * FROM user_earnings 
       WHERE user_id = ? AND date >= ? 
       ORDER BY date DESC`,
      [userId, startOfMonth]
    ),
    query<{ count: number }>(
      `SELECT COUNT(*) as count 
       FROM task_completions 
       WHERE user_id = ? AND status IN ('completed', 'verified')`,
      [userId]
    ),
  ])

  const monthlyTotal =
    monthly.reduce((sum, e) => sum + Number(e.daily_earnings || 0), 0) || 0

  // Convert all values to numbers (MySQL DECIMAL returns as string)
  return {
    totalEarnings: Number(total) || 0,
    dailyEarnings: daily?.daily_earnings ? Number(daily.daily_earnings) : 0,
    monthlyEarnings: Number(monthlyTotal) || 0,
    tasksCompleted: tasks[0]?.count ? Number(tasks[0].count) : 0,
  }
}
