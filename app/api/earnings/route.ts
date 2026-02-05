import { NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/auth/session"
import { getUserEarningsSummary, getUserMonthlyEarnings } from "@/lib/db/earnings"
import { getUserTaskCompletions } from "@/lib/db/tasks"

export async function GET(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const url = new URL(request.url)
    const month = url.searchParams.get("month")
    const year = url.searchParams.get("year")

    if (month && year) {
      // Get monthly earnings
      const monthlyEarnings = await getUserMonthlyEarnings(
        session.userId,
        parseInt(year, 10),
        parseInt(month, 10)
      )
      return NextResponse.json({ earnings: monthlyEarnings })
    }

    // Get summary
    const summary = await getUserEarningsSummary(session.userId)
    const completions = await getUserTaskCompletions(session.userId)

    return NextResponse.json({
      summary,
      recentCompletions: completions.slice(0, 10),
    })
  } catch (error) {
    console.error("Error fetching earnings:", error)
    return NextResponse.json(
      { error: "Failed to fetch earnings" },
      { status: 500 }
    )
  }
}
