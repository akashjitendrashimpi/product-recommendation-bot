import { NextResponse, NextRequest } from "next/server"

// Simple in-memory rate limiter (in production, use Redis)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>()

export function rateLimit(
  req: NextRequest,
  limiter: { maxRequests: number; windowMs: number }
): boolean {
  const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown"
  const now = Date.now()

  const record = rateLimitStore.get(ip)

  if (!record || now > record.resetTime) {
    rateLimitStore.set(ip, {
      count: 1,
      resetTime: now + limiter.windowMs,
    })
    return true
  }

  if (record.count >= limiter.maxRequests) {
    return false
  }

  record.count++
  return true
}

/**
 * Add security headers to response
 */
export function addSecurityHeaders(response: NextResponse): NextResponse {
  response.headers.set("X-Content-Type-Options", "nosniff")
  response.headers.set("X-Frame-Options", "DENY")
  response.headers.set("X-XSS-Protection", "1; mode=block")
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin")
  response.headers.set("Permissions-Policy", "geolocation=(), microphone=(), camera=()")

  // CORS
  response.headers.set("Access-Control-Allow-Origin", process.env.ALLOWED_ORIGINS || "*")
  response.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
  response.headers.set("Access-Control-Allow-Headers", "Content-Type, X-CSRF-Token")

  return response
}

/**
 * Validate CSRF token
 */
export function validateCSRF(req: NextRequest, token: string): boolean {
  // In production, verify against session storage
  // For now, just check if token exists
  return token && token.length > 0
}

/**
 * Rate limit response
 */
export function rateLimitResponse(): NextResponse {
  return new NextResponse(
    JSON.stringify({ error: "Too many requests. Please try again later." }),
    {
      status: 429,
      headers: {
        "Content-Type": "application/json",
        "Retry-After": "60",
      },
    }
  )
}

/**
 * Unauthorized response
 */
export function unauthorizedResponse(message = "Unauthorized"): NextResponse {
  return new NextResponse(
    JSON.stringify({ error: message }),
    {
      status: 401,
      headers: { "Content-Type": "application/json" },
    }
  )
}

/**
 * Bad request response
 */
export function badRequestResponse(message = "Bad request"): NextResponse {
  return new NextResponse(
    JSON.stringify({ error: message }),
    {
      status: 400,
      headers: { "Content-Type": "application/json" },
    }
  )
}

/**
 * Server error response
 */
export function serverErrorResponse(message = "Internal server error"): NextResponse {
  return new NextResponse(
    JSON.stringify({ error: message }),
    {
      status: 500,
      headers: { "Content-Type": "application/json" },
    }
  )
}

/**
 * Success response
 */
export function successResponse(data: any, status = 200): NextResponse {
  return new NextResponse(
    JSON.stringify(data),
    {
      status,
      headers: { "Content-Type": "application/json" },
    }
  )
}
