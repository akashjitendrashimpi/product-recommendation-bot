export const dynamic = "force-dynamic"
import { getSession } from "@/lib/auth/session"
import { redirect } from "next/navigation"
import { getUserById } from "@/lib/db/users"
import { AdminLayout } from "@/components/admin/admin-layout"

export default async function Layout({ children }: { children: React.ReactNode }) {
  const session = await getSession()
  if (!session) redirect("/auth/login")

  const user = await getUserById(session.userId)
  if (!user || !user.is_admin) redirect("/dashboard")

  return (
    <AdminLayout user={{ id: user.id, email: user.email }}>
      {children}
    </AdminLayout>
  )
}
