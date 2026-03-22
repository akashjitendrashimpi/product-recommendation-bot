"use client"

import { useState, useEffect, useRef, useCallback, useTransition } from "react"
import {
  Bell, CheckCheck, X, ExternalLink,
  CheckCircle2, AlertTriangle, XCircle, Info, BellOff, Loader2
} from "lucide-react"
import Link from "next/link"

// ── Types ────────────────────────────────────────────────────────────────────
type NotificationType = "info" | "success" | "warning" | "error"

interface Notification {
  id: number
  title: string
  body: string
  type: NotificationType
  is_read: boolean
  action_url: string | null
  created_at: string
}

interface DropdownPos {
  top: number
  left?: number
  right?: number
}

interface NotificationBellProps {
  userId?: number
}

// ── Constants ────────────────────────────────────────────────────────────────
const POLL_INTERVAL = 30_000
const MAX_NOTIFICATIONS_DISPLAY = 50
const VALID_TYPES: NotificationType[] = ["info", "success", "warning", "error"]
const BOTTOM_NAV_HEIGHT = 80 // px — matches h-16 (64px) + safe area

const TYPE_CONFIG: Record<NotificationType, {
  icon: React.ReactNode
  bg: string
  dot: string
  bar: string
  label: string
}> = {
  success: {
    icon: <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />,
    bg: "bg-green-100", dot: "bg-green-500", bar: "bg-green-500", label: "Success"
  },
  warning: {
    icon: <AlertTriangle className="w-3.5 h-3.5 text-orange-500" />,
    bg: "bg-orange-100", dot: "bg-orange-500", bar: "bg-orange-500", label: "Warning"
  },
  error: {
    icon: <XCircle className="w-3.5 h-3.5 text-red-500" />,
    bg: "bg-red-100", dot: "bg-red-500", bar: "bg-red-500", label: "Error"
  },
  info: {
    icon: <Info className="w-3.5 h-3.5 text-blue-500" />,
    bg: "bg-blue-100", dot: "bg-blue-500", bar: "bg-blue-500", label: "Info"
  },
}

// ── Helpers ──────────────────────────────────────────────────────────────────
function sanitizeNotification(n: unknown): Notification | null {
  if (!n || typeof n !== "object") return null
  const obj = n as Record<string, unknown>
  const id = typeof obj.id === "number" && obj.id > 0 ? obj.id : null
  const title = typeof obj.title === "string" ? obj.title.slice(0, 100) : null
  const body = typeof obj.body === "string" ? obj.body.slice(0, 500) : null
  const type = VALID_TYPES.includes(obj.type as NotificationType)
    ? (obj.type as NotificationType)
    : "info"
  const is_read = typeof obj.is_read === "boolean" ? obj.is_read : false
  const action_url =
    typeof obj.action_url === "string" && obj.action_url.startsWith("/")
      ? obj.action_url.slice(0, 200)
      : null
  const created_at =
    typeof obj.created_at === "string" && !isNaN(Date.parse(obj.created_at))
      ? obj.created_at
      : new Date().toISOString()
  if (!id || !title || !body) return null
  return { id, title, body, type, is_read, action_url, created_at }
}

