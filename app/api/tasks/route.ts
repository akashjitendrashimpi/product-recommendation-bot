import { NextRequest, NextResponse } from "next/server"
import { getAllTasks } from "@/lib/db/tasks"

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const country = url.searchParams.get("country") || "IN"

    const tasks = await getAllTasks(country)

    return NextResponse.json({ tasks })
  } catch (error) {
    console.error("Error fetching tasks:", error)
    return NextResponse.json(
      { error: "Failed to fetch tasks" },
      { status: 500 }
    )
  }
}
