"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, CheckSquare, Wallet, ShoppingBag, TrendingUp, Clock } from "lucide-react"

export function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalTasks: 0,
    pendingPayments: 0,
    totalProducts: 0,
    totalEarningsPaid: 0,
    activeUsers: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const [usersRes, tasksRes, paymentsRes] = await Promise.all([
        fetch('/api/admin/users'),
        fetch('/api/admin/tasks'),
        fetch('/api/payments'),
      ])

      if (usersRes.ok) {
        const data = await usersRes.json()
        setStats(prev => ({ ...prev, totalUsers: data.users?.length || 0 }))
      }
      if (tasksRes.ok) {
        const data = await tasksRes.json()
        setStats(prev => ({ ...prev, totalTasks: data.tasks?.length || 0 }))
      }
      if (paymentsRes.ok) {
        const data = await paymentsRes.json()
        const pending = data.payments?.filter((p: any) => p.status === 'pending')?.length || 0
        setStats(prev => ({ ...prev, pendingPayments: pending }))
      }
    } catch (error) {
      console.error('Error fetching admin stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const statCards = [
    { title: 'Total Users', value: stats.totalUsers, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
    { title: 'Total Tasks', value: stats.totalTasks, icon: CheckSquare, color: 'text-green-600', bg: 'bg-green-50' },
    { title: 'Pending Payments', value: stats.pendingPayments, icon: Clock, color: 'text-orange-600', bg: 'bg-orange-50' },
    { title: 'Total Products', value: stats.totalProducts, icon: ShoppingBag, color: 'text-purple-600', bg: 'bg-purple-50' },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Admin Overview</h1>
        <p className="text-gray-600 mt-1">Welcome to the Qyantra admin panel</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.title} className="border border-gray-200 shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                    <p className="text-3xl font-bold text-gray-900 mt-1">
                      {loading ? '...' : stat.value}
                    </p>
                  </div>
                  <div className={`w-12 h-12 rounded-xl ${stat.bg} flex items-center justify-center`}>
                    <Icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border border-gray-200">
          <CardHeader>
            <CardTitle className="text-lg">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { label: 'Manage Users', href: '/admin/users', color: 'bg-blue-600' },
              { label: 'Add New Task', href: '/admin/tasks', color: 'bg-green-600' },
              { label: 'Review Payments', href: '/admin/payments', color: 'bg-orange-600' },
              { label: 'Manage Products', href: '/admin/products', color: 'bg-purple-600' },
            ].map((action) => (
              <a
                key={action.label}
                href={action.href}
                className={`block w-full text-center py-2.5 px-4 rounded-lg text-white text-sm font-medium ${action.color} hover:opacity-90 transition-opacity`}
              >
                {action.label}
              </a>
            ))}
          </CardContent>
        </Card>

        <Card className="border border-gray-200">
          <CardHeader>
            <CardTitle className="text-lg">System Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { label: 'Database', status: 'Online', color: 'text-green-600' },
              { label: 'Auth System', status: 'Online', color: 'text-green-600' },
              { label: 'Payment API', status: 'Configured', color: 'text-blue-600' },
              { label: 'CPA Network', status: 'Check API Keys', color: 'text-orange-600' },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between py-1 border-b border-gray-100 last:border-0">
                <span className="text-sm text-gray-700">{item.label}</span>
                <span className={`text-sm font-medium ${item.color}`}>{item.status}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}