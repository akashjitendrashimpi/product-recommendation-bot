import { ChatWithTasks } from "@/components/chat/chat-with-tasks"
import { notFound } from "next/navigation"
import { getCampaignByCode } from "@/lib/db/campaigns"
import { getAllProducts } from "@/lib/db/products"
import { getAllCategories } from "@/lib/db/categories"
import { getUserById } from "@/lib/db/users"

interface ChatPageProps {
  params: Promise<{ code: string }>
}

export default async function ChatPage({ params }: ChatPageProps) {
  const { code } = await params

  // Get campaign by code
  const campaign = code !== "demo" ? await getCampaignByCode(code) : null

  if (!campaign && code !== "demo") {
    notFound()
  }

  // Fetch all products (admin-managed, not user-specific)
  const [products, categories] = await Promise.all([
    getAllProducts(),
    getAllCategories(),
  ])

  // Get admin/user info from campaign (if it has a user_id, it's the admin)
  let userInfo = null
  if (campaign && campaign.user_id) {
    const admin = await getUserById(campaign.user_id)
    if (admin) {
      userInfo = {
        display_name: admin.display_name,
        phone: admin.phone,
      }
    }
  }

  return (
    <ChatWithTasks
      campaign={campaign}
      products={products}
      categories={categories}
      user={userInfo}
    />
  )
}
