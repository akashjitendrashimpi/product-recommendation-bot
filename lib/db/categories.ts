import { supabaseAdmin } from '@/lib/supabase/client'
import type { Category } from '@/lib/types'

// Get all categories
export async function getAllCategories(): Promise<Category[]> {
  const { data, error } = await supabaseAdmin
    .from('categories')
    .select('*')
    .order('name', { ascending: true })

  if (error) throw error
  return (data || []) as Category[]
}

// Get category by ID
export async function getCategoryById(id: number): Promise<Category | null> {
  const { data, error } = await supabaseAdmin
    .from('categories')
    .select('*')
    .eq('id', id)
    .single()

  if (error && error.code !== 'PGRST116') throw error
  return (data || null) as Category | null
}

// Get category by name
export async function getCategoryByName(name: string): Promise<Category | null> {
  const { data, error } = await supabaseAdmin
    .from('categories')
    .select('*')
    .eq('name', name)
    .single()

  if (error && error.code !== 'PGRST116') throw error
  return (data || null) as Category | null
}

// Create category
export async function createCategory(data: {
  name: string
  description?: string | null
  icon?: string | null
}): Promise<Category> {
  const { data: category, error } = await supabaseAdmin
    .from('categories')
    .insert({
      name: data.name,
      description: data.description || null,
      icon: data.icon || null,
    })
    .select()
    .single()

  if (error) throw error
  if (!category) throw new Error('Failed to create category')
  return category as Category
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
  const updates: Record<string, any> = {}

  if (data.name !== undefined) updates.name = data.name
  if (data.description !== undefined) updates.description = data.description
  if (data.icon !== undefined) updates.icon = data.icon

  if (Object.keys(updates).length === 0) return

  const { error } = await supabaseAdmin
    .from('categories')
    .update(updates)
    .eq('id', id)

  if (error) throw error
}

// Delete category
export async function deleteCategory(id: number): Promise<void> {
  const { error } = await supabaseAdmin
    .from('categories')
    .delete()
    .eq('id', id)

  if (error) throw error
}
