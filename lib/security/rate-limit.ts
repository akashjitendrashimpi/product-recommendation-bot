import { NextRequest, NextResponse } from "next/server"

// ── Types ─────────────────────────────────────────────────────────────────
interface RateLimitRecord {
  count: number
  resetTime: number
  firstRequest: number
  blockedUntil?: number // for progressive backoff
  violations: number   // tracks repeated abuse
}

// ── Config ────────────────────────────────────────────────────────────────
const CLEANUP_INTERVAL = 5 * 60 * 1000  // cleanup every 5 mins
const MAX_MAP_SIZE = 10_000             // prevent memory exhaustion
const BLOCK_THRESHOLDS = [3, 5, 10]    // violations before progressive block
const BLOCK_DURATIONS = [              // block durations per violation level
  60_000,       // 1 min
  300_000,      // 5 mins
  3_600_000,    // 1 hour
]

// ── In-memory store ───────────────────────────────────────────────────────
// NOTE: Use Redis/Upstash in production for multi-instance deployments
const rateLimitMap = new Map<string, RateLimitRecord>()

// ── Cleanup loop ──────────────────────────────────────────────────────────
let cleanupTimer: ReturnType<typeof setTimeout> | null = null

function scheduleCleanup() {
  if (cleanupTimer) return
  cleanupTimer = setTimeout(() => {
    cleanupExpiredRecords()
    cleanupTimer = null
    scheduleCleanup()
  }, CLEANUP_INTERVAL)
}

scheduleCleanup()

export function cleanupExpiredRecords() {
  const now = Date.now()
  let deleted = 0
  for (const [key, record] of rateLimitMap.entries()) {
    if (
      now > record.resetTime &&
      (!record.blockedUntil || now > record.blockedUntil)
    ) {
      rateLimitMap.delete(key)
      deleted++
    }
  }
  if (deleted > 0) {
    console.info(`[rate-limit] Cleaned up ${deleted} expired records`)
  }
}

// ── Get real IP from request ──────────────────────────────────────────────
function getIp(request: NextRequest): string {
  return (
    request.headers.get("cf-connecting-ip") ||        // Cloudflare real IP
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown"
  )
}

// ── Build rate limit response ─────────────────────────────────────────────
function buildRateLimitResponse(
  record: RateLimitRecord,
  maxRequests: number,
  isBlocked = false
): NextResponse {
  const now = Date.now()
  const retryAfter = isBlocked && record.blockedUntil
    ? Math.ceil((record.blockedUntil - now) / 1000)
    : Math.ceil((record.resetTime - now) / 1000)

  const message = isBlocked
    ? `Too many violations. You are blocked for ${retryAfter} seconds.`
    : `Too many requests. Please try again in ${retryAfter} seconds.`

  return NextResponse.json(
    { error: message, retryAfter },
    {
      status: 429,
      headers: {
        "Retry-After": retryAfter.toString(),
        "X-RateLimit-Limit": maxRequests.toString(),
        "X-RateLimit-Remaining": "0",
        "X-RateLimit-Reset": new Date(
          isBlocked ? record.blockedUntil! : record.resetTime
        ).toISOString(),
        "X-RateLimit-Policy": `${maxRequests} requests per window`,
      },
    }
  )
}

// ── Main rate limiter ─────────────────────────────────────────────────────
export function rateLimit(
  request: NextRequest,
  maxRequests = 10,
  windowMs = 60_000,
  options: {
    skipSuccessfulRequests?: boolean
    keyPrefix?: string
  } = {}
): NextResponse | null {
  const ip = getIp(request)
  const endpoint = new URL(request.url).pathname
  const key = `${options.keyPrefix || ""}${ip}:${endpoint}`
  const now = Date.now()

  // Prevent memory exhaustion attack
  if (rateLimitMap.size >= MAX_MAP_SIZE) {
    cleanupExpiredRecords()
    if (rateLimitMap.size >= MAX_MAP_SIZE) {
      console.warn("[rate-limit] Map size limit reached — dropping oldest entries")
      const firstKey = rateLimitMap.keys().next().value
      if (firstKey) rateLimitMap.delete(firstKey)
    }
  }

  const record = rateLimitMap.get(key)

  // Check if IP is in progressive block
  if (record?.blockedUntil && now < record.blockedUntil) {
    return buildRateLimitResponse(record, maxRequests, true)
  }

  // New window or expired record
  if (!record || now > record.resetTime) {
    rateLimitMap.set(key, {
      count: 1,
      resetTime: now + windowMs,
      firstRequest: now,
      violations: record?.violations || 0,
    })
    return null
  }

  record.count++

  // Limit exceeded
  if (record.count > maxRequests) {
    record.violations++

    // Progressive backoff based on violation count
    const violationLevel = Math.min(
      record.violations - 1,
      BLOCK_THRESHOLDS.length - 1
    )

    if (record.violations >= BLOCK_THRESHOLDS[0]) {
      const blockDuration = BLOCK_DURATIONS[violationLevel] || BLOCK_DURATIONS[BLOCK_DURATIONS.length - 1]
      record.blockedUntil = now + blockDuration
      console.warn(`[rate-limit] IP ${ip} blocked for ${blockDuration / 1000}s on ${endpoint} (violation ${record.violations})`)
    }

    return buildRateLimitResponse(record, maxRequests, !!record.blockedUntil)
  }

  return null
}

// ── Strict rate limiter for sensitive endpoints ───────────────────────────
export function strictRateLimit(request: NextRequest): NextResponse | null {
  return rateLimit(request, 3, 60_000, { keyPrefix: "strict:" })
}

// ── Auth rate limiter ─────────────────────────────────────────────────────
export function authRateLimit(request: NextRequest): NextResponse | null {
  return rateLimit(request, 5, 60_000, { keyPrefix: "auth:" })
}