"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  TrendingUp, Clock, CheckCircle2, Target, ArrowRight,
  Zap, IndianRupee, Trophy, Users, Flame, Gift,
  ShoppingBag, Star, AlertCircle, ChevronRight, Wallet
} from "lucide-react"
import Link from "next/link"

interface DashboardHomeProps {
  userId: number
}

export function DashboardHome({ userId }: DashboardHomeProps) {
  const [data, setData] = useState({
    totalEarnings: 0,
    pendingEarnings: 0,
    weeklyEarnings: 0,
    dailyEarnings: 0,
    tasksCompleted: 0,
    tasksAvailable: 0,
    referralEarnings: 0,
    totalReferrals: 0,
    upiId: null as string | null,
    displayName: '',
    recentActivity: [] as any[],
    pendingProofs: [] as any[],
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchAll() }, [userId])

  const fetchAll = async () => {
    try {
      const [earningsRes, tasksRes, profileRes, referralRes] = await Promise.all([
        fetch('/api/earnings'),
        fetch('/api/tasks?country=IN'),
        fetch('/api/user/profile'),
        fetch('/api/referral'),
      ])

      const earnings = earningsRes.ok ? await earningsRes.json() : {}
      const tasks = tasksRes.ok ? await tasksRes.json() : {}
      const profile = profileRes.ok ? await profileRes.json() : {}
      const referral = referralRes.ok ? await referralRes.json() : {}

      const pendingProofs = (earnings.recentCompletions || []).filter(
        (c: any) => c.status === 'pending_verification'
      )

      setData({
        totalEarnings: Number(earnings.summary?.totalEarnings || earnings.totalEarnings || 0),
        pendingEarnings: Number(earnings.pendingEarnings || 0),
        weeklyEarnings: Number(earnings.summary?.weeklyEarnings || earnings.weeklyEarnings || 0),
        dailyEarnings: Number(earnings.summary?.dailyEarnings || 0),
        tasksCompleted: Number(earnings.summary?.tasksCompleted || 0),
        tasksAvailable: tasks.tasks?.length || 0,
        referralEarnings: Number(referral.referral_earnings || 0),
        totalReferrals: Number(referral.total_referrals || 0),
        upiId: profile.user?.upi_id || null,
        displayName: profile.user?.display_name || profile.user?.email?.split('@')[0] || 'there',
        recentActivity: earnings.recentCompletions?.slice(0, 5) || [],
        pendingProofs,
      })
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const [greeting, setGreeting] = useState('Good morning')
useEffect(() => {
  const hour = new Date().getHours()
  if (hour < 12) setGreeting('Good morning')
  else if (hour < 17) setGreeting('Good afternoon')
  else setGreeting('Good evening')
}, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'verified': return 'text-green-600 bg-green-100'
      case 'pending_verification': return 'text-orange-600 bg-orange-100'
      case 'rejected': return 'text-red-600 bg-red-100'
      default: return 'text-blue-600 bg-blue-100'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'verified': return '✅ Verified'
      case 'pending_verification': return '⏳ Reviewing'
      case 'rejected': return '❌ Rejected'
      default: return '📋 Done'
    }
  }

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-32 bg-gray-200 rounded-3xl" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1,2,3,4].map(i => <div key={i} className="h-28 bg-gray-200 rounded-2xl" />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-64 bg-gray-200 rounded-2xl" />
          <div className="h-64 bg-gray-200 rounded-2xl" />
        </div>
      </div>
    )
  }

  const totalBalance = data.totalEarnings + data.referralEarnings

  return (
    <div className="space-y-6 max-w-6xl mx-auto">

      {/* Hero Greeting Card */}
      <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-purple-700 rounded-3xl p-6 md:p-8 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-32 translate-x-32" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-24 -translate-x-24" />

        <div className="relative flex items-center justify-between flex-wrap gap-4">
          <div>
            <p className="text-blue-200 text-sm font-medium mb-1">{greeting} 👋</p>
            <h1 className="text-2xl md:text-3xl font-black text-white capitalize">{data.displayName}</h1>
            <p className="text-blue-200 text-sm mt-2">
              {data.tasksAvailable > 0
                ? `🔥 ${data.tasksAvailable} tasks waiting — keep earning!`
                : '✅ You\'re all caught up for now'}
            </p>
          </div>
          <div className="text-right">
            <p className="text-blue-200 text-xs font-semibold uppercase tracking-wide">Total Balance</p>
            <div className="flex items-baseline gap-1 justify-end">
              <span className="text-white/80 text-lg font-bold">₹</span>
              <span className="text-4xl font-black text-white">{totalBalance.toFixed(0)}</span>
              <span className="text-white/60 text-sm">.{totalBalance.toFixed(2).split('.')[1]}</span>
            </div>
            {!data.upiId && (
              <Link href="/dashboard/tasks">
                <span className="text-xs bg-yellow-400 text-yellow-900 font-bold px-2 py-0.5 rounded-full mt-1 inline-block">
                  ⚠ Add UPI to withdraw
                </span>
              </Link>
            )}
          </div>
        </div>

        {/* Progress bar */}
        <div className="relative mt-5">
          <div className="flex items-center justify-between mb-1.5">
            <p className="text-blue-200 text-xs font-medium">Daily goal: ₹100</p>
            <p className="text-white text-xs font-bold">₹{data.dailyEarnings.toFixed(0)} / ₹100</p>
          </div>
          <div className="w-full bg-white/20 rounded-full h-2">
            <div
              className="bg-white rounded-full h-2 transition-all duration-500"
              style={{ width: `${Math.min((data.dailyEarnings / 100) * 100, 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Pending proofs alert */}
      {data.pendingProofs.length > 0 && (
        <div className="bg-orange-50 border border-orange-200 rounded-2xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center flex-shrink-0">
            <AlertCircle className="w-5 h-5 text-orange-600" />
          </div>
          <div className="flex-1">
            <p className="text-orange-800 font-bold text-sm">
              {data.pendingProofs.length} task{data.pendingProofs.length > 1 ? 's' : ''} under review
            </p>
            <p className="text-orange-600 text-xs">Admin verifies within 24 hours — earnings will be credited soon</p>
          </div>
          {/* FIX: replaced unlabelled <button> with aria-label on Link */}
          <Link href="/dashboard/tasks" aria-label="View tasks under review">
            <ChevronRight className="w-5 h-5 text-orange-600 hover:text-orange-700" />
          </Link>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Total Earned', value: `₹${data.totalEarnings.toFixed(0)}`, sub: `+₹${data.weeklyEarnings.toFixed(0)} this week`, icon: Trophy, gradient: 'from-blue-500 to-blue-700' },
          { label: 'Pending', value: `₹${data.pendingEarnings.toFixed(0)}`, sub: 'Under verification', icon: Clock, gradient: 'from-orange-500 to-orange-700' },
          { label: 'Tasks Done', value: `${data.tasksCompleted}`, sub: `${data.tasksAvailable} available`, icon: CheckCircle2, gradient: 'from-green-500 to-green-700' },
          { label: 'Referrals', value: `${data.totalReferrals}`, sub: `₹${data.referralEarnings} earned`, icon: Users, gradient: 'from-purple-500 to-purple-700' },
        ].map((s, i) => (
          <Card key={i} className="border-0 shadow-md rounded-2xl overflow-hidden">
            <CardContent className="p-0">
              <div className={`bg-gradient-to-br ${s.gradient} p-4`}>
                <div className="w-8 h-8 bg-white/20 rounded-xl flex items-center justify-center mb-3">
                  <s.icon className="w-4 h-4 text-white" />
                </div>
                <p className="text-white/70 text-xs font-medium">{s.label}</p>
                <p className="text-white text-xl font-black mt-0.5">{s.value}</p>
                <p className="text-white/60 text-xs mt-0.5">{s.sub}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Quick Actions */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-lg font-black text-gray-900">Quick Actions</h2>
          <div className="space-y-3">

            <Link href="/dashboard/tasks" className="block">
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-5 flex items-center justify-between group hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg shadow-blue-200">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                    <Flame className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-white font-bold text-base">Complete Tasks</p>
                    <p className="text-blue-200 text-sm">{data.tasksAvailable} tasks · earn up to ₹500/day</p>
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 text-white group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

            <Link href="/dashboard/products" className="block">
              <div className="bg-white border border-gray-200 rounded-2xl p-5 flex items-center justify-between group hover:border-blue-300 hover:bg-blue-50 transition-all shadow-sm">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center">
                    <ShoppingBag className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-gray-900 font-bold text-base">Browse Products</p>
                    <p className="text-gray-500 text-sm">Discover deals on Amazon & Flipkart</p>
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 text-gray-400 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

            <Link href="/dashboard/referral" className="block">
              <div className="bg-gradient-to-r from-green-50 to-green-100 border border-green-200 rounded-2xl p-5 flex items-center justify-between group hover:border-green-300 transition-all">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-green-200 rounded-2xl flex items-center justify-center">
                    <Gift className="w-6 h-6 text-green-700" />
                  </div>
                  <div>
                    <p className="text-gray-900 font-bold text-base">Refer & Earn</p>
                    <p className="text-gray-500 text-sm">Get ₹20 per friend you invite</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs bg-green-600 text-white px-2 py-0.5 rounded-full font-bold">₹20/ref</span>
                  <ArrowRight className="w-5 h-5 text-gray-400 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>

            {data.pendingEarnings >= 50 && (
              <Link href="/dashboard/earnings" className="block">
                <div className="bg-gradient-to-r from-purple-50 to-purple-100 border border-purple-200 rounded-2xl p-5 flex items-center justify-between group hover:border-purple-300 transition-all">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-purple-200 rounded-2xl flex items-center justify-center">
                      <Wallet className="w-6 h-6 text-purple-700" />
                    </div>
                    <div>
                      <p className="text-gray-900 font-bold text-base">Request Payout</p>
                      <p className="text-gray-500 text-sm">₹{data.pendingEarnings.toFixed(2)} available to withdraw</p>
                    </div>
                  </div>
                  <ArrowRight className="w-5 h-5 text-gray-400 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-black text-gray-900">Recent Activity</h2>
            <Link href="/dashboard/earnings" className="text-xs text-blue-600 font-semibold hover:underline">
              View all
            </Link>
          </div>
          <Card className="border border-gray-200 rounded-2xl shadow-sm">
            <CardContent className="p-4">
              {data.recentActivity.length === 0 ? (
                <div className="py-10 text-center">
                  <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                    <Zap className="w-7 h-7 text-gray-400" />
                  </div>
                  <p className="text-sm font-semibold text-gray-700 mb-1">No activity yet</p>
                  <p className="text-xs text-gray-500">Complete tasks to start earning!</p>
                  <Link href="/dashboard/tasks">
                    <Button size="sm" className="mt-3 bg-blue-600 hover:bg-blue-700 rounded-xl text-xs">
                      Start Now <ArrowRight className="w-3.5 h-3.5 ml-1" />
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {data.recentActivity.map((activity, i) => (
                    <div key={i} className={`flex items-center gap-3 p-2.5 rounded-xl ${i === 0 ? 'bg-gray-50' : ''}`}>
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 text-xs font-bold ${getStatusColor(activity.status)}`}>
                        {activity.status === 'verified' ? '✅' : activity.status === 'pending_verification' ? '⏳' : activity.status === 'rejected' ? '❌' : '📋'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-gray-900 truncate">
                          {activity.task_title || activity.task?.title || 'Task completed'}
                        </p>
                        <p className="text-xs text-gray-400">
                          {new Date(activity.created_at || activity.completed_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                        </p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-sm font-black text-green-600">+₹{Number(activity.user_payout || activity.payout || activity.amount || 0).toFixed(0)}</p>
                        <p className={`text-xs px-1.5 py-0.5 rounded-full ${getStatusColor(activity.status)}`}>
                          {getStatusLabel(activity.status)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* UPI Status */}
          {!data.upiId ? (
            <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 bg-yellow-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <AlertCircle className="w-5 h-5 text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900">Add UPI to get paid</p>
                  <p className="text-xs text-gray-500 mt-0.5">Without UPI you can't receive payouts</p>
                  {/* FIX: replaced unlabelled <button> with Link */}
                  <Link href="/dashboard/tasks" className="text-xs text-blue-600 font-bold mt-2 hover:underline inline-block">
                    Add UPI ID →
                  </Link>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-green-50 border border-green-200 rounded-2xl p-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900">UPI Connected</p>
                  <p className="text-xs text-gray-500 truncate">{data.upiId}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}