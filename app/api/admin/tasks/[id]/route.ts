import { NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/auth/session"
import { getTaskById, updateTask, deleteTask } from "@/lib/db/tasks"

interface RouteContext {
  params: Promise<{ id: string }>
}

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const session = await getSession()
    if (!session || !session.isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await context.params
    const taskId = parseInt(id, 10)
    if (isNaN(taskId)) {
      return NextResponse.json({ error: "Invalid task ID" }, { status: 400 })
    }

    const task = await getTaskById(taskId)
    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 })
    }

    return NextResponse.json({ task })
  } catch (error) {
    console.error("Error fetching task:", error)
    return NextResponse.json(
      { error: "Failed to fetch task" },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    const session = await getSession()
    if (!session || !session.isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await context.params
    const taskId = parseInt(id, 10)
    if (isNaN(taskId)) {
      return NextResponse.json({ error: "Invalid task ID" }, { status: 400 })
    }

    const data = await request.json()

    await updateTask(taskId, {
      title: data.title,
      description: data.description,
      app_name: data.app_name,
      app_icon_url: data.app_icon_url,
      task_url: data.task_url,
      network_payout: data.network_payout ? parseFloat(data.network_payout) : undefined,
      user_payout: data.user_payout ? parseFloat(data.user_payout) : undefined,
      is_active: data.is_active,
      expires_at: data.expires_at,
    })

    const updated = await getTaskById(taskId)
    return NextResponse.json({ task: updated })
  } catch (error) {
    console.error("Error updating task:", error)
    return NextResponse.json(
      { error: "Failed to update task" },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const session = await getSession()
    if (!session || !session.isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await context.params
    const taskId = parseInt(id, 10)
    if (isNaN(taskId)) {
      return NextResponse.json({ error: "Invalid task ID" }, { status: 400 })
    }

    await deleteTask(taskId)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting task:", error)
    return NextResponse.json(
      { error: "Failed to delete task" },
      { status: 500 }
    )
  }
}
