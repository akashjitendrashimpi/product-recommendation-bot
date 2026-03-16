"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import {
  TrendingUp, CheckCircle2, Target, ArrowRight,
  Zap, IndianRupee, Trophy, Users, Gift,
  ShoppingBag, AlertCircle, ChevronRight, Wallet,
  Clock, Star, CheckSquare
} from "lucide-react"
import Link from "next/link"

interface DashboardHomeProps {
  userId: number
}

export function DashboardHome({ userId }: DashboardHomeProps) {
  const [data, setData] = useState({
    totalEarnings: 0,
    availableBalance: 0,
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
  const [greeting, setGreeting] = useState('Good morning')

  useEffect(() => {
    const hour = new Date().getHours()
    if (hour < 12) setGreeting('Good morning')
    else if (hour < 17) setGreeting('Good afternoon')
    else setGreeting('Good evening')
  }, [])

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
        totalEarnings: Number(earnings.summary?.totalEarnings || 0),
        availableBalance: Number(earnings.summary?.availableBalance || 0),
        pendingEarnings: Number(earnings.summary?.pendingEarnings || 0),
        weeklyEarnings: Number(earnings.summary?.weeklyEarnings || 0),
        dailyEarnings: Number(earnings.summary?.dailyEarnings || 0),
        tasksCompleted: Number(earnings.summary?.tasksCompleted || 0),
        tasksAvailable: tasks.tasks?.length || 0,
        referralEarnings: Number(referral.referral_earnings || 0),
        totalReferrals: Number(referral.total_referrals || 0),
        upiId: profile.user?.upi_id || null,
        displayName: profile.user?.display_name || profile.user?.email?.split('@')[0] || 'there',
        recentActivity: earnings.recentCompletions?.slice(0, 4) || [],
        pendingProofs,
      })
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'verified': return 'text-green-600 bg-green-50'
      case 'pending_verification': return 'text-orange-600 bg-orange-50'
      case 'rejected': return 'text-red-600 bg-red-50'
      default: return 'text-blue-600 bg-blue-50'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'verified': return '✅ Paid'
      case 'pending_verification': return '⏳ Reviewing'
      case 'rejected': return '❌ Rejected'
      default: return '🎯 Completed'
    }
  }

  if (loading) {
    return (
      <div className="animate-pulse space-y-4 max-w-2xl mx-auto lg:max-w-none">
        <div className="h-6 bg-gray-200 rounded w-40" />
        <div className="h-48 bg-gray-200 rounded-3xl" />
        <div className="grid grid-cols-2 gap-3">
          <div className="h-24 bg-gray-200 rounded-2xl" />
          <div className="h-24 bg-gray-200 rounded-2xl" />
        </div>
        <div className="h-32 bg-gray-200 rounded-2xl" />
      </div>
    )
  }

  return (
    <div className="space-y-5 max-w-2xl mx-auto lg:max-w-none">

      {/* ── Greeting ── */}
      <div>
        <p className="text-gray-500 text-sm font-medium">{greeting} 👋</p>
        <h1 className="text-2xl font-black text-gray-900 mt-0.5">{data.displayName}</h1>
      </div>

      {/* ── Hero Balance Card ── */}
      <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-purple-700 rounded-3xl p-5 shadow-xl relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full -translate-y-24 translate-x-24" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full translate-y-16 -translate-x-16" />

        <div className="relative">
          {/* Balance */}
          <p className="text-blue-200 text-xs font-semibold uppercase tracking-widest mb-1">Available Balance</p>
          <div className="flex items-baseline gap-1 mb-4">
            <span className="text-white/80 text-lg font-bold">₹</span>
            <span className="text-white text-5xl font-black leading-none tracking-tight">
              {data.availableBalance.toFixed(0)}
            </span>
            <span className="text-white/50 text-base mb-1">.{data.availableBalance.toFixed(2).split('.')[1]}</span>
          </div>

          {/* 3 stats in a row */}
          <div className="grid grid-cols-3 gap-2 mb-4">
            {[
              { label: 'Total Earned', value: `₹${data.totalEarnings.toFixed(0)}`, icon: Trophy },
              { label: 'Today', value: `₹${data.dailyEarnings.toFixed(0)}`, icon: Zap },
              { label: 'Tasks Done', value: String(data.tasksCompleted), icon: CheckCircle2 },
            ].map((s, i) => (
              <div key={i} className="bg-white/10 rounded-2xl p-2.5 text-center">
                <p className="text-white/90 text-sm font-black">{s.value}</p>
                <p className="text-blue-200 text-[10px] font-medium mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Withdraw button */}
          <Link href="/dashboard/earnings">
            <div className="bg-white/15 hover:bg-white/25 active:bg-white/10 transition-all rounded-2xl px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Wallet className="w-4 h-4 text-white" />
                <span className="text-white text-sm font-bold">Earnings & Payouts</span>
              </div>
              <ArrowRight className="w-4 h-4 text-white/70" />
            </div>
          </Link>
        </div>
      </div>

      {/* ── Tasks Card — Primary CTA ── */}
      {/* This is the most important element after balance */}
      <Link href="/dashboard/tasks">
        <div className={`rounded-2xl p-4 flex items-center justify-between transition-all active:scale-[0.98] ${
          data.tasksAvailable > 0
            ? 'bg-gradient-to-r from-green-500 to-emerald-600 shadow-lg shadow-green-100'
            : 'bg-gray-100'
        }`}>
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${
              data.tasksAvailable > 0 ? 'bg-white/20' : 'bg-gray-200'
            }`}>
              <CheckSquare className={`w-6 h-6 ${data.tasksAvailable > 0 ? 'text-white' : 'text-gray-500'}`} />
            </div>
            <div>
              {data.tasksAvailable > 0 ? (
                <>
                  <p className="text-white font-black text-base leading-tight">
                    {data.tasksAvailable} Tasks Available
                  </p>
                  <p className="text-green-100 text-xs mt-0.5">Tap to start earning</p>
                </>
              ) : (
                <>
                  <p className="text-gray-700 font-bold text-base">Tasks</p>
                  <p className="text-gray-500 text-xs mt-0.5">No tasks right now — check back later</p>
                </>
              )}
            </div>
          </div>
          {data.tasksAvailable > 0 && (
            <div className="bg-white rounded-xl px-3 py-1.5 flex-shrink-0">
              <span className="text-green-600 font-black text-sm">View →</span>
            </div>
          )}
        </div>
      </Link>

      {/* ── Alerts (contextual, only shown when needed) ── */}
      {!data.upiId && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0">
            <AlertCircle className="w-5 h-5 text-amber-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-gray-900">Add UPI to receive payments</p>
            <p className="text-xs text-gray-500 mt-0.5">Required for withdrawals</p>
          </div>
          <Link href="/dashboard/profile" className="flex-shrink-0">
            <span className="text-xs text-amber-700 font-bold bg-amber-100 px-3 py-1.5 rounded-xl">Add →</span>
          </Link>
        </div>
      )}

      {data.pendingProofs.length > 0 && (
        <div className="bg-orange-50 border border-orange-200 rounded-2xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center flex-shrink-0">
            <Clock className="w-5 h-5 text-orange-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-gray-900">{data.pendingProofs.length} task{data.pendingProofs.length > 1 ? 's' : ''} under review</p>
            <p className="text-xs text-gray-500 mt-0.5">Admin will verify within 24 hours</p>
          </div>
          <Link href="/dashboard/tasks" className="flex-shrink-0">
            <span className="text-xs text-orange-700 font-bold bg-orange-100 px-3 py-1.5 rounded-xl">View →</span>
          </Link>
        </div>
      )}

      {/* ── Quick Actions Grid ── */}
      <div className="grid grid-cols-2 gap-3">
        {[
          {
            href: '/dashboard/referral',
            icon: Users,
            title: 'Refer & Earn',
            subtitle: '₹20 per friend',
            color: 'bg-purple-50 border-purple-100',
            iconBg: 'bg-purple-100',
            iconColor: 'text-purple-600',
            badge: data.totalReferrals > 0 ? `${data.totalReferrals} referred` : null,
          },
          {
            href: '/dashboard/products',
            icon: ShoppingBag,
            title: 'Products',
            subtitle: 'Affiliate deals',
            color: 'bg-blue-50 border-blue-100',
            iconBg: 'bg-blue-100',
            iconColor: 'text-blue-600',
            badge: null,
          },
        ].map((item, i) => (
          <Link key={i} href={item.href}>
            <div className={`${item.color} border rounded-2xl p-4 h-full transition-all active:scale-[0.97]`}>
              <div className={`w-10 h-10 ${item.iconBg} rounded-xl flex items-center justify-center mb-3`}>
                <item.icon className={`w-5 h-5 ${item.iconColor}`} />
              </div>
              <p className="text-sm font-bold text-gray-900">{item.title}</p>
              <p className="text-xs text-gray-500 mt-0.5">{item.subtitle}</p>
              {item.badge && (
                <span className="inline-block mt-2 text-[10px] font-semibold bg-white px-2 py-0.5 rounded-full text-gray-600">
                  {item.badge}
                </span>
              )}
            </div>
          </Link>
        ))}
      </div>

      {/* ── Recent Activity ── */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-black text-gray-900">Recent Activity</h2>
          <Link href="/dashboard/earnings" className="text-xs text-blue-600 font-semibold">
            View all →
          </Link>
        </div>

        {data.recentActivity.length === 0 ? (
          <div className="bg-white border border-gray-100 rounded-2xl p-8 text-center shadow-sm">
            <div className="w-12 h-12 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <Target className="w-6 h-6 text-gray-400" />
            </div>
            <p className="text-sm font-semibold text-gray-700 mb-1">No activity yet</p>
            <p className="text-xs text-gray-400">Complete your first task to see earnings here</p>
            <Link href="/dashboard/tasks">
              <span className="inline-block mt-3 text-xs text-blue-600 font-bold bg-blue-50 px-4 py-2 rounded-xl">
                Browse Tasks →
              </span>
            </Link>
          </div>
        ) : (
          <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
            {data.recentActivity.map((activity: any, i: number) => (
              <div key={activity.id || i} className={`flex items-center gap-3 px-4 py-3 ${i < data.recentActivity.length - 1 ? 'border-b border-gray-50' : ''}`}>
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 text-sm ${getStatusColor(activity.status)}`}>
                  {activity.status === 'verified' ? '✅' :
                   activity.status === 'pending_verification' ? '⏳' :
                   activity.status === 'rejected' ? '❌' : '🎯'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">
                    {activity.task_title || 'Task completed'}
                  </p>
                  <p className="text-xs text-gray-400">
                    {new Date(activity.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                  </p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-sm font-black text-green-600">+₹{Number(activity.user_payout).toFixed(0)}</p>
                  <p className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${getStatusColor(activity.status)}`}>
                    {getStatusLabel(activity.status)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Referral Teaser (bottom, low pressure) ── */}
      {data.upiId && (
        <Link href="/dashboard/referral">
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-100 rounded-2xl p-4 flex items-center gap-3 transition-all active:scale-[0.98]">
            <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <Gift className="w-5 h-5 text-purple-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-gray-900">Invite friends, earn ₹20 each</p>
              <p className="text-xs text-gray-500 mt-0.5">
                {data.totalReferrals > 0
                  ? `${data.totalReferrals} friends joined · ₹${data.referralEarnings} earned`
                  : 'Share your referral link'}
              </p>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
          </div>
        </Link>
      )}

    </div>
  )
}