import { getSession } from "@/lib/auth/session"
import { redirect } from "next/navigation"
import { getUserById } from "@/lib/db/users"
import { AdminPayments } from "@/components/admin/admin-payments"

export default async function AdminPaymentsPage() {
  const session = await getSession()
  if (!session) redirect("/auth/login")

  const user = await getUserById(session.userId)
  if (!user || !user.is_admin) redirect("/dashboard")

  return <AdminPayments />
}
