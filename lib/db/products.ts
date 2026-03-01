import { supabaseAdmin } from '@/lib/supabase/client'
import type { Product } from '@/lib/types'

export async function getAllProducts(): Promise<Product[]> {
  const { data, error } = await (supabaseAdmin as any)
    .from('products')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: false })

  if (error) throw error
  return (data || []) as Product[]
}

export async function getProductsByUserId(userId: number): Promise<Product[]> {
  const { data, error } = await (supabaseAdmin as any)
    .from('products')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return (data || []) as Product[]
}

export async function getProductById(id: number): Promise<Product | null> {
  const { data, error } = await (supabaseAdmin as any)
    .from('products')
    .select('*')
    .eq('id', id)
    .single()

  if (error && error.code !== 'PGRST116') throw error
  return (data || null) as Product | null
}

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
  const { data: product, error } = await (supabaseAdmin as any)
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
      is_active: true,
    })
    .select()
    .single()

  if (error) throw error
  if (!product) throw new Error('Failed to create product')
  return product as Product
}

export async function updateProduct(id: number, data: {
  name?: string
  category?: string
  price?: number
  image_url?: string | null
  description?: string | null
  amazon_link?: string | null
  flipkart_link?: string | null
  quality_score?: number
  popularity_score?: number
}): Promise<void> {
  const updates: Record<string, any> = {}
  Object.keys(data).forEach(key => {
    if ((data as any)[key] !== undefined) updates[key] = (data as any)[key]
  })
  if (Object.keys(updates).length === 0) return

  const { error } = await (supabaseAdmin as any)
    .from('products')
    .update(updates)
    .eq('id', id)

  if (error) throw error
}

export async function deleteProduct(id: number): Promise<void> {
  const { error } = await (supabaseAdmin as any)
    .from('products')
    .delete()
    .eq('id', id)

  if (error) throw error
}