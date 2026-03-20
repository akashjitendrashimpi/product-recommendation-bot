"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  LayoutDashboard, CheckSquare, ShoppingCart, Wallet,
  User, LogOut, Menu, X, TrendingUp, Users, Sparkles,
} from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import type { UserProfile } from "@/lib/types"
import { NotificationBell } from "@/components/dashboard/notification-bell"

interface DashboardLayoutProps {
  user: { id: number; email: string }
  profile: UserProfile
  children: React.ReactNode
}

export function DashboardLayout({ user, profile, children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [stats, setStats] = useState({
    totalEarnings: 0,
    pendingEarnings: 0,
    tasksAvailable: 0,
    tasksCompleted: 0,
  })
  const pathname = usePathname()
// Auto-request push permission after 5 seconds on dashboard
useEffect(() => {
  const timer = setTimeout(() => {
    if (typeof window !== 'undefined' && (window as any).OneSignalDeferred) {
      (window as any).OneSignalDeferred.push(async (OneSignal: any) => {
        try {
          const isSubscribed = OneSignal.User.PushSubscription.optedIn
          if (!isSubscribed) {
            await OneSignal.Notifications.requestPermission()
            if (user?.id) {
              await OneSignal.login(String(user.id))
            }
          }
        } catch (e) {}
      })
    }
  }, 5000) // 5 seconds after dashboard loads
  return () => clearTimeout(timer)
}, [user?.id])
  useEffect(() => {
    async function fetchStats() {
      try {
        const [earningsRes, tasksRes] = await Promise.all([
          fetch('/api/earnings'),
          fetch('/api/tasks?country=IN')
        ])
        if (earningsRes.ok) {
          const d = await earningsRes.json()
          setStats(prev => ({
            ...prev,
            totalEarnings: d.summary?.totalEarnings || d.totalEarnings || 0,
            pendingEarnings: d.pendingEarnings || 0,
            tasksCompleted: d.summary?.tasksCompleted || 0,
          }))
        }
        if (tasksRes.ok) {
          const d = await tasksRes.json()
          setStats(prev => ({ ...prev, tasksAvailable: d.tasks?.length || 0 }))
        }
      } catch (error) {
        console.error('Error fetching stats:', error)
      }
    }
    fetchStats()
  }, [])

  // Bottom nav — 4 primary items (mobile only)
  const bottomNav = [
    { name: 'Home', href: '/dashboard', icon: LayoutDashboard, badge: null },
    { name: 'Tasks', href: '/dashboard/tasks', icon: CheckSquare, badge: stats.tasksAvailable > 0 ? String(stats.tasksAvailable) : null },
    { name: 'Earnings', href: '/dashboard/earnings', icon: Wallet, badge: null },
    { name: 'Profile', href: '/dashboard/profile', icon: User, badge: null },
  ]

  // Sidebar nav — all items (desktop)
  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, badge: null },
    { name: 'Tasks', href: '/dashboard/tasks', icon: CheckSquare, badge: stats.tasksAvailable > 0 ? stats.tasksAvailable : null },
    { name: 'Products', href: '/dashboard/products', icon: ShoppingCart, badge: null },
    { name: 'Earnings', href: '/dashboard/earnings', icon: Wallet, badge: null },
    { name: 'Refer & Earn', href: '/dashboard/referral', icon: Users, badge: '₹20' },
    { name: 'Profile', href: '/dashboard/profile', icon: User, badge: null },
  ]

  const displayName = profile.display_name || user.email.split('@')[0]
  const initials = displayName.slice(0, 2).toUpperCase()

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ── Mobile Top Bar ── */}
      <div className="lg:hidden fixed top-0 left-0 right-0 bg-white border-b border-gray-100 z-50 shadow-sm">
        <div className="flex items-center justify-between px-4 h-14">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            aria-label="Toggle menu"
            className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center"
          >
            {sidebarOpen ? <X className="w-5 h-5 text-gray-600" /> : <Menu className="w-5 h-5 text-gray-600" />}
          </button>

          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-black text-gray-900 text-base">Qyantra</span>
          </Link>

         <NotificationBell userId={user.id} />
        </div>
      </div>

      {/* ── Sidebar (desktop always visible, mobile slide-in) ── */}
      <aside className={`
        fixed top-0 left-0 h-full bg-white z-40 w-64
        transition-transform duration-300 ease-in-out shadow-xl
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:shadow-none lg:border-r lg:border-gray-100
      `}>
        <div className="flex flex-col h-full">

          {/* Logo */}
          <div className="h-16 flex items-center justify-between px-5 border-b border-gray-100">
            <Link href="/dashboard" className="flex items-center gap-3" onClick={() => setSidebarOpen(false)}>
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-md">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="font-black text-gray-900 text-lg leading-none">Qyantra</span>
                <p className="text-xs text-gray-400 font-medium">Earn & Discover</p>
              </div>
            </Link>
            <NotificationBell userId={user.id} />
          </div>

          {/* Earnings Card in sidebar */}
          <div className="p-4">
            <div className="bg-gradient-to-br from-blue-600 to-purple-700 rounded-2xl p-4 shadow-lg">
              <div className="flex items-center justify-between mb-3">
                <p className="text-blue-200 text-xs font-semibold uppercase tracking-wide">Total Earned</p>
                <TrendingUp className="w-4 h-4 text-blue-300" />
              </div>
              <div className="flex items-end gap-1 mb-3">
                <span className="text-white/80 text-sm font-bold">₹</span>
                <span className="text-white text-3xl font-black leading-none">
                  {Number(stats.totalEarnings).toFixed(0)}
                </span>
                <span className="text-white/60 text-xs mb-1">.{Number(stats.totalEarnings).toFixed(2).split('.')[1]}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                  <span className="text-blue-200 text-xs">{stats.tasksCompleted} tasks done</span>
                </div>
                {stats.pendingEarnings > 0 && (
                  <span className="text-xs bg-white/20 text-white px-2 py-0.5 rounded-full font-medium">
                    ₹{Number(stats.pendingEarnings).toFixed(0)} pending
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 pb-3 overflow-y-auto">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider px-3 mb-2">Menu</p>
            <ul className="space-y-1">
              {navigation.map((item) => {
                const Icon = item.icon
                const isActive = item.href === '/dashboard'
                  ? pathname === '/dashboard'
                  : pathname.startsWith(item.href)
                return (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      onClick={() => setSidebarOpen(false)}
                      className={`
                        flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold
                        transition-all duration-150
                        ${isActive
                          ? 'bg-blue-50 text-blue-700 shadow-sm'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                        }
                      `}
                    >
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${isActive ? 'bg-blue-600' : 'bg-gray-100'}`}>
                        <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-gray-500'}`} />
                      </div>
                      <span className="flex-1">{item.name}</span>
                      {item.badge && (
                        <Badge className={`text-xs px-2 py-0.5 ${
                          item.name === 'Refer & Earn'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-blue-600 text-white'
                        }`}>
                          {item.badge}
                        </Badge>
                      )}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </nav>

          {/* User Section */}
          <div className="border-t border-gray-100 p-3">
            <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors">
              <Avatar className="w-9 h-9 border-2 border-blue-100">
                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-sm font-bold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-gray-900 truncate">{displayName}</p>
                <p className="text-xs text-gray-400 truncate">{user.email}</p>
              </div>
            </div>
            <button
              onClick={() => window.location.href = '/api/auth/logout'}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-red-500 hover:bg-red-50 transition-colors mt-1"
            >
              <div className="w-8 h-8 rounded-xl bg-red-50 flex items-center justify-center">
                <LogOut className="w-4 h-4 text-red-500" />
              </div>
              Sign Out
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── Main Content ── */}
      {/* pb-20 on mobile to avoid bottom nav overlap */}
      <main className="lg:ml-64 pt-14 lg:pt-0 min-h-screen pb-24 lg:pb-0">
        <div className="p-4 md:p-6 lg:p-8">
          {children}
        </div>
      </main>

      {/* ── Mobile Bottom Navigation ── */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 z-50 shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
       <div className="flex items-center justify-around h-16 px-2 pb-safe">
          {bottomNav.map((item) => {
            const Icon = item.icon
            const isActive = item.href === '/dashboard'
              ? pathname === '/dashboard'
              : pathname.startsWith(item.href)
            return (
              <Link
                key={item.name}
                href={item.href}
                className="flex flex-col items-center justify-center gap-0.5 flex-1 h-full relative py-2"
              >
                <div className="relative">
                  <div className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all ${
                    isActive
                      ? 'bg-blue-600 shadow-md shadow-blue-200'
                      : 'bg-transparent'
                  }`}>
                    <Icon className={`w-5 h-5 transition-colors ${isActive ? 'text-white' : 'text-gray-400'}`} />
                  </div>
                  {/* Badge for tasks count */}
                  {item.badge && !isActive && (
                    <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-blue-600 text-white text-[10px] font-black rounded-full flex items-center justify-center px-1 shadow-sm">
                      {item.badge}
                    </span>
                  )}
                </div>
                <span className={`text-[10px] font-semibold transition-colors leading-none ${
                  isActive ? 'text-blue-600' : 'text-gray-400'
                }`}>
                  {item.name}
                </span>
              </Link>
            )
          })}
        </div>
      </nav>
    </div>
  )
}