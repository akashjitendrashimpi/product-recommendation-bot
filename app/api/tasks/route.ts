import { NextRequest, NextResponse } from "next/server"
import { getAllTasks } from "@/lib/db/tasks"
import { getSession } from "@/lib/auth/session"

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const country = url.searchParams.get("country") || "IN"

    // Pass userId so rejected completions free up slots for that user
    const session = await getSession()
    const userId = session?.userId

    const tasks = await getAllTasks(country, userId)

    return NextResponse.json({ tasks })
  } catch (error) {
    console.error("Error fetching tasks:", error)
    return NextResponse.json(
      { error: "Failed to fetch tasks" },
      { status: 500 }
    )
  }
}