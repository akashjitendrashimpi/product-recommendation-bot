import { NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/auth/session"
import { createProduct, getAllProducts } from "@/lib/db/products"
import { supabaseAdmin } from "@/lib/supabase/client"

export async function GET(request: NextRequest) {
  try {
    // Products are public — no auth required for viewing
    const products = await getAllProducts()
    return NextResponse.json({ products })
  } catch (error) {
    console.error("Error fetching products:", error)
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    if (!session.isAdmin) {
      return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 })
    }

    const data = await request.json()

    if (!data.name || !data.category || !data.price) {
      return NextResponse.json({ error: "Name, category and price are required" }, { status: 400 })
    }

    const product = await createProduct({
      product_id: data.product_id || `manual_${Date.now()}`,
      name: data.name,
      category: data.category,
      price: parseFloat(data.price),
      image_url: data.image_url || null,
      description: data.description || null,
      amazon_link: data.amazon_link || null,
      flipkart_link: data.flipkart_link || null,
      quality_score: parseFloat(data.quality_score) || 5,
      popularity_score: parseFloat(data.popularity_score) || 5,
      user_id: session.userId,
    })

    return NextResponse.json({ product }, { status: 201 })
  } catch (error) {
    console.error("Error creating product:", error)
    return NextResponse.json({ error: "Failed to create product" }, { status: 500 })
  }
}