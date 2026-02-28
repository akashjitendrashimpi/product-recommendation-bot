import { getSession } from "@/lib/auth/session"
import { redirect } from "next/navigation"
import { getUserById, userToProfile } from "@/lib/db/users"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { ProfilePage } from "@/components/dashboard/profile-page"

export default async function ProfileRoute() {
  const session = await getSession()

  if (!session) {
    redirect("/auth/login")
  }

  const user = await getUserById(session.userId)
  if (!user) {
    redirect("/auth/login")
  }

  const profile = userToProfile(user)

  const userData = {
    id: user.id,
    email: user.email,
    display_name: user.display_name,
    upi_id: user.upi_id,
    phone: user.phone,
    is_admin: user.is_admin
  }

  return (
    <DashboardLayout user={{ id: user.id, email: user.email }} profile={profile}>
      <ProfilePage user={userData} />
    </DashboardLayout>
  )
}