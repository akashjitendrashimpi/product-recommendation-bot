import { NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/auth/session"
import { supabaseAdmin } from "@/lib/supabase/client"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const { data: product, error } = await (supabaseAdmin as any)
      .from("products")
      .select("*")
      .eq("id", parseInt(id))
      .single()

    if (error || !product) return NextResponse.json({ error: "Product not found" }, { status: 404 })

    // Increment views
    await (supabaseAdmin as any)
      .from("products")
      .update({ views: (product.views || 0) + 1 })
      .eq("id", parseInt(id))

    // Get similar products (same category)
    const { data: similar } = await (supabaseAdmin as any)
      .from("products")
      .select("*")
      .eq("category", product.category)
      .eq("is_active", true)
      .neq("id", parseInt(id))
      .limit(4)

    return NextResponse.json({ product, similar: similar || [] })
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch product" }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession()
    if (!session?.isAdmin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { id } = await params
    const data = await request.json()

    const { data: product, error } = await (supabaseAdmin as any)
      .from("products")
      .update({ ...data, updated_at: new Date().toISOString() })
      .eq("id", parseInt(id))
      .select()
      .single()

    if (error) throw error
    return NextResponse.json({ product })
  } catch (error) {
    return NextResponse.json({ error: "Failed to update product" }, { status: 500 })
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
      .from("products")
      .delete()
      .eq("id", parseInt(id))

    if (error) throw error
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete product" }, { status: 500 })
  }
}