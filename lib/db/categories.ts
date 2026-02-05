import { query, queryOne, execute } from "./connection"
import type { Category } from "@/lib/types"

// Get all categories
export async function getAllCategories(): Promise<Category[]> {
  return query<Category>(`SELECT * FROM categories ORDER BY name`)
}

// Get category by ID
export async function getCategoryById(id: number): Promise<Category | null> {
  return queryOne<Category>(`SELECT * FROM categories WHERE id = ?`, [id])
}

// Get category by name
export async function getCategoryByName(name: string): Promise<Category | null> {
  return queryOne<Category>(`SELECT * FROM categories WHERE name = ?`, [name])
}

// Create category
export async function createCategory(data: {
  name: string
  description?: string | null
  icon?: string | null
}): Promise<Category> {
  const result = await execute(
    `INSERT INTO categories (name, description, icon) VALUES (?, ?, ?)`,
    [data.name, data.description || null, data.icon || null]
  )

  if (!result.insertId) {
    throw new Error("Failed to create category")
  }

  const category = await getCategoryById(result.insertId)
  if (!category) throw new Error("Failed to create category")
  return category
}

// Update category
export async function updateCategory(
  id: number,
  data: {
    name?: string
    description?: string | null
    icon?: string | null
  }
): Promise<void> {
  const updates: string[] = []
  const values: any[] = []

  if (data.name !== undefined) {
    updates.push("name = ?")
    values.push(data.name)
  }
  if (data.description !== undefined) {
    updates.push("description = ?")
    values.push(data.description)
  }
  if (data.icon !== undefined) {
    updates.push("icon = ?")
    values.push(data.icon)
  }

  if (updates.length === 0) return

  values.push(id)
  await execute(`UPDATE categories SET ${updates.join(", ")} WHERE id = ?`, values)
}

// Delete category
export async function deleteCategory(id: number): Promise<void> {
  await execute("DELETE FROM categories WHERE id = ?", [id])
}
