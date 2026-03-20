import { NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/auth/session"
import { supabaseAdmin } from "@/lib/supabase/client"

// ── Constants ────────────────────────────────────────────────────────────────
const ONESIGNAL_APP_ID =
  process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID || "74c8eb14-3255-4156-b7b4-5aa9a9163f5f"
const ONESIGNAL_REST_API_KEY = process.env.ONESIGNAL_REST_API_KEY
const BASE_URL = "https://www.qyantra.online"
const ICON_URL = `${BASE_URL}/web-app-manifest-192x192.png`
const ONESIGNAL_API = "https://api.onesignal.com/notifications"

// ── Rate limiting (in-memory, per admin session) ─────────────────────────────
const rateLimitMap = new Map<string, { count: number; resetAt: number }>()
const RATE_LIMIT_MAX = 10        // max 10 notifications
const RATE_LIMIT_WINDOW = 60_000 // per 60 seconds

function isRateLimited(key: string): boolean {
  const now = Date.now()
  const entry = rateLimitMap.get(key)

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(key, { count: 1, resetAt: now + RATE_LIMIT_WINDOW })
    return false
  }

  if (entry.count >= RATE_LIMIT_MAX) return true

  entry.count++
  return false
}

// ── Input validation ─────────────────────────────────────────────────────────
function validateInput(title: string, body: string, actionUrl?: string): string | null {
  if (!title?.trim()) return "Title is required"
  if (!body?.trim()) return "Body is required"
  if (title.length > 100) return "Title must be under 100 characters"
  if (body.length > 500) return "Body must be under 500 characters"
  if (actionUrl && !actionUrl.startsWith("/")) return "Action URL must be a relative path starting with /"
  return null
}

// ── Sanitize string input ─────────────────────────────────────────────────────
function sanitize(str: string): string {
  return str.trim().replace(/[<>]/g, "")
}

// ── Build OneSignal base payload ─────────────────────────────────────────────
function buildBasePayload(title: string, body: string, actionUrl?: string) {
  return {
    app_id: ONESIGNAL_APP_ID,
    headings: { en: sanitize(title) },
    contents: { en: sanitize(body) },
    url: actionUrl
      ? `${BASE_URL}${actionUrl}`
      : `${BASE_URL}/dashboard`,
    chrome_web_icon: ICON_URL,
    firefox_icon: ICON_URL,
    small_icon: "icon-192x192",
    priority: 10,
    ttl: 86400, // 24 hours
  }
}

