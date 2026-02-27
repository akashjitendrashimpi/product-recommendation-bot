"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  TrendingUp,
  Clock,
  CheckCircle2,
  Target,
  ArrowRight,
  Zap,
  DollarSign
} from "lucide-react"
import Link from "next/link"

interface DashboardHomeProps {
  userId: number
}

export function DashboardHome({ userId }: DashboardHomeProps) {
  const [earnings, setEarnings] = useState({
    total: 0,
    pending: 0,
    thisWeek: 0,
    lastPayout: 0
  })
  const [tasks, setTasks] = useState({
    completed: 0,
    available: 0
  })
  const [recentActivity, setRecentActivity] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        setLoading(true)
        
        // Fetch earnings
        const earningsRes = await fetch('/api/earnings')
        if (earningsRes.ok) {
          const data = await earningsRes.json()
          setEarnings({
            total: data.totalEarnings || 0,
            pending: data.pendingEarnings || 0,
            thisWeek: data.weeklyEarnings || 0,
            lastPayout: data.lastPayout || 0
          })
          setRecentActivity(data.recentEarnings?.slice(0, 5) || [])
        }

        // Fetch tasks
        const tasksRes = await fetch('/api/tasks?country=IN')
        if (tasksRes.ok) {
          const data = await tasksRes.json()
          setTasks({
            completed: data.completedCount || 0,
            available: data.tasks?.length || 0
          })
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [userId])

  if (loading) {
    return (
      <div className="p-6 lg:p-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-64"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Dashboard</h1>
        <p className="text-gray-600">Track your earnings and complete tasks to earn more.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Total Earnings */}
        <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-blue-600" />
              </div>
              <TrendingUp className="w-4 h-4 text-green-600" />
            </div>
            <p className="text-sm font-medium text-gray-600 mb-1">Total Earnings</p>
            <p className="text-3xl font-bold text-gray-900">₹{earnings.total.toFixed(2)}</p>
            <p className="text-xs text-gray-500 mt-2">+₹{earnings.thisWeek.toFixed(2)} this week</p>
          </CardContent>
        </Card>

        {/* Pending */}
        <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                <Clock className="w-5 h-5 text-green-600" />
              </div>
            </div>
            <p className="text-sm font-medium text-gray-600 mb-1">Pending Payout</p>
            <p className="text-3xl font-bold text-gray-900">₹{earnings.pending.toFixed(2)}</p>
            <p className="text-xs text-gray-500 mt-2">Ready in 48 hours</p>
          </CardContent>
        </Card>

        {/* Tasks Completed */}
        <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-purple-600" />
              </div>
            </div>
            <p className="text-sm font-medium text-gray-600 mb-1">Tasks Completed</p>
            <p className="text-3xl font-bold text-gray-900">{tasks.completed}</p>
            <p className="text-xs text-gray-500 mt-2">All time</p>
          </CardContent>
        </Card>

        {/* Available Tasks */}
        <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
                <Target className="w-5 h-5 text-orange-600" />
              </div>
              <span className="text-xs font-semibold text-orange-600 bg-orange-50 px-2 py-1 rounded">
                NEW
              </span>
            </div>
            <p className="text-sm font-medium text-gray-600 mb-1">Available Tasks</p>
            <p className="text-3xl font-bold text-gray-900">{tasks.available}</p>
            <p className="text-xs text-gray-500 mt-2">Start earning now</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <div className="lg:col-span-2">
          <Card className="border border-gray-200 shadow-sm">
            <CardHeader className="border-b border-gray-100 pb-4">
              <CardTitle className="text-lg font-semibold text-gray-900">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-3">
              <Link href="/dashboard/tasks">
                <Button 
                  className="w-full h-14 bg-blue-600 hover:bg-blue-700 text-white justify-between group"
                  size="lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded bg-white/20 flex items-center justify-center">
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                    <div className="text-left">
                      <p className="font-semibold">Browse Tasks</p>
                      <p className="text-xs text-blue-100">{tasks.available} tasks available</p>
                    </div>
                  </div>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>

              <Link href="/dashboard/products">
                <Button 
                  variant="outline"
                  className="w-full h-14 justify-between group border-2 hover:border-blue-300 hover:bg-blue-50"
                  size="lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded bg-gray-100 flex items-center justify-center">
                      <Zap className="w-5 h-5 text-gray-700" />
                    </div>
                    <div className="text-left">
                      <p className="font-semibold text-gray-900">View Recommendations</p>
                      <p className="text-xs text-gray-600">AI-powered products</p>
                    </div>
                  </div>
                  <ArrowRight className="w-5 h-5 text-gray-400 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>

              {earnings.pending >= 500 && (
                <Link href="/dashboard/earnings">
                  <Button 
                    variant="outline"
                    className="w-full h-14 justify-between group border-2 border-green-200 hover:border-green-300 hover:bg-green-50"
                    size="lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded bg-green-100 flex items-center justify-center">
                        <DollarSign className="w-5 h-5 text-green-700" />
                      </div>
                      <div className="text-left">
                        <p className="font-semibold text-gray-900">Request Payout</p>
                        <p className="text-xs text-gray-600">₹{earnings.pending.toFixed(2)} available</p>
                      </div>
                    </div>
                    <ArrowRight className="w-5 h-5 text-gray-400 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card className="border border-gray-200 shadow-sm">
          <CardHeader className="border-b border-gray-100 pb-4">
            <CardTitle className="text-lg font-semibold text-gray-900">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {recentActivity.length === 0 ? (
              <div className="text-center py-8">
                <Clock className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-sm text-gray-600">No activity yet</p>
                <p className="text-xs text-gray-500 mt-1">Complete tasks to see your earnings here</p>
              </div>
            ) : (
              <div className="space-y-4">
                {recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-center gap-3 pb-4 border-b border-gray-100 last:border-0 last:pb-0">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      activity.amount > 0 ? 'bg-green-100' : 'bg-gray-100'
                    }`}>
                      {activity.amount > 0 ? (
                        <CheckCircle2 className="w-5 h-5 text-green-600" />
                      ) : (
                        <Clock className="w-5 h-5 text-gray-600" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {activity.description || 'Task completed'}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(activity.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <span className={`text-sm font-bold ${
                      activity.amount > 0 ? 'text-green-600' : 'text-gray-600'
                    }`}>
                      {activity.amount > 0 ? '+' : ''}₹{Math.abs(activity.amount).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}