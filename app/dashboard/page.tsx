import { getSession } from "@/lib/auth/session"
import { redirect } from "next/navigation"
import { UserDashboard } from "@/components/dashboard/user-dashboard"
import { AdminPanel } from "@/components/admin/admin-panel"
import { getUserById, getAllUsers, userToProfile } from "@/lib/db/users"
import { getAllProducts } from "@/lib/db/products"
import { getAllCampaigns } from "@/lib/db/campaigns"
import { getAllCategories } from "@/lib/db/categories"
import { getAllTasks } from "@/lib/db/tasks"

export default async function DashboardPage() {
  const session = await getSession()

  if (!session) {
    redirect("/auth/login")
  }

  // Get user profile
  const user = await getUserById(session.userId)
  if (!user) {
    redirect("/auth/login")
  }

  const profile = userToProfile(user)

  // If user is admin, show admin panel
  if (user.is_admin) {
    // Fetch all data for admin panel
    const [users, products, campaigns, categories, tasks] = await Promise.all([
      getAllUsers(),
      getAllProducts(),
      getAllCampaigns(),
      getAllCategories(),
      getAllTasks(),
    ])

    const userProfiles = users.map(userToProfile)

    return (
      <AdminPanel
        currentUser={{ id: user.id, email: user.email }}
        currentProfile={profile}
        users={userProfiles}
        allProducts={products}
        allCampaigns={campaigns}
        categories={categories}
        allTasks={tasks}
      />
    )
  }

  // Regular users see user dashboard
  return (
    <UserDashboard
      user={{ id: user.id, email: user.email }}
      profile={profile}
    />
  )
}
