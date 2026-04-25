"use client"

import { useState, useEffect, useCallback } from "react"
import {
  Users, Clock, IndianRupee, FileCheck,
  TrendingUp, Trophy, AlertCircle, RefreshCw
} from "lucide-react"
import Link from "next/link"

// ── Types ────────────────────────────────────────────────────────────────────
interface DailySignup { date: string; count: number }
interface TaskRate { taskId: number; total: number; successful: number; rate: number }
interface TopEarner { id: number; name: string; balance: number }

interface Analytics {
  totalUsers: number
  totalPaidOut: number
  pendingProofs: number
  pendingPayments: number
  dailySignups: DailySignup[]
  taskCompletionRates: TaskRate[]
  topEarners: TopEarner[]
}

// ── Micro SVG Bar Chart ───────────────────────────────────────────────────────
function SignupChart({ data }: { data: DailySignup[] }) {
  const max = Math.max(...data.map(d => d.count), 1)
  const last7 = data.slice(-30) // show all 30 days

  if (data.every(d => d.count === 0)) {
    return (
      <div className="h-24 flex items-center justify-center text-gray-400 text-xs">
        No signups in the last 30 days
      </div>
    )
  }

  return (
    <div className="w-full h-24 flex items-end gap-0.5" aria-label="Daily signups chart" role="img">
      {last7.map((day) => {
        const pct = max > 0 ? (day.count / max) * 100 : 0
        return (
          <div
            key={day.date}
            className="flex-1 flex flex-col items-center justify-end group relative"
          >
            <div
              className="w-full bg-blue-500 rounded-t-sm transition-all duration-300 group-hover:bg-blue-400"
              style={{ height: `${Math.max(pct, 2)}%` }}
            />
            {/* Tooltip on hover */}
            <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[9px] px-1.5 py-0.5 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
              {day.date.slice(5)}: {day.count}
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ── Component ────────────────────────────────────────────────────────────────
export function AdminDashboard() {
  const [analytics, setAnalytics] = useState<Analytics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  const fetchAnalytics = useCallback(async () => {
    setLoading(true)
    setError(false)
    try {
      const res = await fetch("/api/admin/analytics")
      if (!res.ok) throw new Error()
      const data = await res.json()
      setAnalytics(data)
    } catch {
      setError(true)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchAnalytics() }, [fetchAnalytics])

  const statCards = analytics ? [
    {
      label: "Total Users",
      value: analytics.totalUsers.toLocaleString("en-IN"),
      icon: Users,
      color: "text-blue-600",
      bg: "bg-blue-50",
      border: "border-blue-100",
    },
    {
      label: "Total Paid Out",
      value: `₹${Number(analytics.totalPaidOut).toLocaleString("en-IN", { maximumFractionDigits: 0 })}`,
      icon: IndianRupee,
      color: "text-green-600",
      bg: "bg-green-50",
      border: "border-green-100",
    },
    {
      label: "Pending Proofs",
      value: analytics.pendingProofs.toLocaleString("en-IN"),
      icon: FileCheck,
      color: analytics.pendingProofs > 0 ? "text-orange-600" : "text-gray-400",
      bg: analytics.pendingProofs > 0 ? "bg-orange-50" : "bg-gray-50",
      border: analytics.pendingProofs > 0 ? "border-orange-100" : "border-gray-100",
      href: "/admin/proofs",
    },
    {
      label: "Pending Payments",
      value: analytics.pendingPayments.toLocaleString("en-IN"),
      icon: Clock,
      color: analytics.pendingPayments > 0 ? "text-red-600" : "text-gray-400",
      bg: analytics.pendingPayments > 0 ? "bg-red-50" : "bg-gray-50",
      border: analytics.pendingPayments > 0 ? "border-red-100" : "border-gray-100",
      href: "/admin/payments",
    },
  ] : []

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Admin Overview</h1>
          <p className="text-sm text-gray-500 mt-0.5">Live platform analytics</p>
        </div>
        <button
          onClick={fetchAnalytics}
          disabled={loading}
          className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-800 bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-700">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          Failed to load analytics. Check your connection or try refreshing.
        </div>
      )}

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-24 bg-gray-100 rounded-2xl animate-pulse" />
            ))
          : statCards.map((stat) => {
              const Icon = stat.icon
              const card = (
                <div className={`border ${stat.border} ${stat.bg} rounded-2xl p-4 flex flex-col gap-3 hover:shadow-sm transition-shadow`}>
                  <div className={`w-9 h-9 bg-white rounded-xl flex items-center justify-center shadow-sm`}>
                    <Icon className={`w-4.5 h-4.5 ${stat.color}`} />
                  </div>
                  <div>
                    <p className={`text-2xl font-black ${stat.color}`}>{stat.value}</p>
                    <p className="text-xs text-gray-500 font-medium mt-0.5">{stat.label}</p>
                  </div>
                </div>
              )
              return stat.href ? (
                <Link key={stat.label} href={stat.href} className="block">{card}</Link>
              ) : (
                <div key={stat.label}>{card}</div>
              )
            })}
      </div>

      {/* Daily Signups Chart */}
      <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-sm font-black text-gray-900">Daily Signups</p>
            <p className="text-xs text-gray-400">Last 30 days</p>
          </div>
          {analytics && (
            <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full">
              {analytics.dailySignups.reduce((s, d) => s + d.count, 0)} total
            </span>
          )}
        </div>
        {loading ? (
          <div className="h-24 bg-gray-100 rounded-xl animate-pulse" />
        ) : analytics ? (
          <SignupChart data={analytics.dailySignups} />
        ) : null}
      </div>

      {/* Task Completion Rates + Top Earners */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Task Completion Rates */}
        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-4 h-4 text-purple-600" />
            <p className="text-sm font-black text-gray-900">Task Completion Rates</p>
          </div>
          {loading ? (
            <div className="space-y-2">
              {[1, 2, 3].map(i => <div key={i} className="h-8 bg-gray-100 rounded-lg animate-pulse" />)}
            </div>
          ) : !analytics?.taskCompletionRates.length ? (
            <p className="text-xs text-gray-400 py-4 text-center">No task completion data yet</p>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {analytics.taskCompletionRates
                .sort((a, b) => b.total - a.total)
                .slice(0, 10)
                .map((t) => (
                  <div key={t.taskId} className="flex items-center gap-3">
                    <span className="text-xs text-gray-500 w-16 flex-shrink-0">Task #{t.taskId}</span>
                    <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-purple-500 rounded-full transition-all duration-500"
                        style={{ width: `${t.rate}%` }}
                      />
                    </div>
                    <span className="text-xs font-bold text-gray-700 w-10 text-right flex-shrink-0">
                      {t.rate}%
                    </span>
                    <span className="text-[10px] text-gray-400 flex-shrink-0">({t.total})</span>
                  </div>
                ))}
            </div>
          )}
        </div>

        {/* Top Earners */}
        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Trophy className="w-4 h-4 text-yellow-500" />
            <p className="text-sm font-black text-gray-900">Top Earners</p>
          </div>
          {loading ? (
            <div className="space-y-2">
              {[1, 2, 3].map(i => <div key={i} className="h-8 bg-gray-100 rounded-lg animate-pulse" />)}
            </div>
          ) : !analytics?.topEarners.length ? (
            <p className="text-xs text-gray-400 py-4 text-center">No earnings data yet</p>
          ) : (
            <div className="space-y-1">
              {analytics.topEarners.map((earner, idx) => (
                <div key={earner.id} className="flex items-center gap-3 py-1.5 border-b border-gray-50 last:border-0">
                  <span className={`text-xs font-black w-5 text-center ${
                    idx === 0 ? "text-yellow-500" : idx === 1 ? "text-gray-400" : idx === 2 ? "text-orange-400" : "text-gray-300"
                  }`}>
                    {idx + 1}
                  </span>
                  <span className="text-sm font-semibold text-gray-700 flex-1 truncate">{earner.name}</span>
                  <span className="text-sm font-black text-green-600">
                    ₹{earner.balance.toLocaleString("en-IN", { maximumFractionDigits: 0 })}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-2">
        {[
          { label: "Manage Users", href: "/admin/users", color: "bg-blue-600" },
          { label: "Review Proofs", href: "/admin/proofs", color: "bg-orange-500" },
          { label: "Review Payments", href: "/admin/payments", color: "bg-green-600" },
          { label: "Manage Tasks", href: "/admin/tasks", color: "bg-purple-600" },
        ].map((a) => (
          <Link
            key={a.label}
            href={a.href}
            className={`${a.color} text-white text-xs font-bold px-4 py-2 rounded-xl hover:opacity-90 transition-opacity`}
          >
            {a.label}
          </Link>
        ))}
      </div>
    </div>
  )
}