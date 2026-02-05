import { NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/auth/session"
import { getUserById, updateUser } from "@/lib/db/users"

interface RouteContext {
  params: Promise<{ id: string }>
}

export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    const session = await getSession()
    if (!session || !session.isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await context.params
    const userId = parseInt(id, 10)
    if (isNaN(userId)) {
      return NextResponse.json({ error: "Invalid user ID" }, { status: 400 })
    }
    const data = await request.json()

    await updateUser(userId, { is_admin: data.is_admin })

    const updated = await getUserById(userId)
    if (!updated) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const { password: _, ...userWithoutPassword } = updated
    return NextResponse.json({ user: userWithoutPassword })
  } catch (error) {
    console.error("Error updating user:", error)
    return NextResponse.json(
      { error: "Failed to update user" },
      { status: 500 }
    )
  }
}
