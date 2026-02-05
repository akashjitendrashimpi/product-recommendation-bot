import { NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/auth/session"
import { getCampaignById, updateCampaign, deleteCampaign } from "@/lib/db/campaigns"
import { getUserById } from "@/lib/db/users"

interface RouteContext {
  params: Promise<{ id: string }>
}

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params
    const campaignId = parseInt(id, 10)
    if (isNaN(campaignId)) {
      return NextResponse.json({ error: "Invalid campaign ID" }, { status: 400 })
    }
    const campaign = await getCampaignById(campaignId)

    if (!campaign) {
      return NextResponse.json({ error: "Campaign not found" }, { status: 404 })
    }

    return NextResponse.json({ campaign })
  } catch (error) {
    console.error("Error fetching campaign:", error)
    return NextResponse.json(
      { error: "Failed to fetch campaign" },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await context.params
    const campaignId = parseInt(id, 10)
    if (isNaN(campaignId)) {
      return NextResponse.json({ error: "Invalid campaign ID" }, { status: 400 })
    }
    const campaign = await getCampaignById(campaignId)

    if (!campaign) {
      return NextResponse.json({ error: "Campaign not found" }, { status: 404 })
    }

    // Check ownership or admin
    if (campaign.user_id !== session.userId) {
      const user = await getUserById(session.userId)
      if (!user?.is_admin) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 })
      }
    }

    const data = await request.json()
    await updateCampaign(campaignId, data)

    const updated = await getCampaignById(campaignId)
    return NextResponse.json({ campaign: updated })
  } catch (error) {
    console.error("Error updating campaign:", error)
    return NextResponse.json(
      { error: "Failed to update campaign" },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await context.params
    const campaignId = parseInt(id, 10)
    if (isNaN(campaignId)) {
      return NextResponse.json({ error: "Invalid campaign ID" }, { status: 400 })
    }
    const campaign = await getCampaignById(campaignId)

    if (!campaign) {
      return NextResponse.json({ error: "Campaign not found" }, { status: 404 })
    }

    // Check ownership or admin
    if (campaign.user_id !== session.userId) {
      const user = await getUserById(session.userId)
      if (!user?.is_admin) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 })
      }
    }

    await deleteCampaign(campaignId)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting campaign:", error)
    return NextResponse.json(
      { error: "Failed to delete campaign" },
      { status: 500 }
    )
  }
}
