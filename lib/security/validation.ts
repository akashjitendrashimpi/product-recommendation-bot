import crypto from "crypto"

// ── Email ──────────────────────────────────────────────────────────────────
export function validateEmail(email: string): boolean {
  if (!email || typeof email !== "string") return false
  const trimmed = email.trim()
  if (trimmed.length > 254) return false                    // RFC 5321
  if (trimmed.includes("..")) return false                  // no consecutive dots
  if (trimmed.startsWith(".") || trimmed.endsWith(".")) return false
  const emailRegex = /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/
  return emailRegex.test(trimmed)
}

// ── Password ───────────────────────────────────────────────────────────────
export function validatePassword(
  password: string
): { valid: boolean; message?: string; strength?: "weak" | "medium" | "strong" } {
  if (!password || typeof password !== "string") {
    return { valid: false, message: "Password is required" }
  }
  if (password.length < 8) {
    return { valid: false, message: "Password must be at least 8 characters" }
  }
  if (password.length > 128) {
    return { valid: false, message: "Password is too long" }
  }
  if (!/[A-Z]/.test(password)) {
    return { valid: false, message: "Password must contain an uppercase letter" }
  }
  if (!/[a-z]/.test(password)) {
    return { valid: false, message: "Password must contain a lowercase letter" }
  }
  if (!/[0-9]/.test(password)) {
    return { valid: false, message: "Password must contain a number" }
  }

  // Common weak passwords
  const commonPasswords = [
    "password", "password123", "123456789", "qwerty123",
    "iloveyou", "admin123", "letmein", "welcome1"
  ]
  if (commonPasswords.includes(password.toLowerCase())) {
    return { valid: false, message: "This password is too common. Choose a stronger one." }
  }

  // Strength scoring
  let strength: "weak" | "medium" | "strong" = "weak"
  let score = 0
  if (password.length >= 12) score++
  if (password.length >= 16) score++
  if (/[^A-Za-z0-9]/.test(password)) score++  // special chars
  if (/[A-Z].*[A-Z]/.test(password)) score++  // multiple uppercase
  if (/[0-9].*[0-9]/.test(password)) score++  // multiple numbers

  if (score >= 4) strength = "strong"
  else if (score >= 2) strength = "medium"

  return { valid: true, strength }
}

// ── Phone ──────────────────────────────────────────────────────────────────
export function validatePhone(phone: string): boolean {
  if (!phone || typeof phone !== "string") return false
  const cleaned = phone.replace(/[\s()\-+]/g, "")
  if (!/^\d+$/.test(cleaned)) return false
  return cleaned.length >= 10 && cleaned.length <= 15
}

// ── UPI ID ─────────────────────────────────────────────────────────────────
export function validateUpiId(upiId: string): boolean {
  if (!upiId || typeof upiId !== "string") return false
  const trimmed = upiId.trim().toLowerCase()
  if (trimmed.length > 100) return false

  // Valid UPI handles
  const validHandles = [
    "okaxis", "okhdfcbank", "okicici", "oksbi",
    "ybl", "ibl", "axl", "upi", "paytm",
    "apl", "waicici", "gpay", "fbl", "rbl",
    "pingpay", "myaxis", "ikwik", "abfspay",
  ]

  const upiRegex = /^[a-zA-Z0-9._\-]{3,}@[a-zA-Z]+$/
  if (!upiRegex.test(trimmed)) return false

  const handle = trimmed.split("@")[1]
  // Allow known handles OR any alphabetic handle (for future UPI apps)
  return validHandles.includes(handle) || /^[a-zA-Z]{2,}$/.test(handle)
}

