import { NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/auth/session"
import { supabaseAdmin } from "@/lib/supabase/client"

export async function GET() {
  try {
    const { data: sections, error } = await (supabaseAdmin as any)
      .from("product_sections")
      .select("*")
      .order("sort_order", { ascending: true })

    if (error) throw error

    // For each section, get its products
    const sectionsWithProducts = await Promise.all(
      (sections || []).map(async (section: any) => {
        const { data: sectionProducts } = await (supabaseAdmin as any)
          .from("section_products")
          .select("product_id, sort_order")
          .eq("section_id", section.id)
          .order("sort_order", { ascending: true })

        const productIds = (sectionProducts || []).map((sp: any) => sp.product_id)

        let products: any[] = []
        if (productIds.length > 0) {
          const { data: productData } = await (supabaseAdmin as any)
            .from("products")
            .select("*")
            .in("id", productIds)
            .eq("is_active", true)
          products = productData || []
          // Sort by section order
          products.sort((a: any, b: any) => {
            return productIds.indexOf(a.id) - productIds.indexOf(b.id)
          })
        }

        return { ...section, products }
      })
    )

    return NextResponse.json({ sections: sectionsWithProducts })
  } catch (error) {
    console.error("Error fetching sections:", error)
    return NextResponse.json({ error: "Failed to fetch sections" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session?.isAdmin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { title, subtitle, emoji, sort_order } = await request.json()
    if (!title) return NextResponse.json({ error: "Title required" }, { status: 400 })

    const { data, error } = await (supabaseAdmin as any)
      .from("product_sections")
      .insert({ title, subtitle: subtitle || null, emoji: emoji || "🔥", sort_order: sort_order || 0 })
      .select()
      .single()

    if (error) throw error
    return NextResponse.json({ section: { ...data, products: [] } }, { status: 201 })
  } catch (error) {
    console.error("Error creating section:", error)
    return NextResponse.json({ error: "Failed to create section" }, { status: 500 })
  }
}