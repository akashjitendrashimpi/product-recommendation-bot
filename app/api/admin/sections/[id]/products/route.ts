import { NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/auth/session"
import { supabaseAdmin } from "@/lib/supabase/client"

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession()
    if (!session?.isAdmin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { id } = await params
    const { product_id } = await request.json()

    const { error } = await (supabaseAdmin as any)
      .from("section_products")
      .insert({ section_id: parseInt(id), product_id })

    if (error) {
      if (error.code === '23505') return NextResponse.json({ error: "Product already in section" }, { status: 400 })
      throw error
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: "Failed to add product" }, { status: 500 })
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
    const { product_id } = await request.json()

    const { error } = await (supabaseAdmin as any)
      .from("section_products")
      .delete()
      .eq("section_id", parseInt(id))
      .eq("product_id", product_id)

    if (error) throw error
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: "Failed to remove product" }, { status: 500 })
  }
}