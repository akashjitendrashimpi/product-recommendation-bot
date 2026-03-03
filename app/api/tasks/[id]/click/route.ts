import { NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/auth/session"
import { supabaseAdmin } from "@/lib/supabase/client"

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const taskId = parseInt(id)

    // Get task URL
    const { data: task, error: taskError } = await (supabaseAdmin as any)
      .from('tasks')
      .select('id, task_url, is_active')
      .eq('id', taskId)
      .single()

    if (taskError || !task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 })
    }

    if (!task.is_active) {
      return NextResponse.json({ error: "Task is inactive" }, { status: 400 })
    }

    // Log the click
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
    const userAgent = request.headers.get('user-agent') || 'unknown'

    await (supabaseAdmin as any)
      .from('task_clicks')
      .insert({
        task_id: taskId,
        user_id: session.userId,
        ip_address: ip.split(',')[0].trim(),
        user_agent: userAgent,
        converted: false,
      })

    return NextResponse.json({
      success: true,
      redirect_url: task.task_url
    })
  } catch (error) {
    console.error('Error tracking click:', error)
    return NextResponse.json({ error: 'Failed to track click' }, { status: 500 })
  }
}