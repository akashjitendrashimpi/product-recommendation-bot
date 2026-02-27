"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  LayoutDashboard,
  CheckSquare,
  ShoppingCart,
  Wallet,
  User,
  Bell,
  LogOut,
  ChevronRight,
  TrendingUp,
  Clock,
  Menu,
  X
} from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import type { UserProfile } from "@/lib/types"

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
    tasksCompleted: 0,
    tasksAvailable: 0
  })
  const pathname = usePathname()

  // Fetch real stats from API
  useEffect(() => {
    async function fetchStats() {
      try {
        const [earningsRes, tasksRes] = await Promise.all([
          fetch('/api/earnings'),
          fetch('/api/tasks?country=IN')
        ])

        if (earningsRes.ok) {
          const earningsData = await earningsRes.json()
          setStats(prev => ({
            ...prev,
            totalEarnings: earningsData.totalEarnings || 0,
            pendingEarnings: earningsData.pendingEarnings || 0
          }))
        }

        if (tasksRes.ok) {
          const tasksData = await tasksRes.json()
          setStats(prev => ({
            ...prev,
            tasksAvailable: tasksData.tasks?.length || 0
          }))
        }
      } catch (error) {
        console.error('Error fetching stats:', error)
      }
    }

    fetchStats()
  }, [])

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Tasks', href: '/dashboard/tasks', icon: CheckSquare },
    { name: 'Products', href: '/dashboard/products', icon: ShoppingCart },
    { name: 'Earnings', href: '/dashboard/earnings', icon: Wallet },
    { name: 'Profile', href: '/dashboard/profile', icon: User },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Bar - Mobile */}
      <div className="lg:hidden fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-50">
        <div className="flex items-center justify-between px-4 h-16">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>

          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
              <span className="text-white font-bold text-sm">Q</span>
            </div>
            <span className="font-semibold text-gray-900">Qyantra</span>
          </Link>

          <Button variant="ghost" size="icon">
            <Bell className="w-5 h-5 text-gray-600" />
          </Button>
        </div>
      </div>

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 h-full bg-white border-r border-gray-200 z-40
          transition-transform duration-300 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0 w-64
        `}
      >
        {/* Logo */}
        <div className="h-16 flex items-center px-6 border-b border-gray-200">
          <Link href="/dashboard" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center">
              <span className="text-white font-bold">Q</span>
            </div>
            <span className="font-semibold text-gray-900 text-lg">Qyantra</span>
          </Link>
        </div>

        {/* Stats Summary */}
        <div className="p-4 border-b border-gray-200 bg-gray-50">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Total Earnings</span>
              <TrendingUp className="w-3.5 h-3.5 text-green-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">₹{stats.totalEarnings.toFixed(2)}</p>
            <div className="flex items-center gap-4 text-xs">
              <span className="text-gray-600">
                Pending: <span className="font-semibold text-gray-900">₹{stats.pendingEarnings.toFixed(2)}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3">
          <ul className="space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              return (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className={`
                      flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium
                      transition-colors duration-150
                      ${isActive
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-gray-700 hover:bg-gray-100'
                      }
                    `}
                    onClick={() => setSidebarOpen(false)}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{item.name}</span>
                    {item.name === 'Tasks' && stats.tasksAvailable > 0 && (
                      <Badge className="ml-auto bg-blue-600 text-white text-xs px-2 py-0.5">
                        {stats.tasksAvailable}
                      </Badge>
                    )}
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>

        {/* User Section */}
        <div className="border-t border-gray-200 p-3">
          <div className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
            <Avatar className="w-8 h-8 border-2 border-gray-200">
              <AvatarFallback className="bg-blue-600 text-white text-sm font-semibold">
                {profile.display_name?.[0]?.toUpperCase() || user.email[0].toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {profile.display_name || 'User'}
              </p>
              <p className="text-xs text-gray-500 truncate">{user.email}</p>
            </div>
          </div>

          <Button
            variant="ghost"
            className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 mt-2"
            onClick={() => window.location.href = '/api/auth/logout'}
          >
            <LogOut className="w-4 h-4 mr-2" />
            <span className="text-sm font-medium">Sign Out</span>
          </Button>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className="lg:ml-64 pt-16 lg:pt-0">
        <div className="min-h-screen">
          {children}
        </div>
      </main>
    </div>
  )
}