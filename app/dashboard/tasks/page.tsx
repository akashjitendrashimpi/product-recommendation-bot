export const dynamic = "force-dynamic"
import { getSession } from "@/lib/auth/session"
import { redirect } from "next/navigation"
import { getUserById, userToProfile } from "@/lib/db/users"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { TasksTab } from "@/components/dashboard/tasks-tab"

export default async function TasksPage() {
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
      <div className="max-w-2xl mx-auto">
        <div className="mb-5">
          <h1 className="text-2xl font-bold text-gray-900">Tasks</h1>
          <p className="text-gray-500 mt-1 text-sm">Complete tasks to earn money instantly</p>
        </div>
        <TasksTab userId={user.id} />
      </div>
    </DashboardLayout>
  )
}