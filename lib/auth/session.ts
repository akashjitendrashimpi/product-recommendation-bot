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

// ── Warn in production if using default secret ──
if (process.env.NODE_ENV === 'production' && SESSION_SECRET === 'dev-session-secret-please-change') {
  console.warn('[session] WARNING: Using default SESSION_SECRET in production. Set SESSION_SECRET env var immediately.')
}

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

    // Constant-time comparison to prevent timing attacks
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
  if (!raw || typeof raw !== 'string') return null

  const verified = verifyAndExtract(raw)
  if (!verified) return null

  try {
    const session = JSON.parse(verified)
    // Validate all required fields exist and have correct types
    if (
      session &&
      typeof session.userId === 'number' &&
      session.userId > 0 &&
      typeof session.email === 'string' &&
      session.email.includes('@')
    ) {
      return {
        userId: session.userId,
        email: session.email,
        isAdmin: session.isAdmin === true, // strict boolean check
      }
    }
    return null
  } catch {
    return null
  }
}

// ── Get session from cookies (server-side) ──
export async function getSession(): Promise<Session | null> {
  try {
    const cookieStore = await cookies()
    const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME)
    if (!sessionCookie?.value) return null

    const session = parseSession(sessionCookie.value)

    // ── Auto-clear corrupt/invalid cookie to prevent redirect loops ──
    if (!session && sessionCookie.value) {
      try {
        cookieStore.delete(SESSION_COOKIE_NAME)
      } catch {
        // Can't always delete in server components — ignore
      }
    }

    return session
  } catch (error) {
    console.error("[session] Error getting session:", error)
    return null
  }
}

// ── Create session and set cookie ──
export async function createSession(session: Session): Promise<void> {
  try {
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
      sameSite: "lax",
      maxAge: SESSION_MAX_AGE,
      path: "/",
    })

    // ── Generate and set Double-Submit CSRF token ──
    const csrfToken = crypto.randomBytes(32).toString('hex')
    cookieStore.set('csrf_token', csrfToken, {
      httpOnly: false, // Must be readable by client JS
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: SESSION_MAX_AGE,
      path: "/",
    })
  } catch (error) {
    console.error("[session] Error creating session:", error)
    throw error
  }
}

// ── Delete session (logout) ──
export async function deleteSession(): Promise<void> {
  try {
    const cookieStore = await cookies()
    cookieStore.delete(SESSION_COOKIE_NAME)
    cookieStore.delete('csrf_token')
  } catch (error) {
    console.error("[session] Error deleting session:", error)
  }
}

// ── Middleware helper — uses same signature verification ──
export function getSessionFromRequest(request: NextRequest): Session | null {
  try {
    const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME)
    if (!sessionCookie?.value) return null
    return parseSession(sessionCookie.value)
  } catch (error) {
    console.error("[session] Error parsing session from request:", error)
    return null
  }
}

// ── Set session in response (for middleware) ──
export function setSessionInResponse(
  response: NextResponse,
  session: Session
): NextResponse {
  try {
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

    const csrfToken = crypto.randomBytes(32).toString('hex')
    response.cookies.set('csrf_token', csrfToken, {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: SESSION_MAX_AGE,
      path: "/",
    })
  } catch (error) {
    console.error("[session] Error setting session in response:", error)
  }

  return response
}

// ── Clear session in response (for middleware) ──
export function clearSessionInResponse(response: NextResponse): NextResponse {
  try {
    response.cookies.delete(SESSION_COOKIE_NAME)
    response.cookies.delete('csrf_token')
  } catch (error) {
    console.error("[session] Error clearing session in response:", error)
  }
  return response
}

// ── Native CSRF Validation via Double Submit Cookie ──
export function validateCSRF(request: NextRequest): boolean {
  try {
    const cookieToken = request.cookies.get('csrf_token')?.value
    const headerToken = request.headers.get('x-csrf-token')

    if (!cookieToken || !headerToken) return false

    // Constant-time comparison to prevent timing attacks
    const cookieBuf = Buffer.from(cookieToken, 'hex')
    const headerBuf = Buffer.from(headerToken, 'hex')

    if (cookieBuf.length !== headerBuf.length) return false
    return crypto.timingSafeEqual(cookieBuf, headerBuf)
  } catch {
    return false
  }
}