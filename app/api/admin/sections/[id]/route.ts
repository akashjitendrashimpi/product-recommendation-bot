import { NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/auth/session"
import { supabaseAdmin } from "@/lib/supabase/client"

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession()
    if (!session?.isAdmin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { id } = await params
    const data = await request.json()

    const { error } = await (supabaseAdmin as any)
      .from("product_sections")
      .update(data)
      .eq("id", parseInt(id))

    if (error) throw error
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: "Failed to update section" }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession()
    if (!session?.isAdmin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { id } = await params

    const { error } = await (supabaseAdmin as any)
      .from("product_sections")
      .delete()
      .eq("id", parseInt(id))

    if (error) throw error
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete section" }, { status: 500 })
  }
}