// ── Sanitize string ────────────────────────────────────────────────────────
export function sanitizeString(input: string, maxLength = 255): string {
  if (!input || typeof input !== "string") return ""
  return input
    .trim()
    .slice(0, maxLength)
    .replace(/[<>"'`]/g, "")           // strip HTML/JS injection chars
    .replace(/javascript:/gi, "")      // strip JS protocol
    .replace(/on\w+\s*=/gi, "")        // strip event handlers
    .replace(/\0/g, "")               // strip null bytes
}

// ── Sanitize HTML (for rich text fields) ──────────────────────────────────
export function stripHtml(input: string): string {
  if (!input || typeof input !== "string") return ""
  return input.replace(/<[^>]*>/g, "").trim()
}

// ── Validate URL ───────────────────────────────────────────────────────────
export function validateUrl(url: string, allowedDomains?: string[]): boolean {
  if (!url || typeof url !== "string") return false
  try {
    const parsed = new URL(url)
    if (!["http:", "https:"].includes(parsed.protocol)) return false
    if (allowedDomains && allowedDomains.length > 0) {
      return allowedDomains.some((domain) =>
        parsed.hostname === domain || parsed.hostname.endsWith(`.${domain}`)
      )
    }
    return true
  } catch {
    return false
  }
}

// ── Validate safe internal redirect ───────────────────────────────────────
export function validateRedirect(url: string | null): string {
  if (!url || typeof url !== "string") return "/dashboard"
  if (
    url.startsWith("/") &&
    !url.startsWith("//") &&
    !url.includes("..") &&
    !url.toLowerCase().includes("javascript") &&
    url.length < 200
  ) {
    return url
  }
  return "/dashboard"
}

// ── Validate integer ID ────────────────────────────────────────────────────
export function validateId(id: unknown): number | null {
  const num = Number(id)
  if (!Number.isInteger(num) || num <= 0 || num > 2_147_483_647) return null
  return num
}

// ── Validate amount (for payouts) ──────────────────────────────────────────
export function validateAmount(amount: unknown): number | null {
  const num = Number(amount)
  if (isNaN(num) || num <= 0 || num > 1_000_000) return null
  // Max 2 decimal places
  if (Math.round(num * 100) !== num * 100) return null
  return num
}

// ── Validate pagination ────────────────────────────────────────────────────
export function validatePagination(
  page: unknown,
  limit: unknown,
  maxLimit = 100
): { page: number; limit: number } {
  const p = Math.max(1, parseInt(String(page)) || 1)
  const l = Math.min(maxLimit, Math.max(1, parseInt(String(limit)) || 10))
  return { page: p, limit: l }
}

// ── Check for SQL injection patterns ──────────────────────────────────────
export function hasSqlInjection(input: string): boolean {
  const sqlPatterns = [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION|TRUNCATE)\b)/i,
    /(--|;|\/\*|\*\/)/,
    /(\bOR\b\s+\d+\s*=\s*\d+)/i,
    /(\bAND\b\s+\d+\s*=\s*\d+)/i,
    /xp_\w+/i,
  ]
  return sqlPatterns.some((pattern) => pattern.test(input))
}

// ── Check for XSS patterns ────────────────────────────────────────────────
export function hasXssPatterns(input: string): boolean {
  const xssPatterns = [
    /<script[\s\S]*?>[\s\S]*?<\/script>/gi,
    /javascript\s*:/gi,
    /on\w+\s*=\s*["'][^"']*["']/gi,
    /<iframe[\s\S]*?>/gi,
    /eval\s*\(/gi,
    /document\s*\.\s*cookie/gi,
    /window\s*\.\s*location/gi,
  ]
  return xssPatterns.some((pattern) => pattern.test(input))
}

// ── Generate secure random token ───────────────────────────────────────────
export function generateSecureToken(bytes = 32): string {
  return crypto.randomBytes(bytes).toString("hex")
}

// ── Generate OTP ───────────────────────────────────────────────────────────
export function generateOtp(length = 6): string {
  const digits = "0123456789"
  let otp = ""
  const randomBytes = crypto.randomBytes(length)
  for (let i = 0; i < length; i++) {
    otp += digits[randomBytes[i] % digits.length]
  }
  return otp
}

// ── Hash sensitive data (for logging — not passwords) ─────────────────────
export function hashForLog(value: string): string {
  return crypto.createHash("sha256").update(value).digest("hex").slice(0, 8) + "..."
}

// ── Validate request body size ─────────────────────────────────────────────
export function validateBodySize(
  contentLength: string | null,
  maxBytes = 1_048_576 // 1MB default
): boolean {
  if (!contentLength) return true // let it through, server will handle
  return parseInt(contentLength) <= maxBytes
}