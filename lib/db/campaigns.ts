import { supabaseAdmin } from '@/lib/supabase/client'
import type { QRCampaign } from '@/lib/types'

export async function getAllCampaigns(): Promise<QRCampaign[]> {
  const { data, error } = await supabaseAdmin
    .from('qr_campaigns')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw error
  return (data || []) as QRCampaign[]
}

export async function getCampaignsByUserId(userId: number): Promise<QRCampaign[]> {
  const { data, error } = await supabaseAdmin
    .from('qr_campaigns')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return (data || []) as QRCampaign[]
}

export async function getCampaignById(id: number): Promise<QRCampaign | null> {
  const { data, error } = await supabaseAdmin
    .from('qr_campaigns')
    .select('*')
    .eq('id', id)
    .single()
  if (error && error.code !== 'PGRST116') throw error
  return (data || null) as QRCampaign | null
}

export async function getCampaignByCode(code: string): Promise<QRCampaign | null> {
  const { data, error } = await supabaseAdmin
    .from('qr_campaigns')
    .select('*')
    .eq('campaign_code', code)
    .eq('is_active', true)
    .single()
  if (error && error.code !== 'PGRST116') throw error
  return (data || null) as QRCampaign | null
}

export async function createCampaign(data: {
  campaign_name: string
  campaign_code: string
  description?: string | null
  location?: string | null
  user_id: number
}): Promise<QRCampaign> {
  const { data: campaign, error } = await supabaseAdmin
    .from('qr_campaigns')
    .insert(data)
    .select()
    .single()
  if (error) throw error
  return campaign as QRCampaign
}

export async function updateCampaign(
  id: number,
  data: Partial<QRCampaign>
): Promise<void> {
  const updates: Record<string, any> = {}
  Object.keys(data).forEach(key => {
    if (data[key as keyof QRCampaign] !== undefined) {
      updates[key] = data[key as keyof QRCampaign]
    }
  })
  if (Object.keys(updates).length === 0) return
  const { error } = await supabaseAdmin
    .from('qr_campaigns')
    .update(updates)
    .eq('id', id)
  if (error) throw error
}

export async function incrementScanCount(id: number): Promise<void> {
  const campaign = await getCampaignById(id)
  if (!campaign) throw new Error('Campaign not found')
  const { error } = await supabaseAdmin
    .from('qr_campaigns')
    .update({ scan_count: (campaign.scan_count || 0) + 1 })
    .eq('id', id)
  if (error) throw error
}

export async function deleteCampaign(id: number): Promise<void> {
  const { error } = await supabaseAdmin
    .from('qr_campaigns')
    .delete()
    .eq('id', id)
  if (error) throw error
}