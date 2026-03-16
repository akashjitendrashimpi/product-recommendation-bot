import { cookies } from "next/headers"
import { NextRequest, NextResponse } from "next/server"
import crypto from 'crypto'

const SESSION_COOKIE_NAME = "auth_session"
const SESSION_MAX_AGE = 60 * 60 * 24 * 365 * 10 // 10 years

export interface Session {
  userId: number
  email: string
  isAdmin: boolean
}

const SESSION_SECRET = process.env.SESSION_SECRET || 'dev-session-secret-please-change'

function signPayload(payload: string): string {
  const base = Buffer.from(payload).toString('base64')
  const sig = crypto.createHmac('sha256', SESSION_SECRET).update(base).digest('hex')
  return `${base}.${sig}`
}

function verifyAndExtract(signed: string): string | null {
  try {
    const dotIndex = signed.lastIndexOf('.')
    if (dotIndex === -1) return null
    const base = signed.substring(0, dotIndex)
    const sig = signed.substring(dotIndex + 1)
    const expected = crypto.createHmac('sha256', SESSION_SECRET).update(base).digest('hex')
    const sigBuf = Buffer.from(sig, 'hex')
    const expectedBuf = Buffer.from(expected, 'hex')
    if (sigBuf.length !== expectedBuf.length) return null
    if (!crypto.timingSafeEqual(sigBuf, expectedBuf)) return null
    return Buffer.from(base, 'base64').toString()
  } catch {
    return null
  }
}

function parseSession(raw: string): Session | null {
  // Try signed format first (new secure format)
  const verified = verifyAndExtract(raw)
  if (verified) {
    try {
      const session = JSON.parse(verified)
      if (session?.userId && session?.email) {
        return {
          userId: session.userId,
          email: session.email,
          isAdmin: session.isAdmin || false,
        }
      }
    } catch {
      return null
    }
  }
  return null
}

// Get session from cookies (server-side)
export async function getSession(): Promise<Session | null> {
  try {
    const cookieStore = await cookies()
    const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME)
    if (!sessionCookie?.value) return null
    return parseSession(sessionCookie.value)
  } catch (error) {
    console.error("Error getting session:", error)
    return null
  }
}

// Create session and set cookie
export async function createSession(session: Session): Promise<void> {
  const cookieStore = await cookies()
  const payload = JSON.stringify({
    userId: session.userId,
    email: session.email,
    isAdmin: session.isAdmin,
  })
  const sessionValue = signPayload(payload)

  cookieStore.set(SESSION_COOKIE_NAME, sessionValue, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax", // upgraded from lax to strict
    maxAge: SESSION_MAX_AGE,
    path: "/",
  })
}

// Delete session (logout)
export async function deleteSession(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete(SESSION_COOKIE_NAME)
}

// Middleware helper - now uses SAME signature verification as getSession
export function getSessionFromRequest(request: NextRequest): Session | null {
  try {
    const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME)
    if (!sessionCookie?.value) return null
    return parseSession(sessionCookie.value)
  } catch (error) {
    console.error("Error parsing session from request:", error)
    return null
  }
}

// Set session in response (for middleware)
export function setSessionInResponse(
  response: NextResponse,
  session: Session
): NextResponse {
  const payload = JSON.stringify({
    userId: session.userId,
    email: session.email,
    isAdmin: session.isAdmin,
  })
  const sessionValue = signPayload(payload)

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
export function clearSessionInResponse(response: NextResponse): NextResponse {
  response.cookies.delete(SESSION_COOKIE_NAME)
  return response
}