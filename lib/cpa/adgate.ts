// AdGate Media (BitLabs) API Integration
// Documentation: Check AdGate Media dashboard for API docs

const ADGATE_API_KEY = process.env.ADGATE_API_KEY
const ADGATE_API_SECRET = process.env.ADGATE_API_SECRET
const ADGATE_BASE_URL = "https://api.adgatemedia.com" // Update with actual API URL from their docs

export interface AdGateOffer {
  id: string
  title: string
  description: string
  payout: number
  currency: string
  country: string
  category: string
  type: "install" | "signup" | "time_spent" | "other"
  url: string
  icon_url?: string
  requirements?: string
}

export interface AdGateResponse {
  success: boolean
  offers?: AdGateOffer[]
  error?: string
}

// Fetch offers from AdGate Media API
export async function fetchAdGateOffers(country: string = "IN"): Promise<AdGateOffer[]> {
  if (!ADGATE_API_KEY || !ADGATE_API_SECRET) {
    throw new Error("AdGate API credentials not configured")
  }

  try {
    // Note: This is a placeholder. You'll need to check AdGate Media's actual API documentation
    // for the correct endpoint, authentication method, and request format.
    
    const response = await fetch(`${ADGATE_BASE_URL}/v1/offers`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${ADGATE_API_KEY}`, // Or whatever auth method they use
        "X-API-Secret": ADGATE_API_SECRET,
        "Content-Type": "application/json",
      },
      // You might need to add query params like:
      // ?country=${country}&type=install&status=active
    })

    if (!response.ok) {
      throw new Error(`AdGate API error: ${response.statusText}`)
    }

    const data = await response.json()
    
    // Transform AdGate offers to our format
    // This will depend on their actual API response structure
    return transformAdGateOffers(data.offers || data.data || [])
  } catch (error) {
    console.error("Error fetching AdGate offers:", error)
    throw error
  }
}

// Transform AdGate API response to our format
function transformAdGateOffers(offers: any[]): AdGateOffer[] {
  return offers.map((offer) => ({
    id: offer.id || offer.offer_id || String(offer.offerId),
    title: offer.title || offer.name || "Untitled Offer",
    description: offer.description || "",
    payout: parseFloat(offer.payout || offer.reward || "0"),
    currency: offer.currency || "INR",
    country: offer.country || "IN",
    category: offer.category || "General",
    type: mapOfferType(offer.type || offer.action_type || "other"),
    url: offer.url || offer.tracking_url || "",
    icon_url: offer.icon_url || offer.icon || undefined,
    requirements: offer.requirements || undefined,
  }))
}

// Map AdGate offer types to our task types
function mapOfferType(adgateType: string): "install" | "signup" | "time_spent" | "other" {
  const typeMap: Record<string, "install" | "signup" | "time_spent" | "other"> = {
    install: "install",
    app_install: "install",
    signup: "signup",
    registration: "signup",
    time_spent: "time_spent",
    engagement: "time_spent",
  }

  return typeMap[adgateType.toLowerCase()] || "other"
}

// Handle AdGate postback/callback for conversion tracking
export async function handleAdGateCallback(data: any): Promise<{
  success: boolean
  taskId?: number
  userId?: number
}> {
  // AdGate will send a callback when a user completes an offer
  // You'll need to:
  // 1. Verify the callback signature (if they provide one)
  // 2. Find the task by network_task_id
  // 3. Find the user by their tracking ID
  // 4. Mark the task as completed/verified
  
  // This is a placeholder - implement based on AdGate's callback format
  console.log("AdGate callback received:", data)
  
  return {
    success: false, // Implement actual logic
  }
}

// Sync AdGate offers to our tasks table
export async function syncAdGateOffersToTasks(): Promise<number> {
  try {
    const offers = await fetchAdGateOffers()
    let synced = 0

    // Import task functions
    const { createTask, getTaskByNetworkId } = await import("@/lib/db/tasks")
    const { getNetworkByName } = await import("@/lib/db/cpa-networks")

    // Get or create AdGate network record
    let network = await getNetworkByName("AdGate Media")
    if (!network) {
      // Create network if it doesn't exist
      const { createNetwork } = await import("@/lib/db/cpa-networks")
      network = await createNetwork({
        name: "AdGate Media",
        api_key: ADGATE_API_KEY || "",
        api_secret: ADGATE_API_SECRET || "",
        country_filter: "IN",
        is_active: true,
      })
    }

    // Sync each offer
    for (const offer of offers) {
      // Check if task already exists
      const existing = await getTaskByNetworkId(network.id, offer.id)
      
      if (!existing) {
        // Create new task
        await createTask({
          network_id: network.id,
          task_id: offer.id,
          title: offer.title,
          description: offer.description,
          action_type: offer.type,
          app_name: offer.title, // Extract app name if available
          app_icon_url: offer.icon_url,
          task_url: offer.url,
          network_payout: offer.payout,
          user_payout: offer.payout * 0.8, // You set the margin (80% to user, 20% to you)
          currency: offer.currency,
          country: offer.country,
          requirements: offer.requirements,
          is_active: true,
        })
        synced++
      } else {
        // Update existing task if payout changed
        if (existing.network_payout !== offer.payout) {
          const { updateTask } = await import("@/lib/db/tasks")
          await updateTask(existing.id, {
            network_payout: offer.payout,
            user_payout: offer.payout * 0.8, // Update user payout too
          })
        }
      }
    }

    return synced
  } catch (error) {
    console.error("Error syncing AdGate offers:", error)
    throw error
  }
}
