export const dynamic = "force-dynamic"
import { getSession } from "@/lib/auth/session"
import { redirect } from "next/navigation"
import { getUserById, userToProfile } from "@/lib/db/users"
import { getTaskById } from "@/lib/db/tasks"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { TaskDetailClient } from "@/components/dashboard/task-detail-client"

export default async function TaskDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const session = await getSession()
  if (!session) redirect("/auth/login")

  const user = await getUserById(session.userId)
  if (!user) redirect("/auth/login")

  const { id } = await params
  const task = await getTaskById(parseInt(id))

  // If task not found or detail page not enabled, redirect to tasks
  if (!task || !(task as any).has_detail_page) {
    redirect("/dashboard/tasks")
  }

  const profile = userToProfile(user)

  return (
    <DashboardLayout user={{ id: user.id, email: user.email }} profile={profile}>
      <div className="p-4 sm:p-6 lg:p-8 max-w-2xl mx-auto">
        <TaskDetailClient task={task as any} userId={user.id} />
      </div>
    </DashboardLayout>
  )
}