function timeAgo(date: string): string {
  const s = Math.floor((Date.now() - new Date(date).getTime()) / 1000)
  if (s < 5) return "just now"
  if (s < 60) return `${s}s ago`
  if (s < 3600) return `${Math.floor(s / 60)}m ago`
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`
  if (s < 604800) return `${Math.floor(s / 86400)}d ago`
  return new Date(date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })
}

// ── OneSignal helpers ────────────────────────────────────────────────────────
function withOneSignal(cb: (os: any) => Promise<void>): Promise<void> {
  return new Promise((resolve, reject) => {
    const win = window as any
    if (!win.OneSignalDeferred) { reject(new Error("OneSignal not loaded")); return }
    win.OneSignalDeferred.push(async (os: any) => {
      try { await cb(os); resolve() }
      catch (e) { reject(e) }
    })
  })
}

async function getOneSignalStatus(): Promise<boolean> {
  try {
    return await new Promise((resolve) => {
      withOneSignal(async (os) => {
        resolve(!!os.User.PushSubscription.optedIn)
      }).catch(() => resolve(false))
    })
  } catch { return false }
}

// ── Component ────────────────────────────────────────────────────────────────
export function NotificationBell({ userId }: NotificationBellProps) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [open, setOpen] = useState(false)
  const [pushEnabled, setPushEnabled] = useState(false)
  const [pushLoading, setPushLoading] = useState(false)
  const [pushError, setPushError] = useState<string | null>(null)
  const [fetchError, setFetchError] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [dropdownPos, setDropdownPos] = useState<DropdownPos>({ top: 0 })
  const [isPending, startTransition] = useTransition()

  const buttonRef = useRef<HTMLButtonElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const abortRef = useRef<AbortController | null>(null)
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // ── Fetch notifications ──────────────────────────────────────────────────
  const fetchNotifications = useCallback(async (signal?: AbortSignal) => {
    try {
      const res = await fetch("/api/notifications", {
        signal, credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
      })
      if (!res.ok) { if (res.status !== 401) setFetchError(true); return }
      const data = await res.json()
      const raw: unknown[] = Array.isArray(data.notifications)
        ? data.notifications.slice(0, MAX_NOTIFICATIONS_DISPLAY) : []
      const safe = raw.map(sanitizeNotification).filter(Boolean) as Notification[]
      const count = typeof data.unreadCount === "number"
        ? Math.max(0, data.unreadCount)
        : safe.filter((n) => !n.is_read).length
      startTransition(() => { setNotifications(safe); setUnreadCount(count); setFetchError(false) })
    } catch (e: any) {
      if (e?.name !== "AbortError") setFetchError(true)
    }
  }, [])

  // ── Polling ──────────────────────────────────────────────────────────────
  useEffect(() => {
    const controller = new AbortController()
    abortRef.current = controller
    fetchNotifications(controller.signal)
    pollRef.current = setInterval(() => fetchNotifications(controller.signal), POLL_INTERVAL)
    return () => { controller.abort(); if (pollRef.current) clearInterval(pollRef.current) }
  }, [fetchNotifications])

  // ── Push status ──────────────────────────────────────────────────────────
  useEffect(() => { getOneSignalStatus().then(setPushEnabled) }, [])

  // ── Dropdown position ────────────────────────────────────────────────────
  const calculatePosition = useCallback(() => {
    if (!buttonRef.current) return
    const rect = buttonRef.current.getBoundingClientRect()
    const mobile = window.innerWidth < 640
    setIsMobile(mobile)
    if (mobile) return
    const dropdownWidth = 320
    const spaceOnRight = window.innerWidth - rect.left
    if (spaceOnRight >= dropdownWidth) {
      setDropdownPos({ top: rect.bottom + 8, left: rect.left })
    } else {
      setDropdownPos({ top: rect.bottom + 8, right: window.innerWidth - rect.right })
    }
  }, [])

  useEffect(() => { if (open) calculatePosition() }, [open, calculatePosition])

  // ── Close on outside click / scroll / Escape ─────────────────────────────
  useEffect(() => {
    if (!open) return
    const handleKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false) }
    const handleClick = (e: MouseEvent) => {
      if (!buttonRef.current?.contains(e.target as Node) &&
        !panelRef.current?.contains(e.target as Node)) setOpen(false)
    }
    const handleScroll = (e: Event) => {
      if (panelRef.current?.contains(e.target as Node)) return
      setOpen(false)
    }
    document.addEventListener("keydown", handleKey)
    document.addEventListener("mousedown", handleClick)
    window.addEventListener("scroll", handleScroll, { passive: true, capture: true })
    return () => {
      document.removeEventListener("keydown", handleKey)
      document.removeEventListener("mousedown", handleClick)
      window.removeEventListener("scroll", handleScroll, true)
    }
  }, [open])

  // ── Mark single read ─────────────────────────────────────────────────────
  const markRead = useCallback(async (id: number) => {
    if (typeof id !== "number" || id <= 0) return
    startTransition(() => {
      setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, is_read: true } : n))
      setUnreadCount((prev) => Math.max(0, prev - 1))
    })
    try {
      const res = await fetch("/api/notifications", {
        method: "PATCH", credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      })
      if (!res.ok) {
        startTransition(() => {
          setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, is_read: false } : n))
          setUnreadCount((prev) => prev + 1)
        })
      }
    } catch {
      startTransition(() => {
        setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, is_read: false } : n))
        setUnreadCount((prev) => prev + 1)
      })
    }
  }, [])

  // ── Mark all read ────────────────────────────────────────────────────────
  const markAllRead = useCallback(async () => {
    const prev = notifications
    const prevCount = unreadCount
    startTransition(() => { setNotifications((n) => n.map((x) => ({ ...x, is_read: true }))); setUnreadCount(0) })
    try {
      const res = await fetch("/api/notifications", {
        method: "PATCH", credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ markAllRead: true }),
      })
      if (!res.ok) startTransition(() => { setNotifications(prev); setUnreadCount(prevCount) })
    } catch {
      startTransition(() => { setNotifications(prev); setUnreadCount(prevCount) })
    }
  }, [notifications, unreadCount])

  // ── Enable push ──────────────────────────────────────────────────────────
  const enablePush = async () => {
    if (!userId || userId <= 0) { setPushError("Please log in to enable notifications"); return }
    setPushLoading(true); setPushError(null)
    try {
      await withOneSignal(async (os) => {
        const permission = await os.Notifications.requestPermission()
        if (!permission) throw new Error("Permission denied")
        await os.login(String(userId))
        const subscribed = os.User.PushSubscription.optedIn
        setPushEnabled(!!subscribed)
        if (!subscribed) throw new Error("Subscription failed")
      })
    } catch (e: any) {
      const msg = e?.message || ""
      setPushError(msg.includes("denied")
        ? "Permission denied. Allow notifications in browser settings."
        : "Failed to enable push. Please try again.")
      console.error("[push] Enable failed:", e)
    } finally { setPushLoading(false) }
  }

  // ── Disable push ─────────────────────────────────────────────────────────
  const disablePush = async () => {
    setPushLoading(true); setPushError(null)
    try {
      await withOneSignal(async (os) => {
        await os.User.PushSubscription.optOut()
        setPushEnabled(false)
      })
    } catch (e) {
      setPushError("Failed to disable. Please try again.")
      console.error("[push] Disable failed:", e)
    } finally { setPushLoading(false) }
  }

  // ── Mobile panel height — accounts for bottom nav ────────────────────────
  // FIX: subtract bottom nav height so panel never overlaps it
  const mobileMaxHeight = `calc(100vh - ${BOTTOM_NAV_HEIGHT + 20}px - env(safe-area-inset-bottom))`
  const mobileListMaxHeight = `calc(100vh - ${BOTTOM_NAV_HEIGHT + 20 + 130}px - env(safe-area-inset-bottom))`

  return (
    <>
      {/* ── Bell Button ── */}
      <button
        ref={buttonRef}
        onClick={() => setOpen((o) => !o)}
        aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ""}`}
        aria-haspopup="dialog"
        
        className={`relative w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-150 flex-shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 ${
          open
            ? "bg-blue-600 text-white shadow-lg shadow-blue-200"
            : "bg-gray-100 hover:bg-gray-200 text-gray-600"
        }`}
      >
        <Bell className="w-4 h-4" aria-hidden />
        {unreadCount > 0 && (
          <span
            aria-hidden
            className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1 ring-2 ring-white"
          >
            {unreadCount > 99 ? "99+" : unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* ── Panel ── */}
      {open && (
        <>
          {/* Mobile backdrop */}
          <div
            className="fixed inset-0 z-40 sm:hidden bg-black/30 backdrop-blur-sm"
            onClick={() => setOpen(false)}
            aria-hidden
          />

          <div
            ref={panelRef}
            role="dialog"
            aria-label="Notifications panel"
            aria-modal="true"
            className={`
              fixed z-50 bg-white overflow-hidden shadow-2xl
              left-0 right-0 rounded-t-2xl
              sm:left-auto sm:right-auto sm:rounded-2xl sm:w-80 sm:border sm:border-gray-100
              sm:bottom-auto
            `}
            style={isMobile ? {
              // FIX: sit just above bottom nav bar
              bottom: BOTTOM_NAV_HEIGHT,
              maxHeight: mobileMaxHeight,
            } : {
              top: dropdownPos.top,
              ...(dropdownPos.left !== undefined
                ? { left: dropdownPos.left }
                : { right: dropdownPos.right }),
              maxHeight: "480px",
              width: "320px",
            }}
          >
            {/* Drag handle — mobile only */}
            <div className="flex justify-center pt-3 pb-1 sm:hidden" aria-hidden>
              <div className="w-10 h-1 bg-gray-200 rounded-full" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <p className="text-sm font-bold text-gray-900">Notifications</p>
                {unreadCount > 0 && (
                  <span className="text-[10px] bg-red-100 text-red-600 font-bold px-1.5 py-0.5 rounded-full">
                    {unreadCount} new
                  </span>
                )}
                {fetchError && (
                  <span className="text-[10px] bg-orange-100 text-orange-600 font-medium px-1.5 py-0.5 rounded-full">
                    Offline
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3">
                {unreadCount > 0 && (
                  <button
                    onClick={markAllRead}
                    disabled={isPending}
                    className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 font-semibold disabled:opacity-50"
                  >
                    <CheckCheck className="w-3 h-3" /> All read
                  </button>
                )}
                <button
                  onClick={() => setOpen(false)}
                  aria-label="Close notifications"
                  className="w-6 h-6 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                >
                  <X className="w-3.5 h-3.5 text-gray-500" aria-hidden />
                </button>
              </div>
            </div>

            {/* Push toggle */}
            <div className="px-4 py-2.5 bg-gray-50 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {pushEnabled
                    ? <Bell className="w-3 h-3 text-green-500" aria-hidden />
                    : <BellOff className="w-3 h-3 text-gray-400" aria-hidden />
                  }
                  <span className="text-xs text-gray-500">
                    {pushEnabled ? "Push notifications on" : "Push notifications off"}
                  </span>
                </div>
                <button
                  onClick={pushEnabled ? disablePush : enablePush}
                  disabled={pushLoading}
                  aria-label={pushEnabled ? "Disable push notifications" : "Enable push notifications"}
                  className={`text-xs font-semibold px-2.5 py-1 rounded-lg transition-colors disabled:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 flex items-center gap-1 ${
                    pushEnabled ? "text-red-500 hover:bg-red-50" : "text-blue-600 hover:bg-blue-50"
                  }`}
                >
                  {pushLoading
                    ? <Loader2 className="w-3 h-3 animate-spin" aria-hidden />
                    : pushEnabled ? "Disable" : "Enable"
                  }
                </button>
              </div>
              {pushError && (
                <p className="text-[10px] text-red-500 mt-1 leading-tight">{pushError}</p>
              )}
            </div>

            {/* Notifications list */}
            <div
              className="overflow-y-auto overscroll-contain"
              aria-live="polite"
              aria-atomic="true"
              style={{ maxHeight: isMobile ? mobileListMaxHeight : "300px" }}
            >
              {notifications.length === 0 ? (
                <div className="py-12 text-center px-6">
                  <div className="w-12 h-12 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                    <Bell className="w-5 h-5 text-gray-300" aria-hidden />
                  </div>
                  <p className="text-sm font-semibold text-gray-500">All caught up!</p>
                  <p className="text-xs text-gray-400 mt-1">No notifications yet</p>
                </div>
              ) : (
                notifications.map((n) => {
                  const cfg = TYPE_CONFIG[n.type] ?? TYPE_CONFIG.info
                  return (
                    <div
                      key={n.id}
                      onClick={() => !n.is_read && markRead(n.id)}
                      className={`relative flex items-start gap-3 px-4 py-3 border-b border-gray-50 last:border-0 transition-colors ${
                        !n.is_read
                          ? "bg-blue-50/30 cursor-pointer hover:bg-blue-50/60 active:bg-blue-50"
                          : "bg-white"
                      }`}
                      aria-label={`${cfg.label}: ${n.title}${!n.is_read ? " (unread)" : ""}`}
                    >
                      {/* Unread bar */}
                      {!n.is_read && (
                        <div className={`absolute left-0 top-2 bottom-2 w-0.5 rounded-r-full ${cfg.bar}`} aria-hidden />
                      )}

                      {/* Icon */}
                      <div className={`w-7 h-7 rounded-xl ${cfg.bg} flex items-center justify-center flex-shrink-0 mt-0.5`} aria-hidden>
                        {cfg.icon}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <p className={`text-xs font-semibold leading-tight ${n.is_read ? "text-gray-500" : "text-gray-900"}`}>
                            {n.title}
                          </p>
                          <time
                            dateTime={n.created_at}
                            className="text-[10px] text-gray-400 flex-shrink-0 mt-0.5"
                            title={new Date(n.created_at).toLocaleString("en-IN")}
                          >
                            {timeAgo(n.created_at)}
                          </time>
                        </div>
                        <p className={`text-xs mt-0.5 leading-relaxed ${n.is_read ? "text-gray-400" : "text-gray-600"}`}>
                          {n.body}
                        </p>
                        {n.action_url && (
                          <Link
                            href={n.action_url}
                            onClick={() => setOpen(false)}
                            className="inline-flex items-center gap-1 text-[11px] text-blue-600 font-medium mt-1.5 hover:underline focus:outline-none focus-visible:ring-1 focus-visible:ring-blue-500 rounded"
                          >
                            View details <ExternalLink className="w-2.5 h-2.5" aria-hidden />
                          </Link>
                        )}
                      </div>

                      {/* Unread dot */}
                      {!n.is_read && (
                        <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 mt-1.5 ${cfg.dot}`} aria-hidden />
                      )}
                    </div>
                  )
                })
              )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
              <div className="px-4 py-2.5 border-t border-gray-100 bg-gray-50/50">
                <p className="text-[10px] text-gray-400 text-center">
                  {notifications.length} notification{notifications.length !== 1 ? "s" : ""}
                  {notifications.length === MAX_NOTIFICATIONS_DISPLAY && " · latest 50 shown"}
                </p>
              </div>
            )}
          </div>
        </>
      )}
    </>
  )
}