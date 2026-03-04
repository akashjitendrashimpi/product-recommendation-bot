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
    const { status, transaction_id } = await request.json()

    if (!["completed", "rejected"].includes(status))
      return NextResponse.json({ error: "Invalid status" }, { status: 400 })

    const { error } = await (supabaseAdmin as any)
      .from("payments")
      .update({
        status,
        transaction_id: transaction_id || null,
        updated_at: new Date().toISOString(),
        paid_at: status === "completed" ? new Date().toISOString() : null,
      })
      .eq("id", parseInt(id))

    if (error) throw error
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: "Failed to update payment" }, { status: 500 })
  }
}