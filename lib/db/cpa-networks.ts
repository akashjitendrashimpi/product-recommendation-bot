import { query, queryOne, execute } from "./connection"
import type { CPANetwork } from "@/lib/types"

// Get all CPA networks
export async function getAllNetworks(): Promise<CPANetwork[]> {
  return query<CPANetwork>(
    `SELECT * FROM cpa_networks ORDER BY name ASC`
  )
}

// Get network by ID
export async function getNetworkById(id: number): Promise<CPANetwork | null> {
  return queryOne<CPANetwork>(
    `SELECT * FROM cpa_networks WHERE id = ?`,
    [id]
  )
}

// Get network by name
export async function getNetworkByName(name: string): Promise<CPANetwork | null> {
  return queryOne<CPANetwork>(
    `SELECT * FROM cpa_networks WHERE name = ?`,
    [name]
  )
}

// Create CPA network
export async function createNetwork(data: {
  name: string
  api_key?: string | null
  api_secret?: string | null
  country_filter?: string
  is_active?: boolean
}): Promise<CPANetwork> {
  const result = await execute(
    `INSERT INTO cpa_networks (name, api_key, api_secret, country_filter, is_active)
     VALUES (?, ?, ?, ?, ?)`,
    [
      data.name,
      data.api_key || null,
      data.api_secret || null,
      data.country_filter || "IN",
      data.is_active !== undefined ? data.is_active : true,
    ]
  )

  if (!result.insertId) {
    throw new Error("Failed to create network")
  }

  return getNetworkById(result.insertId) as Promise<CPANetwork>
}

// Update CPA network
export async function updateNetwork(
  id: number,
  data: {
    name?: string
    api_key?: string | null
    api_secret?: string | null
    country_filter?: string
    is_active?: boolean
  }
): Promise<void> {
  const updates: string[] = []
  const values: any[] = []

  if (data.name !== undefined) {
    updates.push("name = ?")
    values.push(data.name)
  }
  if (data.api_key !== undefined) {
    updates.push("api_key = ?")
    values.push(data.api_key)
  }
  if (data.api_secret !== undefined) {
    updates.push("api_secret = ?")
    values.push(data.api_secret)
  }
  if (data.country_filter !== undefined) {
    updates.push("country_filter = ?")
    values.push(data.country_filter)
  }
  if (data.is_active !== undefined) {
    updates.push("is_active = ?")
    values.push(data.is_active)
  }

  if (updates.length === 0) return

  values.push(id)
  await execute(
    `UPDATE cpa_networks SET ${updates.join(", ")} WHERE id = ?`,
    values
  )
}

// Delete CPA network
export async function deleteNetwork(id: number): Promise<void> {
  await execute("DELETE FROM cpa_networks WHERE id = ?", [id])
}
