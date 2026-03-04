import { getSession } from "@/lib/auth/session"
import { redirect } from "next/navigation"
import { getUserById, userToProfile } from "@/lib/db/users"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import ProductDetailPage from "@/components/dashboard/product-detail-page"

export default async function ProductPage({ params }: { params: { id: string } }) {
  const session = await getSession()
  if (!session) redirect("/auth/login")
  const user = await getUserById(session.userId)
  if (!user) redirect("/auth/login")
  const profile = userToProfile(user)
  return (
    <DashboardLayout user={{ id: user.id, email: user.email }} profile={profile}>
      <ProductDetailPage params={params} />
    </DashboardLayout>
  )
}