// ── Send to OneSignal API ─────────────────────────────────────────────────────
async function sendToOneSignal(payload: object, label: string): Promise<void> {
  if (!ONESIGNAL_REST_API_KEY) {
    console.warn(`[onesignal] REST API key not set — ${label} skipped`)
    return
  }

  const response = await fetch(ONESIGNAL_API, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Key ${ONESIGNAL_REST_API_KEY}`,
    },
    body: JSON.stringify(payload),
  })

  const data = await response.json()

  if (!response.ok) {
    console.error(`[onesignal] ${label} failed:`, data)
    throw new Error(`OneSignal ${label} failed: ${data?.errors?.[0] || response.status}`)
  }
}

// ── Create in-app notification ───────────────────────────────────────────────
export async function createNotification({
  userId,
  title,
  body,
  type = "info",
  actionUrl,
}: {
  userId: number
  title: string
  body: string
  type?: "info" | "success" | "warning" | "error"
  actionUrl?: string
}): Promise<void> {
  const validTypes = ["info", "success", "warning", "error"]
  const safeType = validTypes.includes(type) ? type : "info"

  const { error } = await (supabaseAdmin as any)
    .from("notifications")
    .insert({
      user_id: userId,
      title: sanitize(title),
      body: sanitize(body),
      type: safeType,
      action_url: actionUrl || null,
      is_read: false,
      created_at: new Date().toISOString(),
    })

  if (error) {
    console.error("[notifications] DB insert failed:", error)
    throw new Error("Failed to create in-app notification")
  }
}

// ── Send push to single user ─────────────────────────────────────────────────
export async function sendPushNotification({
  userId,
  title,
  body,
  actionUrl,
}: {
  userId: number
  title: string
  body: string
  actionUrl?: string
}): Promise<void> {
  const payload = {
    ...buildBasePayload(title, body, actionUrl),
    include_aliases: {
      external_id: [String(userId)],
    },
    target_channel: "push",
  }

  await sendToOneSignal(payload, `push to user ${userId}`)
}

// ── Broadcast push to all subscribers ───────────────────────────────────────
async function broadcastPushNotification({
  title,
  body,
  actionUrl,
}: {
  title: string
  body: string
  actionUrl?: string
}): Promise<void> {
  const payload = {
    ...buildBasePayload(title, body, actionUrl),
    included_segments: ["Total Subscriptions"],
  }

  await sendToOneSignal(payload, "broadcast")
}

// ── Admin POST endpoint ───────────────────────────────────────────────────────
export async function POST(request: NextRequest) {
  try {

    // 1. Auth check
    const session = await getSession()
    if (!session?.isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // 2. Rate limit per admin
    const rateLimitKey = `admin-${session.userId}`
    if (isRateLimited(rateLimitKey)) {
      return NextResponse.json(
        { error: "Too many requests. Slow down." },
        { status: 429 }
      )
    }

    // 3. Parse & validate body
    let body: any
    try {
      body = await request.json()
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })
    }

    const {
      userId,
      broadcast,
      title,
      body: msgBody,
      type,
      actionUrl,
    } = body

    // 4. Input validation
    const validationError = validateInput(title, msgBody, actionUrl)
    if (validationError) {
      return NextResponse.json({ error: validationError }, { status: 400 })
    }

    // 5. Must specify either userId or broadcast
    if (!broadcast && !userId) {
      return NextResponse.json(
        { error: "Provide either userId or broadcast: true" },
        { status: 400 }
      )
    }

    // 6. userId must be a valid number
    if (userId && (typeof userId !== "number" || userId <= 0 || !Number.isInteger(userId))) {
      return NextResponse.json({ error: "Invalid userId" }, { status: 400 })
    }

    // 7. Handle broadcast
    if (broadcast) {
      const { data: users, error: dbError } = await (supabaseAdmin as any)
        .from("users")
        .select("id")
        .eq("is_admin", false)

      if (dbError) {
        console.error("[notifications] Failed to fetch users:", dbError)
        return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 })
      }

      // Create in-app notifications — settle all, don't fail on partial errors
      const results = await Promise.allSettled(
        (users || []).map((u: any) =>
          createNotification({
            userId: u.id,
            title,
            body: msgBody,
            type,
            actionUrl,
          })
        )
      )

      const failed = results.filter((r) => r.status === "rejected").length
      if (failed > 0) {
        console.warn(`[notifications] ${failed} in-app notifications failed during broadcast`)
      }

      // Send single broadcast push
      await broadcastPushNotification({ title, body: msgBody, actionUrl })

      return NextResponse.json({
        success: true,
        sent: (users || []).length,
        failed,
      })
    }

    // 8. Handle single user
    if (userId) {
      // Verify user exists and is not admin
      const { data: user, error: userError } = await (supabaseAdmin as any)
        .from("users")
        .select("id, is_admin")
        .eq("id", userId)
        .single()

      if (userError || !user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 })
      }

      if (user.is_admin) {
        return NextResponse.json(
          { error: "Cannot send notifications to admin accounts" },
          { status: 400 }
        )
      }

      await createNotification({ userId, title, body: msgBody, type, actionUrl })
      await sendPushNotification({ userId, title, body: msgBody, actionUrl })

      return NextResponse.json({ success: true, sent: 1 })
    }

  } catch (error) {
    console.error("[notifications] Unhandled error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}