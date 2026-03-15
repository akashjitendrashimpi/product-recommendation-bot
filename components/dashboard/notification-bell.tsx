"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import {
  Bell, BellOff, CheckCheck, X, ExternalLink,
  CheckCircle2, AlertTriangle, XCircle, Info
} from "lucide-react"
import Link from "next/link"

interface Notification {
  id: number
  title: string
  body: string
  type: 'info' | 'success' | 'warning' | 'error'
  is_read: boolean
  action_url: string | null
  created_at: string
}

interface DropdownPos {
  top: number
  left: number
  right: number
  useRight: boolean
}

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)
  for (let i = 0; i < rawData.length; ++i) outputArray[i] = rawData.charCodeAt(i)
  return outputArray
}

export function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [open, setOpen] = useState(false)
  const [pushEnabled, setPushEnabled] = useState(false)
  const [pushLoading, setPushLoading] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [dropdownPos, setDropdownPos] = useState<DropdownPos>({ top: 0, left: 0, right: 0, useRight: true })
  const buttonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    fetchNotifications()
    const interval = setInterval(fetchNotifications, 30000)
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      navigator.serviceWorker.ready.then(reg => {
        reg.pushManager.getSubscription().then(sub => setPushEnabled(!!sub))
      })
    }
    return () => clearInterval(interval)
  }, [])

  // Calculate dropdown position based on button location
  const calculatePosition = useCallback(() => {
    if (!buttonRef.current) return
    const rect = buttonRef.current.getBoundingClientRect()
    const mobile = window.innerWidth < 640
    setIsMobile(mobile)

    if (!mobile) {
      const dropdownWidth = 320
      const spaceOnRight = window.innerWidth - rect.left
      const spaceOnLeft = rect.right

      if (spaceOnRight >= dropdownWidth) {
        // Enough space on right — align left edge with button
        setDropdownPos({
          top: rect.bottom + 8,
          left: rect.left,
          right: 0,
          useRight: false
        })
      } else {
        // Not enough space on right — align right edge with button
        setDropdownPos({
          top: rect.bottom + 8,
          left: 0,
          right: window.innerWidth - rect.right,
          useRight: true
        })
      }
    }
  }, [])

  useEffect(() => {
    if (open) calculatePosition()
  }, [open, calculatePosition])

  // Close on outside click or scroll
  useEffect(() => {
   const handleClick = (e: MouseEvent) => {
  if (
    buttonRef.current &&
    !buttonRef.current.contains(e.target as Node) &&
    !(e.target as Element).closest('[data-notification-panel]')
  ) {
    setOpen(false)
  }
}
    const handleScroll = () => setOpen(false)
    document.addEventListener('mousedown', handleClick)
    window.addEventListener('scroll', handleScroll, true)
    return () => {
      document.removeEventListener('mousedown', handleClick)
      window.removeEventListener('scroll', handleScroll, true)
    }
  }, [])

  const fetchNotifications = async () => {
    try {
      const res = await fetch('/api/notifications')
      if (res.ok) {
        const data = await res.json()
        setNotifications(data.notifications || [])
        setUnreadCount(data.unreadCount || 0)
      }
    } catch (e) {}
  }

  const markRead = async (id: number) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n))
    setUnreadCount(prev => Math.max(0, prev - 1))
    await fetch('/api/notifications', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id })
    })
  }

  const markAllRead = async () => {
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
    setUnreadCount(0)
    await fetch('/api/notifications', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ markAllRead: true })
    })
  }

  const enablePush = async () => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      alert('Push notifications not supported.'); return
    }
    const KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
    if (!KEY) { alert('Push not configured.'); return }
    setPushLoading(true)
    try {
      const perm = await Notification.requestPermission()
      if (perm !== 'granted') { alert('Allow notifications in browser settings.'); return }
      const reg = await navigator.serviceWorker.register('/sw.js')
      await navigator.serviceWorker.ready
      const sub = await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: urlBase64ToUint8Array(KEY) })
      const j = sub.toJSON()
      await fetch('/api/push-subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ endpoint: sub.endpoint, p256dh: j.keys?.p256dh, auth: j.keys?.auth })
      })
      setPushEnabled(true)
    } catch (e) { alert('Failed to enable push notifications.') }
    finally { setPushLoading(false) }
  }

  const disablePush = async () => {
    setPushLoading(true)
    try {
      const reg = await navigator.serviceWorker.ready
      const sub = await reg.pushManager.getSubscription()
      if (sub) {
        await fetch('/api/push-subscription', {
          method: 'DELETE', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ endpoint: sub.endpoint })
        })
        await sub.unsubscribe()
      }
      setPushEnabled(false)
    } catch (e) {}
    finally { setPushLoading(false) }
  }

  const typeConfig = {
    success: { icon: <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />, bg: 'bg-green-100', dot: 'bg-green-500', bar: 'bg-green-500' },
    warning: { icon: <AlertTriangle className="w-3.5 h-3.5 text-orange-500" />, bg: 'bg-orange-100', dot: 'bg-orange-500', bar: 'bg-orange-500' },
    error: { icon: <XCircle className="w-3.5 h-3.5 text-red-500" />, bg: 'bg-red-100', dot: 'bg-red-500', bar: 'bg-red-500' },
    info: { icon: <Info className="w-3.5 h-3.5 text-blue-500" />, bg: 'bg-blue-100', dot: 'bg-blue-500', bar: 'bg-blue-500' },
  }

  const timeAgo = (date: string) => {
    const s = Math.floor((Date.now() - new Date(date).getTime()) / 1000)
    if (s < 60) return 'just now'
    if (s < 3600) return `${Math.floor(s / 60)}m ago`
    if (s < 86400) return `${Math.floor(s / 3600)}h ago`
    return `${Math.floor(s / 86400)}d ago`
  }

  return (
    <>
      {/* ── Bell Button ── */}
      <button
        ref={buttonRef}
        onClick={() => setOpen(o => !o)}
        aria-label="Notifications"
        className={`relative w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-150 flex-shrink-0 ${
          open ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
        }`}
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1 ring-2 ring-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* ── Panel ── */}
      {open && (
        <>
          {/* Backdrop — mobile only */}
          <div
            className="fixed inset-0 z-40 sm:hidden bg-black/30 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />

          {/* Mobile: bottom sheet | Desktop: fixed dropdown */}
          <div
            data-notification-panel
            className="fixed z-50 bg-white overflow-hidden shadow-2xl
              bottom-0 left-0 right-0 rounded-t-2xl
              sm:bottom-auto sm:rounded-2xl sm:w-80 sm:border sm:border-gray-100"
            style={!isMobile ? {
              top: dropdownPos.top,
              ...(dropdownPos.useRight
                ? { right: dropdownPos.right }
                : { left: dropdownPos.left }),
              maxHeight: '480px',
              width: '320px',
            } : {
              maxHeight: '85vh',
            }}
          >
            {/* Drag handle — mobile only */}
            <div className="flex justify-center pt-3 pb-1 sm:hidden">
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
              </div>
              <div className="flex items-center gap-3">
                {unreadCount > 0 && (
                  <button onClick={markAllRead} className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 font-semibold">
                    <CheckCheck className="w-3 h-3" /> All read
                  </button>
                )}
                <button onClick={() => setOpen(false)} aria-label="Close" className="w-6 h-6 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center">
                  <X className="w-3.5 h-3.5 text-gray-500" />
                </button>
              </div>
            </div>

            {/* Push toggle */}
            <div className="flex items-center justify-between px-4 py-2 bg-gray-50 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <div className={`w-1.5 h-1.5 rounded-full ${pushEnabled ? 'bg-green-500' : 'bg-gray-300'}`} />
                <span className="text-xs text-gray-500">
                  {pushEnabled ? 'Push on' : 'Push off'}
                </span>
              </div>
              <button
                onClick={pushEnabled ? disablePush : enablePush}
                disabled={pushLoading}
                className={`text-xs font-semibold px-2.5 py-1 rounded-lg transition-colors disabled:opacity-50 ${
                  pushEnabled ? 'text-red-500 hover:bg-red-50' : 'text-blue-600 hover:bg-blue-50'
                }`}
              >
                {pushLoading ? '...' : pushEnabled ? 'Disable' : 'Enable'}
              </button>
            </div>

            {/* List */}
            <div className="overflow-y-auto" style={{ maxHeight: isMobile ? 'calc(85vh - 130px)' : '320px' }}>
              {notifications.length === 0 ? (
                <div className="py-12 text-center px-6">
                  <div className="w-12 h-12 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                    <Bell className="w-5 h-5 text-gray-300" />
                  </div>
                  <p className="text-sm font-semibold text-gray-500">All caught up!</p>
                  <p className="text-xs text-gray-400 mt-1">No notifications yet</p>
                </div>
              ) : (
                notifications.map(n => {
                  const cfg = typeConfig[n.type] || typeConfig.info
                  return (
                    <div
                      key={n.id}
                      onClick={() => !n.is_read && markRead(n.id)}
                      className={`relative flex items-start gap-3 px-4 py-3 border-b border-gray-50 last:border-0 transition-colors ${
                        !n.is_read ? 'bg-blue-50/30 cursor-pointer hover:bg-blue-50/60' : 'bg-white'
                      }`}
                    >
                      {/* Left accent bar */}
                      {!n.is_read && (
                        <div className={`absolute left-0 top-2 bottom-2 w-0.5 rounded-r-full ${cfg.bar}`} />
                      )}

                      {/* Icon */}
                      <div className={`w-7 h-7 rounded-xl ${cfg.bg} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                        {cfg.icon}
                      </div>

                      {/* Text */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <p className={`text-xs font-semibold leading-tight ${n.is_read ? 'text-gray-500' : 'text-gray-900'}`}>
                            {n.title}
                          </p>
                          <span className="text-[10px] text-gray-400 flex-shrink-0 mt-0.5">{timeAgo(n.created_at)}</span>
                        </div>
                        <p className={`text-xs mt-0.5 leading-relaxed ${n.is_read ? 'text-gray-400' : 'text-gray-600'}`}>
                          {n.body}
                        </p>
                        {n.action_url && (
                          <Link
                            href={n.action_url}
                            onClick={() => setOpen(false)}
                            className="inline-flex items-center gap-1 text-[11px] text-blue-600 font-medium mt-1 hover:underline"
                          >
                            View <ExternalLink className="w-2.5 h-2.5" />
                          </Link>
                        )}
                      </div>

                      {/* Unread dot */}
                      {!n.is_read && <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 mt-1.5 ${cfg.dot}`} />}
                    </div>
                  )
                })
              )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
              <div className="px-4 py-2 border-t border-gray-100 bg-gray-50/50">
                <p className="text-[10px] text-gray-400 text-center">
                  Last {notifications.length} notification{notifications.length !== 1 ? 's' : ''}
                </p>
              </div>
            )}
          </div>
        </>
      )}
    </>
  )
}