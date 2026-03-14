export const dynamic = "force-dynamic"
import { getSession } from "@/lib/auth/session"
import { redirect } from "next/navigation"
import { getUserById } from "@/lib/db/users"
import { AdminTasks } from "@/components/admin/admin-tasks"

export default async function AdminTasksPage() {
  const session = await getSession()
  if (!session) redirect("/auth/login")

  const user = await getUserById(session.userId)
  if (!user || !user.is_admin) redirect("/dashboard")

  return <AdminTasks />
}
