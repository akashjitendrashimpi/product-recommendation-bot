import { NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/auth/session"
import { supabaseAdmin } from "@/lib/supabase/client"

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession()
    if (!session || !session.isAdmin)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { id } = await params
    const userId = parseInt(id)
    const data = await request.json()

    // Security: whitelist allowed fields only
    const allowed = ['is_admin', 'is_banned', 'ban_reason', 'display_name', 'upi_id', 'phone']
    const updates: Record<string, any> = {}
    for (const key of allowed) {
      if (key in data) updates[key] = data[key]
    }

    if (Object.keys(updates).length === 0)
      return NextResponse.json({ error: "No valid fields to update" }, { status: 400 })

    const { error } = await (supabaseAdmin as any)
      .from('users')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', userId)

    if (error) throw error
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating user:', error)
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession()
    if (!session || !session.isAdmin)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { id } = await params
    const userId = parseInt(id)

    // Security: prevent deleting yourself
    if (userId === session.userId)
      return NextResponse.json({ error: "You cannot delete your own account" }, { status: 400 })

    // Security: prevent deleting admins
    const { data: user } = await (supabaseAdmin as any)
      .from('users')
      .select('is_admin')
      .eq('id', userId)
      .single()

    if (user?.is_admin)
      return NextResponse.json({ error: "Cannot delete an admin. Remove admin role first." }, { status: 400 })

    // Delete all related data first
    await Promise.all([
      (supabaseAdmin as any).from('task_completions').delete().eq('user_id', userId),
      (supabaseAdmin as any).from('user_earnings').delete().eq('user_id', userId),
      (supabaseAdmin as any).from('payments').delete().eq('user_id', userId),
    ])

    // Then delete user
    const { error } = await (supabaseAdmin as any)
      .from('users')
      .delete()
      .eq('id', userId)

    if (error) throw error
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting user:', error)
    return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 })
  }
}