import { NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/auth/session"
import { supabaseAdmin } from "@/lib/supabase/client"

// Helper to create in-app notification
export async function createNotification({
  userId,
  title,
  body,
  type = 'info',
  actionUrl,
}: {
  userId: number
  title: string
  body: string
  type?: 'info' | 'success' | 'warning' | 'error'
  actionUrl?: string
}) {
  await (supabaseAdmin as any)
    .from("notifications")
    .insert({
      user_id: userId,
      title,
      body,
      type,
      action_url: actionUrl || null,
      is_read: false,
      created_at: new Date().toISOString(),
    })
}

// Send push notification to a user's subscribed devices
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
}) {
  try {
    const { data: subscriptions } = await (supabaseAdmin as any)
      .from("push_subscriptions")
      .select("*")
      .eq("user_id", userId)

    if (!subscriptions?.length) return

    const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
    const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY
    const VAPID_EMAIL = process.env.VAPID_EMAIL || "mailto:admin@qyantra.com"

    if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) {
      console.warn("VAPID keys not configured — push notifications disabled")
      return
    }

    // Dynamically import web-push (install: npm install web-push)
    const webpush = await import("web-push")
    webpush.default.setVapidDetails(VAPID_EMAIL, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY)

    const payload = JSON.stringify({
      title,
      body,
      icon: "/icon-192x192.png",
      badge: "/badge-72x72.png",
      url: actionUrl || "/dashboard",
    })

    await Promise.allSettled(
      subscriptions.map((sub: any) =>
        webpush.default.sendNotification(
          { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
          payload
        ).catch(async (err: any) => {
          // Remove expired/invalid subscriptions
          if (err.statusCode === 410 || err.statusCode === 404) {
            await (supabaseAdmin as any)
              .from("push_subscriptions")
              .delete()
              .eq("id", sub.id)
          }
        })
      )
    )
  } catch (error) {
    console.error("Error sending push notification:", error)
  }
}

// Admin endpoint to send broadcast or targeted notifications
export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session || !session.isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { userId, broadcast, title, body, type, actionUrl } = await request.json()
    if (!title || !body) {
      return NextResponse.json({ error: "Title and body required" }, { status: 400 })
    }

    if (broadcast) {
      // Send to all users
      const { data: users } = await (supabaseAdmin as any)
        .from("users")
        .select("id")
        .eq("is_admin", false)

      await Promise.allSettled(
        (users || []).map(async (u: any) => {
          await createNotification({ userId: u.id, title, body, type, actionUrl })
          await sendPushNotification({ userId: u.id, title, body, actionUrl })
        })
      )
    } else if (userId) {
      await createNotification({ userId, title, body, type, actionUrl })
      await sendPushNotification({ userId, title, body, actionUrl })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error sending notification:", error)
    return NextResponse.json({ error: "Failed to send notification" }, { status: 500 })
  }
}