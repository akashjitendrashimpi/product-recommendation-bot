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

    // Get task
    const { data: task, error: taskError } = await (supabaseAdmin as any)
      .from('tasks')
      .select('*')
      .eq('id', taskId)
      .eq('is_active', true)
      .single()

    if (taskError || !task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 })
    }

    // Check already completed
    const { data: existing } = await (supabaseAdmin as any)
      .from('task_completions')
      .select('id, status')
      .eq('task_id', taskId)
      .eq('user_id', session.userId)
      .neq('status', 'rejected')
      .single()

    if (existing) {
      return NextResponse.json({ error: "Task already completed" }, { status: 400 })
    }

    // Create completion record with pending_verification status
    const { data: completion, error: completionError } = await (supabaseAdmin as any)
      .from('task_completions')
      .insert({
        task_id: taskId,
        user_id: session.userId,
        status: 'pending_verification',
        user_payout: task.user_payout || task.reward || 0,
        network_payout: task.network_payout || 0,
        completed_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (completionError) throw completionError

    // Update daily earnings (pending until verified)
    const today = new Date().toISOString().split('T')[0]
    const { data: existing_earning } = await (supabaseAdmin as any)
      .from('user_earnings')
      .select('id, daily_earnings, tasks_completed')
      .eq('user_id', session.userId)
      .eq('date', today)
      .single()

    if (existing_earning) {
      await (supabaseAdmin as any)
        .from('user_earnings')
        .update({
          tasks_completed: (existing_earning.tasks_completed || 0) + 1,
          updated_at: new Date().toISOString()
        })
        .eq('id', existing_earning.id)
    } else {
      await (supabaseAdmin as any)
        .from('user_earnings')
        .insert({
          user_id: session.userId,
          date: today,
          amount: 0,
          daily_earnings: 0,
          tasks_completed: 1,
          earning_type: 'task',
        })
    }

    return NextResponse.json({
      success: true,
      completion,
      message: "Task recorded! Please upload proof to get paid."
    })

  } catch (error) {
    console.error('Error completing task:', error)
    return NextResponse.json({ error: 'Failed to complete task' }, { status: 500 })
  }
}