import { NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/auth/session"
import { getUserById, updateUser } from "@/lib/db/users"

export async function GET() {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = await getUserById(session.userId)
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const { password: _, ...userWithoutPassword } = user
    return NextResponse.json({ user: userWithoutPassword })
  } catch (error) {
    console.error("Error fetching profile:", error)
    return NextResponse.json(
      { error: "Failed to fetch profile" },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const data = await request.json()
    await updateUser(session.userId, data)

    const updated = await getUserById(session.userId)
    if (!updated) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const { password: _, ...userWithoutPassword } = updated
    return NextResponse.json({ user: userWithoutPassword })
  } catch (error) {
    console.error("Error updating profile:", error)
    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 500 }
    )
  }
}
