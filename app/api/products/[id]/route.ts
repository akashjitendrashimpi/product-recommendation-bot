import { NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/auth/session"
import { getProductById, updateProduct, deleteProduct } from "@/lib/db/products"
import { getUserById } from "@/lib/db/users"

interface RouteContext {
  params: Promise<{ id: string }>
}

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params
    const productId = parseInt(id, 10)
    if (isNaN(productId)) {
      return NextResponse.json({ error: "Invalid product ID" }, { status: 400 })
    }
    const product = await getProductById(productId)

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    return NextResponse.json({ product })
  } catch (error) {
    console.error("Error fetching product:", error)
    return NextResponse.json(
      { error: "Failed to fetch product" },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await context.params
    const productId = parseInt(id, 10)
    if (isNaN(productId)) {
      return NextResponse.json({ error: "Invalid product ID" }, { status: 400 })
    }
    const product = await getProductById(productId)

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    // Check ownership or admin
    if (product.user_id !== session.userId) {
      const user = await getUserById(session.userId)
      if (!user?.is_admin) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 })
      }
    }

    const data = await request.json()
    await updateProduct(productId, data)

    const updated = await getProductById(productId)
    return NextResponse.json({ product: updated })
  } catch (error) {
    console.error("Error updating product:", error)
    return NextResponse.json(
      { error: "Failed to update product" },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await context.params
    const productId = parseInt(id, 10)
    if (isNaN(productId)) {
      return NextResponse.json({ error: "Invalid product ID" }, { status: 400 })
    }
    const product = await getProductById(productId)

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    // Check ownership or admin
    if (product.user_id !== session.userId) {
      const user = await getUserById(session.userId)
      if (!user?.is_admin) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 })
      }
    }

    await deleteProduct(productId)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting product:", error)
    return NextResponse.json(
      { error: "Failed to delete product" },
      { status: 500 }
    )
  }
}
