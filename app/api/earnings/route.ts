import { NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/auth/session"
import { getUserEarningsSummary, getUserMonthlyEarnings } from "@/lib/db/earnings"
import { getUserTaskCompletions } from "@/lib/db/tasks"
import { getUserPendingPaymentTotal, getUserCompletedPaymentTotal } from "@/lib/db/payments"

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
      const monthlyEarnings = await getUserMonthlyEarnings(
        session.userId,
        parseInt(year, 10),
        parseInt(month, 10)
      )
      return NextResponse.json({ earnings: monthlyEarnings })
    }

    // Get summary + calculate available balance
    const [summary, completions, completedPayouts, pendingPayouts] = await Promise.all([
      getUserEarningsSummary(session.userId),
      getUserTaskCompletions(session.userId),
      getUserCompletedPaymentTotal(session.userId),
      getUserPendingPaymentTotal(session.userId),
    ])

    const totalEarnings = Number(summary.totalEarnings || 0)
    const availableBalance = Math.max(0, totalEarnings - completedPayouts - pendingPayouts)

    return NextResponse.json({
      summary: {
        ...summary,
        totalEarnings,
        availableBalance,
        pendingEarnings: availableBalance, // keep backward compat
        paidEarnings: completedPayouts,
        pendingPayouts,
      },
      recentCompletions: completions.slice(0, 10),
    })
  } catch (error) {
    console.error("Error fetching earnings:", error)
    return NextResponse.json({ error: "Failed to fetch earnings" }, { status: 500 })
  }
}