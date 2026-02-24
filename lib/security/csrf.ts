import crypto from 'crypto'

const csrfTokenStore = new Map<string, { token: string; createdAt: number }>()
const TOKEN_EXPIRY = 24 * 60 * 60 * 1000 // 24 hours

export function generateCSRFToken(): string {
  return crypto.randomBytes(32).toString('hex')
}

export function validateCSRFToken(token: string, userIdentifier: string): boolean {
  const record = csrfTokenStore.get(userIdentifier)

  if (!record) {
    return false
  }

  // Check expiry
  if (Date.now() - record.createdAt > TOKEN_EXPIRY) {
    csrfTokenStore.delete(userIdentifier)
    return false
  }

  // Constant-time comparison to prevent timing attacks
  return crypto.timingSafeEqual(
    Buffer.from(record.token),
    Buffer.from(token)
  )
}

export function storeCSRFToken(userIdentifier: string, token: string): void {
  csrfTokenStore.set(userIdentifier, {
    token,
    createdAt: Date.now(),
  })
}