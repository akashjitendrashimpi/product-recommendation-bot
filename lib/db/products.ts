import { query, queryOne, execute } from "./connection"
import type { Product } from "@/lib/types"

// Get all products
export async function getAllProducts(): Promise<Product[]> {
  return query<Product>(
    `SELECT * FROM products ORDER BY created_at DESC`
  )
}

// Get products by user ID
export async function getProductsByUserId(userId: number): Promise<Product[]> {
  return query<Product>(
    `SELECT * FROM products WHERE user_id = ? ORDER BY created_at DESC`,
    [userId]
  )
}

// Get product by ID
export async function getProductById(id: number): Promise<Product | null> {
  return queryOne<Product>(`SELECT * FROM products WHERE id = ?`, [id])
}

// Create product
export async function createProduct(data: {
  product_id: string
  name: string
  category: string
  price: number
  image_url?: string | null
  description?: string | null
  amazon_link?: string | null
  flipkart_link?: string | null
  quality_score?: number
  popularity_score?: number
  user_id: number
}): Promise<Product> {
  const result = await execute(
    `INSERT INTO products (
      product_id, name, category, price, image_url, description,
      amazon_link, flipkart_link, quality_score, popularity_score, user_id
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      data.product_id,
      data.name,
      data.category,
      data.price,
      data.image_url || null,
      data.description || null,
      data.amazon_link || null,
      data.flipkart_link || null,
      data.quality_score || 5,
      data.popularity_score || 5,
      data.user_id,
    ]
  )

  if (!result.insertId) {
    throw new Error("Failed to create product")
  }

  const product = await getProductById(result.insertId)
  if (!product) throw new Error("Failed to create product")
  return product
}

// Update product
export async function updateProduct(
  id: number,
  data: {
    product_id?: string
    name?: string
    category?: string
    price?: number
    image_url?: string | null
    description?: string | null
    amazon_link?: string | null
    flipkart_link?: string | null
    quality_score?: number
    popularity_score?: number
  }
): Promise<void> {
  const updates: string[] = []
  const values: any[] = []

  if (data.product_id !== undefined) {
    updates.push("product_id = ?")
    values.push(data.product_id)
  }
  if (data.name !== undefined) {
    updates.push("name = ?")
    values.push(data.name)
  }
  if (data.category !== undefined) {
    updates.push("category = ?")
    values.push(data.category)
  }
  if (data.price !== undefined) {
    updates.push("price = ?")
    values.push(data.price)
  }
  if (data.image_url !== undefined) {
    updates.push("image_url = ?")
    values.push(data.image_url)
  }
  if (data.description !== undefined) {
    updates.push("description = ?")
    values.push(data.description)
  }
  if (data.amazon_link !== undefined) {
    updates.push("amazon_link = ?")
    values.push(data.amazon_link)
  }
  if (data.flipkart_link !== undefined) {
    updates.push("flipkart_link = ?")
    values.push(data.flipkart_link)
  }
  if (data.quality_score !== undefined) {
    updates.push("quality_score = ?")
    values.push(data.quality_score)
  }
  if (data.popularity_score !== undefined) {
    updates.push("popularity_score = ?")
    values.push(data.popularity_score)
  }

  if (updates.length === 0) return

  updates.push("updated_at = CURRENT_TIMESTAMP")
  values.push(id)

  await execute(`UPDATE products SET ${updates.join(", ")} WHERE id = ?`, values)
}

// Delete product
export async function deleteProduct(id: number): Promise<void> {
  await execute("DELETE FROM products WHERE id = ?", [id])
}
