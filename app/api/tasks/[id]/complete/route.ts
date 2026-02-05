import { NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/auth/session"
import { getTaskById, hasUserCompletedTask, createTaskCompletion } from "@/lib/db/tasks"
import { updateDailyEarning } from "@/lib/db/earnings"
import { getUserById } from "@/lib/db/users"
import { sendTaskCompletionEmail } from "@/lib/email/resend"

interface RouteContext {
  params: Promise<{ id: string }>
}

export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await context.params
    const taskId = parseInt(id, 10)
    if (isNaN(taskId)) {
      return NextResponse.json({ error: "Invalid task ID" }, { status: 400 })
    }

    // Check if task exists
    const task = await getTaskById(taskId)
    if (!task || !task.is_active) {
      return NextResponse.json({ error: "Task not found or inactive" }, { status: 404 })
    }

    // Check if user already completed this task
    const existing = await hasUserCompletedTask(session.userId, taskId)
    if (existing) {
      return NextResponse.json(
        { error: "Task already completed", completion: existing },
        { status: 400 }
      )
    }

    // Create completion record
    const completion = await createTaskCompletion({
      user_id: session.userId,
      task_id: taskId,
      network_payout: task.network_payout,
      user_payout: task.user_payout,
    })

    // Update daily earnings
    const today = new Date().toISOString().split("T")[0]
    await updateDailyEarning(session.userId, today, task.user_payout)

    // Send email notification (don't fail if email fails)
    try {
      const user = await getUserById(session.userId)
      if (user) {
        await sendTaskCompletionEmail(
          user.email,
          task.title,
          task.user_payout,
          user.display_name || undefined
        )
      }
    } catch (emailError) {
      console.error("Failed to send task completion email:", emailError)
      // Don't fail the request if email fails
    }

    return NextResponse.json({ completion, success: true })
  } catch (error) {
    console.error("Error completing task:", error)
    return NextResponse.json(
      { error: "Failed to complete task" },
      { status: 500 }
    )
  }
}
