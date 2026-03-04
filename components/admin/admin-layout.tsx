"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  LayoutDashboard, Users, CheckSquare, Wallet,
  ShoppingBag, LogOut, Menu, X, Shield, QrCode,
  LayoutGrid
} from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

interface AdminLayoutProps {
  user: { id: number; email: string }
  children: React.ReactNode
}

export function AdminLayout({ user, children }: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const pathname = usePathname()

  const navigation = [
    { name: 'Overview', href: '/admin', icon: LayoutDashboard },
    { name: 'Users', href: '/admin/users', icon: Users },
    { name: 'Tasks', href: '/admin/tasks', icon: CheckSquare },
    { name: 'Payments', href: '/admin/payments', icon: Wallet },
    { name: 'Products', href: '/admin/products', icon: ShoppingBag },
    { name: 'Campaigns', href: '/admin/campaigns', icon: QrCode },
    { name: 'Proofs', href: '/admin/proofs', icon: Shield },     
    { name: 'Sections', href: '/admin/sections', icon: LayoutGrid },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Bar - Mobile */}
      <div className="lg:hidden fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-50">
        <div className="flex items-center justify-between px-4 h-16">
          <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(!sidebarOpen)}>
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-red-600 flex items-center justify-center">
              <Shield className="w-4 h-4 text-white" />
            </div>
            <span className="font-semibold text-gray-900">Admin</span>
          </div>
          <div className="w-10" />
        </div>
      </div>

      {/* Sidebar */}
      <aside className={`
        fixed top-0 left-0 h-full bg-white border-r border-gray-200 z-40
        transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 w-64
      `}>
        {/* Logo */}
        <div className="h-16 flex items-center px-6 border-b border-gray-200">
          <Link href="/admin" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-red-600 flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-semibold text-gray-900 text-lg">Qyantra</span>
              <span className="block text-xs text-red-600 font-medium">Admin Panel</span>
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 mt-2">
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
                      ${isActive ? 'bg-red-50 text-red-700' : 'text-gray-700 hover:bg-gray-100'}
                    `}
                    onClick={() => setSidebarOpen(false)}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{item.name}</span>
                  </Link>
                </li>
              )
            })}
          </ul>

          {/* Back to Dashboard */}
          <div className="mt-6 pt-4 border-t border-gray-200">
            <Link
              href="/dashboard"
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-500 hover:bg-gray-100 transition-colors"
            >
              <LayoutDashboard className="w-5 h-5" />
              <span>User Dashboard</span>
            </Link>
          </div>
        </nav>

        {/* User Section */}
        <div className="border-t border-gray-200 p-3">
          <div className="px-3 py-2 mb-2">
            <p className="text-sm font-medium text-gray-900 truncate">{user.email}</p>
            <p className="text-xs text-red-600 font-medium">Administrator</p>
          </div>
          <Button
            variant="ghost"
            className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
            onClick={() => window.location.href = '/api/auth/logout'}
          >
            <LogOut className="w-4 h-4 mr-2" />
            <span className="text-sm font-medium">Sign Out</span>
          </Button>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-30 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Main Content */}
      <main className="lg:ml-64 pt-16 lg:pt-0">
        <div className="min-h-screen p-6">
          {children}
        </div>
      </main>
    </div>
  )
}