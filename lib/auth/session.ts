import { cookies } from "next/headers"
import { NextRequest, NextResponse } from "next/server"

const SESSION_COOKIE_NAME = "auth_session"
const SESSION_MAX_AGE = 60 * 60 * 24 * 7 // 7 days

export interface Session {
  userId: number
  email: string
  isAdmin: boolean
}

// Get session from cookies (server-side)
export async function getSession(): Promise<Session | null> {
  const cookieStore = await cookies()
  const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME)

  if (!sessionCookie?.value) {
    return null
  }

  try {
    // In production, you should verify the session token signature
    // For now, we'll decode and validate the session
    const session = JSON.parse(decodeURIComponent(sessionCookie.value))
    
    // Validate session structure
    if (session?.userId && session?.email) {
      return {
        userId: session.userId,
        email: session.email,
        isAdmin: session.isAdmin || false,
      }
    }
  } catch (error) {
    console.error("Error parsing session:", error)
  }

  return null
}

// Create session and set cookie
export async function createSession(session: Session): Promise<void> {
  const cookieStore = await cookies()
  const sessionValue = encodeURIComponent(
    JSON.stringify({
      userId: session.userId,
      email: session.email,
      isAdmin: session.isAdmin,
    })
  )

  cookieStore.set(SESSION_COOKIE_NAME, sessionValue, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: SESSION_MAX_AGE,
    path: "/",
  })
}

// Delete session (logout)
export async function deleteSession(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete(SESSION_COOKIE_NAME)
}

// Middleware helper to get session from request
export function getSessionFromRequest(request: NextRequest): Session | null {
  const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME)

  if (!sessionCookie?.value) {
    return null
  }

  try {
    const session = JSON.parse(decodeURIComponent(sessionCookie.value))
    if (session?.userId && session?.email) {
      return {
        userId: session.userId,
        email: session.email,
        isAdmin: session.isAdmin || false,
      }
    }
  } catch (error) {
    console.error("Error parsing session:", error)
  }

  return null
}

// Set session in response (for middleware)
export function setSessionInResponse(
  response: NextResponse,
  session: Session
): NextResponse {
  const sessionValue = encodeURIComponent(
    JSON.stringify({
      userId: session.userId,
      email: session.email,
      isAdmin: session.isAdmin,
    })
  )

  response.cookies.set(SESSION_COOKIE_NAME, sessionValue, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: SESSION_MAX_AGE,
    path: "/",
  })

  return response
}

// Clear session in response (for middleware)
export function clearSessionInResponse(
  response: NextResponse
): NextResponse {
  response.cookies.delete(SESSION_COOKIE_NAME)
  return response
}
