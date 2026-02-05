import { getSession } from "@/lib/auth/session"
import { redirect } from "next/navigation"
import { getUserById } from "@/lib/db/users"
import { ProfilePage } from "@/components/dashboard/profile-page"

export default async function ProfilePageRoute() {
  const session = await getSession()

  if (!session) {
    redirect("/auth/login")
  }

  const user = await getUserById(session.userId)
  if (!user) {
    redirect("/auth/login")
  }

  return <ProfilePage user={user} />
}
