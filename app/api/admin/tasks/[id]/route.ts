import { NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/auth/session"
import { supabaseAdmin } from "@/lib/supabase/client"

// Only these columns exist in the tasks table — never spread unknown fields
const ALLOWED_COLUMNS = new Set([
  'title', 'description', 'task_url', 'app_name', 'app_icon_url',
  'action_type', 'network_payout', 'user_payout', 'reward',
  'country_code', 'country', 'currency', 'is_active', 'requires_proof',
  'proof_instructions', 'max_completions', 'has_detail_page',
  'how_to_steps', 'copy_prompts', 'expires_at', 'requirements',
  'sort_order', // ← for drag reorder
])

// Always coerce these to arrays
const JSONB_ARRAY_COLUMNS = new Set(['how_to_steps', 'copy_prompts'])

// Always coerce these to numbers
const NUMERIC_COLUMNS = new Set(['network_payout', 'user_payout', 'reward', 'max_completions', 'sort_order'])

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession()
    if (!session || !session.isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const taskId = parseInt(id)
    if (isNaN(taskId)) {
      return NextResponse.json({ error: "Invalid task ID" }, { status: 400 })
    }

    const data = await request.json()
    if (!data || typeof data !== 'object' || Array.isArray(data)) {
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 })
    }

    // Strip computed/unknown fields, coerce types
    const updates: Record<string, any> = { updated_at: new Date().toISOString() }

    for (const [key, value] of Object.entries(data)) {
      if (!ALLOWED_COLUMNS.has(key)) continue

      if (JSONB_ARRAY_COLUMNS.has(key)) {
        updates[key] = Array.isArray(value) ? value : []
      } else if (NUMERIC_COLUMNS.has(key)) {
        if (value === null || value === '') {
          updates[key] = null
        } else {
          const num = Number(value)
          updates[key] = isNaN(num) ? null : num
        }
      } else {
        updates[key] = value
      }
    }

    // Nothing to update
    if (Object.keys(updates).length <= 1) {
      return NextResponse.json({ error: "No valid fields to update" }, { status: 400 })
    }

    const { error } = await (supabaseAdmin as any)
      .from('tasks')
      .update(updates)
      .eq('id', taskId)

    if (error) {
      console.error('Supabase update error:', error)
      return NextResponse.json({ error: error.message || 'Database error' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating task:', error)
    return NextResponse.json({ error: 'Failed to update task' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession()
    if (!session || !session.isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const taskId = parseInt(id)
    if (isNaN(taskId)) {
      return NextResponse.json({ error: "Invalid task ID" }, { status: 400 })
    }

    const { error } = await (supabaseAdmin as any)
      .from('tasks')
      .delete()
      .eq('id', taskId)

    if (error) {
      console.error('Supabase delete error:', error)
      return NextResponse.json({ error: error.message || 'Database error' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting task:', error)
    return NextResponse.json({ error: 'Failed to delete task' }, { status: 500 })
  }
}