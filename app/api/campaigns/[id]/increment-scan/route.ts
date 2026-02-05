import { NextRequest, NextResponse } from "next/server"
import { incrementScanCount, getCampaignById } from "@/lib/db/campaigns"

interface RouteContext {
  params: Promise<{ id: string }>
}

export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params
    const campaignId = parseInt(id, 10)
    
    if (isNaN(campaignId)) {
      return NextResponse.json({ error: "Invalid campaign ID" }, { status: 400 })
    }

    // Verify campaign exists
    const campaign = await getCampaignById(campaignId)
    if (!campaign) {
      return NextResponse.json({ error: "Campaign not found" }, { status: 404 })
    }

    // Increment scan count
    await incrementScanCount(campaignId)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error incrementing scan count:", error)
    return NextResponse.json(
      { error: "Failed to increment scan count" },
      { status: 500 }
    )
  }
}
