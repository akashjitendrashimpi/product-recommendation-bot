import { NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/auth/session"
import { createCampaign, getAllCampaigns, getCampaignsByUserId } from "@/lib/db/campaigns"

export async function GET(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const url = new URL(request.url)
    const all = url.searchParams.get("all") === "true"

    let campaigns
    if (all && session.isAdmin) {
      campaigns = await getAllCampaigns()
    } else {
      campaigns = await getCampaignsByUserId(session.userId)
    }

    return NextResponse.json({ campaigns })
  } catch (error) {
    console.error("Error fetching campaigns:", error)
    return NextResponse.json(
      { error: "Failed to fetch campaigns" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Only admin can create campaigns
    if (!session.isAdmin) {
      return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 })
    }

    const data = await request.json()

    const campaign = await createCampaign({
      ...data,
      user_id: session.userId, // Admin's user_id
    })

    return NextResponse.json({ campaign }, { status: 201 })
  } catch (error) {
    console.error("Error creating campaign:", error)
    return NextResponse.json(
      { error: "Failed to create campaign" },
      { status: 500 }
    )
  }
}
