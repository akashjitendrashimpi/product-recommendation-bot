import { supabaseAdmin } from '@/lib/supabase/client'
import type { CPANetwork } from '@/lib/types'

export async function getAllNetworks(): Promise<CPANetwork[]> {
  const { data, error } = await supabaseAdmin
    .from('cpa_networks')
    .select('*')
    .order('name', { ascending: true })
  if (error) throw error
  return (data || []) as CPANetwork[]
}

export async function getNetworkById(id: number): Promise<CPANetwork | null> {
  const { data, error } = await supabaseAdmin
    .from('cpa_networks')
    .select('*')
    .eq('id', id)
    .single()
  if (error && error.code !== 'PGRST116') throw error
  return (data || null) as CPANetwork | null
}

export async function getNetworkByName(name: string): Promise<CPANetwork | null> {
  const { data, error } = await supabaseAdmin
    .from('cpa_networks')
    .select('*')
    .eq('name', name)
    .single()
  if (error && error.code !== 'PGRST116') throw error
  return (data || null) as CPANetwork | null
}

export async function createNetwork(data: {
  name: string
  api_key?: string | null
  api_secret?: string | null
  country_filter?: string
  is_active?: boolean
}): Promise<CPANetwork> {
  const { data: network, error } = await supabaseAdmin
    .from('cpa_networks')
    .insert({
      name: data.name,
      api_key: data.api_key || null,
      api_secret: data.api_secret || null,
      country_filter: data.country_filter || 'IN',
      is_active: data.is_active !== undefined ? data.is_active : true,
    })
    .select()
    .single()
  if (error) throw error
  return network as CPANetwork
}

export async function updateNetwork(id: number, data: Partial<CPANetwork>): Promise<void> {
  const updates: Record<string, any> = {}
  Object.keys(data).forEach(key => {
    if (data[key as keyof CPANetwork] !== undefined) {
      updates[key] = data[key as keyof CPANetwork]
    }
  })
  if (Object.keys(updates).length === 0) return
  const { error } = await supabaseAdmin
    .from('cpa_networks')
    .update(updates)
    .eq('id', id)
  if (error) throw error
}

export async function deleteNetwork(id: number): Promise<void> {
  const { error } = await supabaseAdmin
    .from('cpa_networks')
    .delete()
    .eq('id', id)
  if (error) throw error
}