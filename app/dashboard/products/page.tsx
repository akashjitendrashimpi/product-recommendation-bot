export const dynamic = "force-dynamic"
import { getSession } from "@/lib/auth/session"
import { redirect } from "next/navigation"
import { getUserById, userToProfile } from "@/lib/db/users"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { ProductsComponent } from "@/components/dashboard/products-component"

export default async function ProductsPage() {
  const session = await getSession()

  if (!session) {
    redirect("/auth/login")
  }

  const user = await getUserById(session.userId)
  if (!user) {
    redirect("/auth/login")
  }

  const profile = userToProfile(user)

  return (
    <DashboardLayout user={{ id: user.id, email: user.email }} profile={profile}>
      <div className="p-6 lg:p-8 max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Product Recommendations</h1>
          <p className="text-gray-600 mt-1">AI-powered product suggestions tailored for you</p>
        </div>
        <ProductsComponent userId={user.id} />
      </div>
    </DashboardLayout>
  )
}
