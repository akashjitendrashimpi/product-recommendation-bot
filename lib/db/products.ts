import { supabaseAdmin } from '@/lib/supabase/client'
import type { Product } from '@/lib/types'

// Get all products
export async function getAllProducts(): Promise<Product[]> {
  const { data, error } = await supabaseAdmin
    .from('products')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw error
  return (data || []) as Product[]
}

// Get products by user ID
export async function getProductsByUserId(userId: number): Promise<Product[]> {
  const { data, error } = await supabaseAdmin
    .from('products')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return (data || []) as Product[]
}

// Get product by ID
export async function getProductById(id: number): Promise<Product | null> {
  const { data, error } = await supabaseAdmin
    .from('products')
    .select('*')
    .eq('id', id)
    .single()

  if (error && error.code !== 'PGRST116') throw error
  return (data || null) as Product | null
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
  const { data: product, error } = await supabaseAdmin
    .from('products')
    .insert({
      product_id: data.product_id,
      name: data.name,
      category: data.category,
      price: data.price,
      image_url: data.image_url || null,
      description: data.description || null,
      amazon_link: data.amazon_link || null,
      flipkart_link: data.flipkart_link || null,
      quality_score: data.quality_score || 5,
      popularity_score: data.popularity_score || 5,
      user_id: data.user_id,
    })
    .select()
    .single()

  if (error) throw error
  if (!product) throw new Error('Failed to create product')
  return product as Product
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
  const updates: Record<string, any> = {}

  if (data.product_id !== undefined) updates.product_id = data.product_id
  if (data.name !== undefined) updates.name = data.name
  if (data.category !== undefined) updates.category = data.category
  if (data.price !== undefined) updates.price = data.price
  if (data.image_url !== undefined) updates.image_url = data.image_url
  if (data.description !== undefined) updates.description = data.description
  if (data.amazon_link !== undefined) updates.amazon_link = data.amazon_link
  if (data.flipkart_link !== undefined) updates.flipkart_link = data.flipkart_link
  if (data.quality_score !== undefined) updates.quality_score = data.quality_score
  if (data.popularity_score !== undefined) updates.popularity_score = data.popularity_score

  if (Object.keys(updates).length === 0) return

  const { error } = await supabaseAdmin
    .from('products')
    .update(updates)
    .eq('id', id)

  if (error) throw error
}

// Delete product
export async function deleteProduct(id: number): Promise<void> {
  const { error } = await supabaseAdmin
    .from('products')
    .delete()
    .eq('id', id)

  if (error) throw error
}
