import { NextRequest, NextResponse } from 'next/server'

interface RateLimitRecord {
  count: number
  resetTime: number
  firstRequest: number
}

// In-memory store (for development) - use Redis in production
const rateLimitMap = new Map<string, RateLimitRecord>()

export function rateLimit(
  request: NextRequest,
  maxRequests: number = 5,
  windowMs: number = 60000
) {
  // Get IP address from headers (works with proxies)
  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    request.headers.get('cf-connecting-ip') ||
    'unknown'

  // Create a key combining IP and endpoint
  const endpoint = new URL(request.url).pathname
  const key = `${ip}:${endpoint}`

  const now = Date.now()
  const record = rateLimitMap.get(key)

  // If no record or window expired, create new one
  if (!record || now > record.resetTime) {
    rateLimitMap.set(key, {
      count: 1,
      resetTime: now + windowMs,
      firstRequest: now,
    })
    return null
  }

  // Increment counter
  record.count++

  // Check if limit exceeded
  if (record.count > maxRequests) {
    const retryAfter = Math.ceil((record.resetTime - now) / 1000)
    
    return NextResponse.json(
      {
        error: `Too many requests. Please try again in ${retryAfter} seconds.`,
        retryAfter,
      },
      {
        status: 429,
        headers: {
          'Retry-After': retryAfter.toString(),
          'X-RateLimit-Limit': maxRequests.toString(),
          'X-RateLimit-Remaining': Math.max(0, maxRequests - record.count).toString(),
          'X-RateLimit-Reset': new Date(record.resetTime).toISOString(),
        },
      }
    )
  }

  return null
}

// Cleanup old records (call this periodically)
export function cleanupExpiredRecords() {
  const now = Date.now()
  for (const [key, record] of rateLimitMap.entries()) {
    if (now > record.resetTime) {
      rateLimitMap.delete(key)
    }
  }
}