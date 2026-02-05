import { NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/auth/session"
import { getAllTasks, createTask, getTasksByNetwork } from "@/lib/db/tasks"
import { getUserById } from "@/lib/db/users"

export async function GET(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session || !session.isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const url = new URL(request.url)
    const networkId = url.searchParams.get("network_id")

    let tasks
    if (networkId) {
      tasks = await getTasksByNetwork(parseInt(networkId, 10))
    } else {
      tasks = await getAllTasks()
    }

    return NextResponse.json({ tasks })
  } catch (error) {
    console.error("Error fetching tasks:", error)
    return NextResponse.json(
      { error: "Failed to fetch tasks" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session || !session.isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const data = await request.json()

    const task = await createTask({
      network_id: data.network_id || null,
      task_id: data.task_id,
      title: data.title,
      description: data.description || null,
      action_type: data.action_type,
      app_name: data.app_name || null,
      app_icon_url: data.app_icon_url || null,
      task_url: data.task_url,
      network_payout: parseFloat(data.network_payout),
      user_payout: parseFloat(data.user_payout),
      currency: data.currency || "INR",
      country: data.country || "IN",
      requirements: data.requirements || null,
      expires_at: data.expires_at || null,
    })

    return NextResponse.json({ task }, { status: 201 })
  } catch (error) {
    console.error("Error creating task:", error)
    return NextResponse.json(
      { error: "Failed to create task" },
      { status: 500 }
    )
  }
}
