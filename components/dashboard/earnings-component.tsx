"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Wallet, TrendingUp, Clock, CheckCircle2, ChevronRight,
  AlertCircle, Trophy, Zap, RefreshCw
} from "lucide-react"
import Link from "next/link"

interface EarningsComponentProps {
  userId: number
  upiId: string | null
}

interface EarningsSummary {
  totalEarnings: number
  availableBalance: number
  paidEarnings: number
  pendingPayouts: number
  dailyEarnings: number
  weeklyEarnings: number
  monthlyEarnings: number
  tasksCompleted: number
}

interface Payment {
  id: number
  amount: number
  status: string
  upi_id: string
  transaction_id: string | null
  created_at: string
  description: string | null
}

interface TaskCompletion {
  id: number
  task_id: number
  payout: number
  user_payout: number
  status: string
  created_at: string
  completed_at: string
}

const MIN_PAYOUT = 50  // fallback, overridden by server
const MAX_PAYOUT = 5000

export function EarningsComponent({ userId, upiId: initialUpiId }: EarningsComponentProps) {
  const [earnings, setEarnings] = useState<EarningsSummary>({
    totalEarnings: 0, availableBalance: 0, paidEarnings: 0,
    pendingPayouts: 0, dailyEarnings: 0, weeklyEarnings: 0,
    monthlyEarnings: 0, tasksCompleted: 0
  })
  const [payments, setPayments] = useState<Payment[]>([])
  const [recentEarnings, setRecentEarnings] = useState<TaskCompletion[]>([])
  const [loading, setLoading] = useState(true)
  const [showPayoutForm, setShowPayoutForm] = useState(false)
  const [payoutAmount, setPayoutAmount] = useState("")
  const [requesting, setRequesting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<"earnings" | "payouts">("earnings")
  const [upiId, setUpiId] = useState(initialUpiId)
  const [filterStatus, setFilterStatus] = useState("all")
const [minPayout, setMinPayout] = useState(MIN_PAYOUT)
const [maxPayout, setMaxPayout] = useState(MAX_PAYOUT)
  useEffect(() => { fetchData() }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      const [earningsRes, paymentsRes, profileRes, settingsRes] = await Promise.all([
        fetch('/api/earnings'),
        fetch('/api/payments'),
        fetch('/api/user/profile'),
        fetch('/api/settings'),
      ])
      if (earningsRes.ok) {
        const data = await earningsRes.json()
        const s = data.summary || {}
        setEarnings({
          totalEarnings: Number(s.totalEarnings) || 0,
          availableBalance: Number(s.availableBalance) || 0,
          paidEarnings: Number(s.paidEarnings) || 0,
          pendingPayouts: Number(s.pendingPayouts) || 0,
          dailyEarnings: Number(s.dailyEarnings) || 0,
          weeklyEarnings: Number(s.weeklyEarnings) || 0,
          monthlyEarnings: Number(s.monthlyEarnings) || 0,
          tasksCompleted: Number(s.tasksCompleted) || 0,
        })
        setRecentEarnings(data.recentCompletions || [])
      }
      if (paymentsRes.ok) setPayments((await paymentsRes.json()).payments || [])
      if (profileRes.ok) setUpiId((await profileRes.json()).user?.upi_id || null)
      if (settingsRes.ok) {
        const s = await settingsRes.json()
        setMinPayout(s.min_payout || 50)
        setMaxPayout(s.max_payout || 5000)
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }
  const handleRequestPayout = async () => {
    setError(null)
    if (!upiId) { setError("Add your UPI ID in profile settings first"); return }
    const amount = parseFloat(payoutAmount)
    if (isNaN(amount) || amount <= 0) { setError("Enter a valid amount"); return }
    if (amount < minPayout) { setError("Minimum payout is Rs." + minPayout); return }
    if (amount > maxPayout) { setError("Maximum per request is Rs." + maxPayout); return }
    if (amount > earnings.availableBalance) { setError("Exceeds available balance Rs." + earnings.availableBalance.toFixed(2)); return }
    setRequesting(true)
    try {
      const res = await fetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to request payout')
      setShowPayoutForm(false)
      setPayoutAmount("")
      await fetchData()
      setSuccess("Rs." + amount + " payout requested! Admin will process within 24 hours.")
      setTimeout(() => setSuccess(null), 6000)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setRequesting(false)
    }
  }

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'completed': case 'verified': return { color: 'bg-green-100 text-green-700', label: 'Paid', dot: 'bg-green-500' }
      case 'pending_verification': return { color: 'bg-orange-100 text-orange-700', label: 'Reviewing', dot: 'bg-orange-500' }
      case 'pending': return { color: 'bg-yellow-100 text-yellow-700', label: 'Processing', dot: 'bg-yellow-500' }
      case 'rejected': return { color: 'bg-red-100 text-red-700', label: 'Rejected', dot: 'bg-red-500' }
      default: return { color: 'bg-gray-100 text-gray-700', label: status, dot: 'bg-gray-400' }
    }
  }

  const pendingCount = recentEarnings.filter(e => e.status === 'pending_verification').length

  const earningsFiltered = recentEarnings.filter(e => filterStatus === "all" || e.status === filterStatus)
  const paymentsFiltered = payments.filter(p => filterStatus === "all" || p.status === filterStatus)

  const earningFilters = ['all', 'verified', 'pending_verification', 'rejected']
  const payoutFilters = ['all', 'pending', 'completed', 'rejected']

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse max-w-4xl mx-auto">
        <div className="h-44 bg-gray-200 rounded-3xl" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1,2,3,4].map(i => <div key={i} className="h-24 bg-gray-200 rounded-2xl" />)}
        </div>
        <div className="h-64 bg-gray-200 rounded-2xl" />
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">

      {/* Hero Balance Card */}
      <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-purple-700 rounded-3xl p-6 md:p-8 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-32 translate-x-32" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-24 -translate-x-24" />
        <div className="relative">
          <p className="text-blue-200 text-sm font-medium mb-1">Available Balance</p>
          <div className="flex items-baseline gap-1 mb-5">
            <span className="text-white/80 text-xl font-bold">Rs.</span>
            <span className="text-5xl font-black text-white">{earnings.availableBalance.toFixed(0)}</span>
            <span className="text-white/60 text-lg">.{earnings.availableBalance.toFixed(2).split('.')[1]}</span>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            {earnings.availableBalance >= minPayout ? (
              <Button onClick={() => setShowPayoutForm(!showPayoutForm)}
                className="bg-white text-blue-700 hover:bg-blue-50 font-bold rounded-2xl h-11 px-6 shadow-lg">
                <Wallet className="w-4 h-4 mr-2" /> Request Payout
              </Button>
            ) : (
              <div className="bg-white/20 rounded-2xl px-4 py-3 flex-1 max-w-xs">
                <p className="text-white text-xs font-medium mb-1.5">
                  Need Rs.{(minPayout - earnings.availableBalance).toFixed(0)} more to withdraw
                   </p>
                <div className="w-full bg-white/20 rounded-full h-1.5">
                  <div className="bg-white rounded-full h-1.5 transition-all"
                    style={{ width: `${Math.min((earnings.availableBalance / minPayout) * 100, 100)}%` }} />
                </div>
              </div>
            )}
            {!upiId && (
              <Link href="/dashboard/profile">
                <span className="bg-yellow-400 text-yellow-900 text-xs font-bold px-3 py-2 rounded-full flex items-center gap-1.5 cursor-pointer">
                  <AlertCircle className="w-3.5 h-3.5" /> Add UPI ID
                </span>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Payout Form */}
      {showPayoutForm && (
        <Card className="border-2 border-blue-200 bg-blue-50 rounded-2xl shadow-md">
          <CardContent className="p-5">
            <h3 className="font-bold text-gray-900 mb-4 text-lg">Request Payout</h3>
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-3 mb-4 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}
            <div className="space-y-4">
              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-1.5">Amount</label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-bold text-sm">Rs.</span>
                    <Input type="number" value={payoutAmount} onChange={e => setPayoutAmount(e.target.value)}
                      placeholder="0" className="pl-10 rounded-xl h-12 text-lg font-bold"
                      min={MIN_PAYOUT} max={Math.min(MAX_PAYOUT, earnings.availableBalance)} />
                  </div>
                  <Button variant="outline" onClick={() => setPayoutAmount(Math.min(earnings.availableBalance, MAX_PAYOUT).toFixed(0))}
                    className="rounded-xl h-12 px-4 font-bold">Max</Button>
                </div>
                <p className="text-xs text-gray-500 mt-1.5">Min Rs.{minPayout} · Max Rs.{maxPayout} · Available Rs.{earnings.availableBalance.toFixed(2)}</p>
              </div>
              <div className="flex gap-2 flex-wrap">
               {[minPayout, 100, 200, 500].filter((a, i, arr) => a <= earnings.availableBalance && (i === 0 || a > arr[i-1])).map(amount => (
                  <button key={amount} onClick={() => setPayoutAmount(amount.toString())}
                    className={"px-3 py-1.5 rounded-xl text-sm font-semibold border transition-colors " + (payoutAmount === amount.toString() ? 'bg-blue-600 text-white border-blue-600' : 'bg-white border-gray-200 text-gray-700 hover:border-blue-300')}>
                    Rs.{amount}
                  </button>
                ))}
              </div>
              <div className="bg-white border border-gray-200 rounded-xl p-3">
                <p className="text-xs text-gray-500">Sending to</p>
                <p className="text-sm font-bold text-gray-900 mt-0.5">{upiId || "No UPI ID set"}</p>
              </div>
              <div className="flex gap-2">
                <Button onClick={handleRequestPayout} disabled={requesting || !payoutAmount}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 rounded-xl h-11">
                  {requesting ? <><RefreshCw className="w-4 h-4 mr-2 animate-spin" />Processing...</> : <><Wallet className="w-4 h-4 mr-2" />Confirm Request</>}
                </Button>
                <Button variant="outline" onClick={() => { setShowPayoutForm(false); setError(null) }} className="rounded-xl h-11">Cancel</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Success */}
      {success && (
        <div className="bg-green-50 border border-green-200 rounded-2xl p-4 flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
          <p className="text-green-800 font-medium text-sm">{success}</p>
        </div>
      )}

      {/* Pending Alert */}
      {pendingCount > 0 && (
        <div className="bg-orange-50 border border-orange-200 rounded-2xl p-4 flex items-center gap-3">
          <Clock className="w-5 h-5 text-orange-600 flex-shrink-0" />
          <div>
            <p className="text-orange-800 font-bold text-sm">{pendingCount} task{pendingCount > 1 ? 's' : ''} under review</p>
            <p className="text-orange-600 text-xs">Earnings credited once admin approves</p>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Total Earned', value: 'Rs.' + earnings.totalEarnings.toFixed(0), sub: 'All time', gradient: 'from-blue-500 to-blue-700', Icon: Trophy },
          { label: 'This Week', value: 'Rs.' + earnings.weeklyEarnings.toFixed(0), sub: 'Last 7 days', gradient: 'from-green-500 to-green-700', Icon: TrendingUp },
          { label: 'Tasks Done', value: String(earnings.tasksCompleted), sub: 'Completed', gradient: 'from-purple-500 to-purple-700', Icon: CheckCircle2 },
          { label: 'Total Paid', value: 'Rs.' + earnings.paidEarnings.toFixed(0), sub: 'Withdrawn', gradient: 'from-orange-500 to-orange-700', Icon: Wallet },
        ].map((s, i) => (
          <Card key={i} className="border-0 shadow-md rounded-2xl overflow-hidden">
            <CardContent className="p-0">
              <div className={"bg-gradient-to-br " + s.gradient + " p-4"}>
                <div className="w-8 h-8 bg-white/20 rounded-xl flex items-center justify-center mb-3">
                  <s.Icon className="w-4 h-4 text-white" />
                </div>
                <p className="text-white/70 text-xs font-medium">{s.label}</p>
                <p className="text-white text-xl font-black mt-0.5">{s.value}</p>
                <p className="text-white/60 text-xs mt-0.5">{s.sub}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-2xl p-1">
        {[
          { key: 'earnings', label: 'Task History', Icon: Zap },
          { key: 'payouts', label: 'Payouts', Icon: Wallet },
        ].map(tab => (
          <button key={tab.key} onClick={() => { setActiveTab(tab.key as any); setFilterStatus('all') }}
            className={"flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all " + (activeTab === tab.key ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500 hover:text-gray-700')}>
            <tab.Icon className="w-4 h-4" />
            {tab.label}
            {tab.key === 'earnings' && pendingCount > 0 && (
              <span className="bg-orange-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">{pendingCount}</span>
            )}
          </button>
        ))}
      </div>

      {/* Filter Pills */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {(activeTab === 'earnings' ? earningFilters : payoutFilters).map(f => (
          <button key={f} onClick={() => setFilterStatus(f)}
            className={"flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-bold transition-all " + (filterStatus === f ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200')}>
            {f === 'all' ? 'All' : f === 'pending_verification' ? 'Reviewing' : f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* Task History */}
      {activeTab === 'earnings' && (
        <div className="space-y-3">
          {earningsFiltered.length === 0 ? (
            <Card className="border border-dashed border-gray-300 rounded-2xl">
              <CardContent className="py-16 text-center">
                <Zap className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-gray-900 mb-2">No earnings yet</h3>
                <p className="text-gray-500 text-sm mb-4">Complete tasks to start earning!</p>
                <Link href="/dashboard/tasks">
                  <Button className="bg-blue-600 hover:bg-blue-700 rounded-xl">
                    Browse Tasks <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : earningsFiltered.map(earning => {
            const config = getStatusConfig(earning.status)
            const payout = Number(earning.payout || earning.user_payout || 0)
            return (
              <Card key={earning.id} className="border border-gray-200 rounded-2xl shadow-sm hover:shadow-md transition-all">
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <div className={"w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 " + config.color}>
                      <span className="text-lg">{earning.status === 'verified' ? '✅' : earning.status === 'pending_verification' ? '⏳' : earning.status === 'rejected' ? '❌' : '📋'}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-gray-900">Task #{earning.task_id}</p>
                      <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                        <span className={"text-xs font-semibold px-2 py-0.5 rounded-full " + config.color}>{config.label}</span>
                        <span className="text-xs text-gray-400">
                          {new Date(earning.completed_at || earning.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>
                      </div>
                    </div>
                    <p className={"text-lg font-black " + (earning.status === 'rejected' ? 'text-gray-400 line-through' : 'text-green-600')}>
                      +Rs.{payout.toFixed(0)}
                    </p>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Payouts */}
      {activeTab === 'payouts' && (
        <div className="space-y-3">
          {paymentsFiltered.length === 0 ? (
            <Card className="border border-dashed border-gray-300 rounded-2xl">
              <CardContent className="py-16 text-center">
                <Wallet className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-gray-900 mb-2">No payouts yet</h3>
                <p className="text-gray-500 text-sm">Request a payout once you have Rs.{MIN_PAYOUT}+ balance</p>
              </CardContent>
            </Card>
          ) : paymentsFiltered.map(payment => {
            const config = getStatusConfig(payment.status)
            return (
              <Card key={payment.id} className="border border-gray-200 rounded-2xl shadow-sm">
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <div className={"w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 " + config.color}>
                      <span className="text-lg">{payment.status === 'completed' ? '✅' : payment.status === 'rejected' ? '❌' : '🕐'}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-gray-900">Payout Request</p>
                      <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                        <span className={"text-xs font-semibold px-2 py-0.5 rounded-full " + config.color}>{config.label}</span>
                        <span className="text-xs text-gray-400 font-mono truncate max-w-32">{payment.upi_id}</span>
                      </div>
                      {payment.transaction_id && (
                        <p className="text-xs text-gray-400 font-mono mt-0.5">Txn: {payment.transaction_id}</p>
                      )}
                      <p className="text-xs text-gray-400 mt-0.5">
                        {new Date(payment.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                    </div>
                    <p className="text-lg font-black text-gray-900 flex-shrink-0">Rs.{Number(payment.amount).toFixed(0)}</p>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}