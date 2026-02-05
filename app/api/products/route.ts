import { NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/auth/session"
import { createProduct, getAllProducts, getProductsByUserId } from "@/lib/db/products"

export async function GET(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const url = new URL(request.url)
    const all = url.searchParams.get("all") === "true"

    let products
    if (all && session.isAdmin) {
      products = await getAllProducts()
    } else {
      products = await getProductsByUserId(session.userId)
    }

    return NextResponse.json({ products })
  } catch (error) {
    console.error("Error fetching products:", error)
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Only admin can create products
    if (!session.isAdmin) {
      return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 })
    }

    const data = await request.json()

    const product = await createProduct({
      ...data,
      user_id: session.userId, // Admin's user_id
    })

    return NextResponse.json({ product }, { status: 201 })
  } catch (error) {
    console.error("Error creating product:", error)
    return NextResponse.json(
      { error: "Failed to create product" },
      { status: 500 }
    )
  }
}
