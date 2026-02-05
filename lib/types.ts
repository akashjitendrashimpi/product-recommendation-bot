export interface Product {
  id: number
  product_id: string
  name: string
  category: string
  price: number
  image_url: string | null
  description: string | null
  amazon_link: string | null
  flipkart_link: string | null
  quality_score: number
  popularity_score: number
  user_id: number | null
  created_at: string
  updated_at: string
}

export interface QRCampaign {
  id: number
  campaign_name: string
  campaign_code: string
  description: string | null
  location: string | null
  is_active: boolean
  scan_count: number
  user_id: number | null
  created_at: string
}

export interface Category {
  id: number
  name: string
  description: string | null
  icon: string | null
}

export interface ChatSession {
  id: number
  campaign_id: number | null
  session_data: Record<string, string>
  recommended_products: number[]
  created_at: string
}

export interface ChatStep {
  id: string
  question: string
  options: { label: string; value: string }[]
  field: string
}

export interface UserProfile {
  id: number
  email: string
  display_name: string | null
  is_admin: boolean
  upi_id: string | null
  phone: string | null
  created_at: string
  updated_at: string
}

// System B - Tasks & Earnings Types
export interface CPANetwork {
  id: number
  name: string
  api_key: string | null
  api_secret: string | null
  user_id: string | null
  country_filter: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Task {
  id: number
  network_id: number | null
  task_id: string
  title: string
  description: string | null
  action_type: "install" | "signup" | "time_spent" | "other"
  app_name: string | null
  app_icon_url: string | null
  task_url: string
  network_payout: number | string
  user_payout: number | string
  currency: string
  country: string
  requirements: string | null
  is_active: boolean
  expires_at: string | null
  created_at: string
  updated_at: string
}

export interface TaskCompletion {
  id: number
  user_id: number
  task_id: number
  status: "pending" | "completed" | "verified" | "rejected"
  network_payout: number | string // MySQL DECIMAL can return as string
  user_payout: number | string // MySQL DECIMAL can return as string
  completion_proof: string | null
  network_response: Record<string, any> | null
  completed_at: string | null
  verified_at: string | null
  created_at: string
}

export interface UserEarning {
  id: number
  user_id: number
  date: string
  daily_earnings: number | string // MySQL DECIMAL can return as string
  tasks_completed: number
  created_at: string
  updated_at: string
}

export interface Payment {
  id: number
  user_id: number
  amount: number | string // MySQL DECIMAL can return as string
  upi_id: string
  status: "pending" | "processing" | "completed" | "failed"
  payment_reference: string | null
  payment_date: string
  error_message: string | null
  processed_at: string | null
  created_at: string
  updated_at: string
}

export interface AffiliateClick {
  id: number
  user_id: number | null
  product_id: number
  campaign_id: number | null
  click_type: "amazon" | "flipkart" | "other"
  affiliate_link: string
  ip_address: string | null
  user_agent: string | null
  created_at: string
}

export interface AffiliateConversion {
  id: number
  affiliate_click_id: number
  user_id: number | null
  product_id: number
  amount: number | null
  commission: number | null
  status: "pending" | "confirmed" | "paid"
  conversion_date: string | null
  created_at: string
}
