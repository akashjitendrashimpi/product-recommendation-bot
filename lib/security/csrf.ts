import crypto from "crypto"
import { NextRequest } from "next/server"

// ── Config ────────────────────────────────────────────────────────────────
const TOKEN_EXPIRY = 2 * 60 * 60 * 1000  // 2 hours (was 24 — too long)
const MAX_STORE_SIZE = 5_000
const CLEANUP_INTERVAL = 30 * 60 * 1000  // 30 mins

interface CSRFRecord {
  token: string
  createdAt: number
  usedAt?: number
  useCount: number
}

// ── Store ─────────────────────────────────────────────────────────────────
const csrfTokenStore = new Map<string, CSRFRecord>()

// ── Cleanup ───────────────────────────────────────────────────────────────
setInterval(() => {
  const now = Date.now()
  for (const [key, record] of csrfTokenStore.entries()) {
    if (now - record.createdAt > TOKEN_EXPIRY) {
      csrfTokenStore.delete(key)
    }
  }
}, CLEANUP_INTERVAL)

// ── Generate token ────────────────────────────────────────────────────────
export function generateCSRFToken(): string {
  return crypto.randomBytes(32).toString("hex")
}

// ── Store token ───────────────────────────────────────────────────────────
export function storeCSRFToken(userIdentifier: string, token: string): void {
  // Prevent memory exhaustion
  if (csrfTokenStore.size >= MAX_STORE_SIZE) {
    const firstKey = csrfTokenStore.keys().next().value
    if (firstKey) csrfTokenStore.delete(firstKey)
  }

  csrfTokenStore.set(userIdentifier, {
    token,
    createdAt: Date.now(),
    useCount: 0,
  })
}

// ── Validate token ────────────────────────────────────────────────────────
export function validateCSRFToken(
  token: string,
  userIdentifier: string,
  options: { allowReuse?: boolean } = {}
): boolean {
  if (!token || !userIdentifier) return false

  const record = csrfTokenStore.get(userIdentifier)
  if (!record) return false

  // Check expiry
  if (Date.now() - record.createdAt > TOKEN_EXPIRY) {
    csrfTokenStore.delete(userIdentifier)
    return false
  }

  // Prevent token reuse (one-time use by default)
  if (!options.allowReuse && record.useCount > 0) {
    console.warn(`[csrf] Token reuse attempt for identifier: ${userIdentifier}`)
    return false
  }

  // Ensure same buffer length before comparison
  const tokenBuf = Buffer.from(token, "hex")
  const recordBuf = Buffer.from(record.token, "hex")

  if (tokenBuf.length !== recordBuf.length) return false

  // Constant-time comparison — prevents timing attacks
  const isValid = crypto.timingSafeEqual(tokenBuf, recordBuf)

  if (isValid) {
    record.useCount++
    record.usedAt = Date.now()
  }

  return isValid
}

// ── Rotate token ──────────────────────────────────────────────────────────
export function rotateCSRFToken(userIdentifier: string): string {
  const newToken = generateCSRFToken()
  storeCSRFToken(userIdentifier, newToken)
  return newToken
}

// ── Delete token ──────────────────────────────────────────────────────────
export function deleteCSRFToken(userIdentifier: string): void {
  csrfTokenStore.delete(userIdentifier)
}

// ── Validate CSRF from request headers ────────────────────────────────────
export function validateCSRFFromRequest(
  request: NextRequest,
  userIdentifier: string
): boolean {
  // Check X-CSRF-Token header
  const headerToken = request.headers.get("x-csrf-token")

  // Also check X-Requested-With as fallback CSRF hint
  const requestedWith = request.headers.get("x-requested-with")
  if (!headerToken && requestedWith !== "XMLHttpRequest") {
    return false
  }

  if (!headerToken) return false
  return validateCSRFToken(headerToken, userIdentifier)
}