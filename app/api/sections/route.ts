import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase/client"

export async function GET() {
  try {
    const { data: sections, error } = await (supabaseAdmin as any)
      .from("product_sections")
      .select("*")
      .eq("is_active", true)
      .order("sort_order", { ascending: true })

    if (error) throw error

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
            .select("id, name, category, price, discount_price, image_url, description, amazon_link, flipkart_link, quality_score, popularity_score, badge, is_featured, views")
            .in("id", productIds)
            .eq("is_active", true)
          products = productData || []
          products.sort((a: any, b: any) => productIds.indexOf(a.id) - productIds.indexOf(b.id))
        }

        return { ...section, products }
      })
    )

    return NextResponse.json({ sections: sectionsWithProducts })
  } catch (error) {
    console.error("Error fetching sections:", error)
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 })
  }
}