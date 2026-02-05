import { query, queryOne, execute } from "./connection"
import type { QRCampaign } from "@/lib/types"

// Get all campaigns
export async function getAllCampaigns(): Promise<QRCampaign[]> {
  return query<QRCampaign>(
    `SELECT * FROM qr_campaigns ORDER BY created_at DESC`
  )
}

// Get campaigns by user ID
export async function getCampaignsByUserId(userId: number): Promise<QRCampaign[]> {
  return query<QRCampaign>(
    `SELECT * FROM qr_campaigns WHERE user_id = ? ORDER BY created_at DESC`,
    [userId]
  )
}

// Get campaign by ID
export async function getCampaignById(id: number): Promise<QRCampaign | null> {
  return queryOne<QRCampaign>(`SELECT * FROM qr_campaigns WHERE id = ?`, [id])
}

// Get campaign by code
export async function getCampaignByCode(
  code: string
): Promise<QRCampaign | null> {
  return queryOne<QRCampaign>(
    `SELECT * FROM qr_campaigns WHERE campaign_code = ? AND is_active = TRUE`,
    [code]
  )
}

// Create campaign
export async function createCampaign(data: {
  campaign_name: string
  campaign_code: string
  description?: string | null
  location?: string | null
  user_id: number
}): Promise<QRCampaign> {
  const result = await execute(
    `INSERT INTO qr_campaigns (
      campaign_name, campaign_code, description, location, user_id
    ) VALUES (?, ?, ?, ?, ?)`,
    [
      data.campaign_name,
      data.campaign_code,
      data.description || null,
      data.location || null,
      data.user_id,
    ]
  )

  if (!result.insertId) {
    throw new Error("Failed to create campaign")
  }

  const campaign = await getCampaignById(result.insertId)
  if (!campaign) throw new Error("Failed to create campaign")
  return campaign
}

// Update campaign
export async function updateCampaign(
  id: number,
  data: {
    campaign_name?: string
    campaign_code?: string
    description?: string | null
    location?: string | null
    is_active?: boolean
    scan_count?: number
  }
): Promise<void> {
  const updates: string[] = []
  const values: any[] = []

  if (data.campaign_name !== undefined) {
    updates.push("campaign_name = ?")
    values.push(data.campaign_name)
  }
  if (data.campaign_code !== undefined) {
    updates.push("campaign_code = ?")
    values.push(data.campaign_code)
  }
  if (data.description !== undefined) {
    updates.push("description = ?")
    values.push(data.description)
  }
  if (data.location !== undefined) {
    updates.push("location = ?")
    values.push(data.location)
  }
  if (data.is_active !== undefined) {
    updates.push("is_active = ?")
    values.push(data.is_active)
  }
  if (data.scan_count !== undefined) {
    updates.push("scan_count = ?")
    values.push(data.scan_count)
  }

  if (updates.length === 0) return

  values.push(id)
  await execute(`UPDATE qr_campaigns SET ${updates.join(", ")} WHERE id = ?`, values)
}

// Increment scan count
export async function incrementScanCount(id: number): Promise<void> {
  await execute(
    `UPDATE qr_campaigns SET scan_count = scan_count + 1 WHERE id = ?`,
    [id]
  )
}

// Delete campaign
export async function deleteCampaign(id: number): Promise<void> {
  await execute("DELETE FROM qr_campaigns WHERE id = ?", [id])
}
