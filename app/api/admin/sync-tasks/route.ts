import { NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/auth/session"
import { getUserById } from "@/lib/db/users"
import { syncAdGateOffersToTasks } from "@/lib/cpa/adgate"

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user is admin
    const user = await getUserById(session.userId)
    if (!user || !user.is_admin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Sync AdGate offers
    const synced = await syncAdGateOffersToTasks()

    return NextResponse.json({
      success: true,
      message: `Successfully synced ${synced} tasks from AdGate Media`,
      synced,
    })
  } catch (error: any) {
    console.error("Error syncing tasks:", error)
    return NextResponse.json(
      {
        error: error.message || "Failed to sync tasks",
      },
      { status: 500 }
    )
  }
}
