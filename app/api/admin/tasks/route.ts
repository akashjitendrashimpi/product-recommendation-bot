import { NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/auth/session"
import { createTask, getTasksByNetwork } from "@/lib/db/tasks"
import { supabaseAdmin } from "@/lib/supabase/client"

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
      // Admin gets ALL tasks — no filtering by slot limits
      const { data, error } = await (supabaseAdmin as any)
        .from('tasks')
        .select('*')
        .order('created_at', { ascending: false })
      if (error) throw error
      tasks = data || []
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
      max_completions: data.max_completions ? parseInt(data.max_completions) : null,
      requires_proof: data.requires_proof ?? true,
      proof_instructions: data.proof_instructions || null,
      has_detail_page: data.has_detail_page ?? false,
      how_to_steps: data.how_to_steps || [],
      copy_prompts: data.copy_prompts || [],
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