"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Wallet, TrendingUp, Clock, CheckCircle2, ArrowUpRight,
  AlertCircle, XCircle, Trophy, Zap, ArrowDownLeft
} from "lucide-react"

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
}

interface TaskCompletion {
  id: number
  task_id: number
  payout: number
  user_payout: number
  status: string
  created_at: string
  completed_at: string
  task?: { title: string }
}

const MIN_PAYOUT = 50
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

  useEffect(() => { fetchData() }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      const [earningsRes, paymentsRes, profileRes] = await Promise.all([
        fetch('/api/earnings'),
        fetch('/api/payments'),
        fetch('/api/user/profile'),
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
    if (amount < MIN_PAYOUT) { setError(`Minimum payout is ₹${MIN_PAYOUT}`); return }
    if (amount > MAX_PAYOUT) { setError(`Maximum per request is ₹${MAX_PAYOUT}`); return }
    if (amount > earnings.availableBalance) { setError(`Exceeds available balance ₹${earnings.availableBalance.toFixed(2)}`); return }
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
      setSuccess(`₹${amount} payout requested! Admin will process within 24 hours.`)
      setTimeout(() => setSuccess(null), 6000)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setRequesting(false)
    }
  }

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'completed': case 'verified': return { color: 'bg-green-100 text-green-700', icon: '✅', label: 'Verified' }
      case 'pending_verification': return { color: 'bg-orange-100 text-orange-700', icon: '⏳', label: 'Reviewing' }
      case 'pending': return { color: 'bg-yellow-100 text-yellow-700', icon: '🕐', label: 'Pending' }
      case 'processing': return { color: 'bg-blue-100 text-blue-700', icon: '⚡', label: 'Processing' }
      case 'rejected': case 'failed': return { color: 'bg-red-100 text-red-700', icon: '❌', label: 'Rejected' }
      default: return { color: 'bg-gray-100 text-gray-700', icon: '📋', label: status }
    }
  }

  const canRequestPayout = upiId && earnings.availableBalance >= MIN_PAYOUT

  const filteredEarnings = filterStatus === "all"
    ? recentEarnings
    : recentEarnings.filter(e => e.status === filterStatus)

  if (loading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-44 bg-gray-200 rounded-3xl" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1,2,3,4].map(i => <div key={i} className="h-28 bg-gray-200 rounded-2xl" />)}
        </div>
        <div className="h-96 bg-gray-200 rounded-2xl" />
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">

      {/* Success Banner */}
      {success && (
        <div className="bg-green-50 border border-green-200 rounded-2xl p-4 flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
          <p className="text-green-800 font-medium text-sm">{success}</p>
        </div>
      )}

      {/* Hero Balance Card */}
      <div className="bg-gradient-to-br from-green-600 via-green-700 to-emerald-800 rounded-3xl p-6 md:p-8 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-32 translate-x-32" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-24 -translate-x-24" />
        <div className="relative flex items-start justify-between flex-wrap gap-4">
          <div>
            <p className="text-green-200 text-sm font-medium mb-1">Available Balance</p>
            <div className="flex items-baseline gap-1">
              <span className="text-green-200 text-2xl font-bold">₹</span>
              <span className="text-5xl font-black text-white">{earnings.availableBalance.toFixed(0)}</span>
              <span className="text-green-300 text-xl">.{earnings.availableBalance.toFixed(2).split('.')[1]}</span>
            </div>
            <p className="text-green-300 text-sm mt-2">
              ₹{earnings.totalEarnings.toFixed(0)} total · ₹{earnings.paidEarnings.toFixed(0)} paid out
            </p>
          </div>
          <div>
            {canRequestPayout ? (
              <Button onClick={() => setShowPayoutForm(!showPayoutForm)}
                className="bg-white text-green-700 hover:bg-green-50 rounded-2xl h-12 px-6 font-bold shadow-lg">
                <ArrowUpRight className="w-4 h-4 mr-2" />
                Withdraw
              </Button>
            ) : (
              <div className="text-right bg-white/10 rounded-2xl p-3">
                {!upiId
                  ? <p className="text-yellow-300 text-xs font-bold">⚠ Add UPI to withdraw</p>
                  : <p className="text-green-300 text-xs font-medium">Need ₹{Math.max(0, MIN_PAYOUT - earnings.availableBalance).toFixed(0)} more to withdraw</p>
                }
              </div>
            )}
          </div>
        </div>
        <div className="relative grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-white/20">
          {[
            { label: "Today", value: `₹${earnings.dailyEarnings.toFixed(0)}` },
            { label: "This Week", value: `₹${earnings.weeklyEarnings.toFixed(0)}` },
            { label: "This Month", value: `₹${earnings.monthlyEarnings.toFixed(0)}` },
          ].map((s, i) => (
            <div key={i} className="text-center">
              <p className="text-white font-black text-lg">{s.value}</p>
              <p className="text-green-300 text-xs">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Payout Form */}
      {showPayoutForm && (
        <Card className="border-2 border-green-300 bg-green-50 rounded-2xl shadow-md">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-black text-gray-900 text-lg">Request Withdrawal</h3>
              <button onClick={() => { setShowPayoutForm(false); setError(null) }}
                title="Close withdrawal form" aria-label="Close withdrawal form"
                className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200">
                <XCircle className="w-4 h-4 text-gray-500" />
              </button>
            </div>
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-3 mb-4 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-semibold text-gray-700">Amount (₹)</Label>
                <div className="relative mt-1">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold">₹</span>
                  <Input type="number" value={payoutAmount} onChange={e => setPayoutAmount(e.target.value)}
                    placeholder={`${MIN_PAYOUT}`} className="pl-8 h-12 rounded-xl text-lg font-bold"
                    min={MIN_PAYOUT} max={Math.min(MAX_PAYOUT, earnings.availableBalance)} />
                </div>
                <p className="text-xs text-gray-500 mt-1">Min ₹{MIN_PAYOUT} · Max ₹{Math.min(MAX_PAYOUT, earnings.availableBalance).toFixed(0)}</p>
                <div className="flex gap-2 mt-2 flex-wrap">
                  {[50, 100, 500, 1000].filter(v => v <= earnings.availableBalance).map(v => (
                    <button key={v} onClick={() => setPayoutAmount(v.toString())}
                      className="text-xs bg-green-100 text-green-700 px-2.5 py-1 rounded-full font-semibold hover:bg-green-200">
                      ₹{v}
                    </button>
                  ))}
                  <button onClick={() => setPayoutAmount(Math.min(MAX_PAYOUT, earnings.availableBalance).toFixed(0))}
                    className="text-xs bg-green-600 text-white px-2.5 py-1 rounded-full font-semibold hover:bg-green-700">
                    Max
                  </button>
                </div>
              </div>
              <div>
                <Label className="text-sm font-semibold text-gray-700">Sending to</Label>
                <div className="mt-1 h-12 bg-white border border-gray-200 rounded-xl px-4 flex items-center gap-2">
                  <Wallet className="w-4 h-4 text-green-600 flex-shrink-0" />
                  <span className="text-sm font-medium text-gray-900 truncate">{upiId}</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">Processed within 24 hours</p>
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <Button onClick={handleRequestPayout} disabled={requesting}
                className="bg-green-600 hover:bg-green-700 rounded-xl h-12 flex-1 font-bold text-base">
                {requesting ? "Requesting..." : `Withdraw ₹${payoutAmount || "0"}`}
              </Button>
              <Button variant="outline" onClick={() => { setShowPayoutForm(false); setError(null) }} className="rounded-xl h-12">
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Total Earned", value: `₹${earnings.totalEarnings.toFixed(0)}`, sub: "All time", gradient: "from-blue-500 to-blue-700", icon: TrendingUp },
          { label: "Paid Out", value: `₹${earnings.paidEarnings.toFixed(0)}`, sub: "Withdrawn", gradient: "from-green-500 to-green-700", icon: CheckCircle2 },
          { label: "Processing", value: `₹${earnings.pendingPayouts.toFixed(0)}`, sub: "In progress", gradient: "from-orange-500 to-orange-700", icon: Clock },
          { label: "Tasks Done", value: `${earnings.tasksCompleted}`, sub: "Completed", gradient: "from-purple-500 to-purple-700", icon: Trophy },
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

      {/* Tabs */}
      <div className="flex gap-0 border-b border-gray-200">
        {[
          { key: "earnings", label: "Task Earnings", count: recentEarnings.length },
          { key: "payouts", label: "Payout History", count: payments.length },
        ].map(tab => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key as any)}
            className={`px-5 py-3 text-sm font-bold border-b-2 transition-colors ${activeTab === tab.key ? "border-blue-600 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700"}`}>
            {tab.label}
            {tab.count > 0 && (
              <span className={`ml-1.5 text-xs px-1.5 py-0.5 rounded-full ${activeTab === tab.key ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-500"}`}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Earnings Tab */}
      {activeTab === "earnings" && (
        <div className="space-y-3">
          <div className="flex gap-2 flex-wrap">
            {["all", "verified", "pending_verification", "rejected"].map(f => (
              <button key={f} onClick={() => setFilterStatus(f)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${filterStatus === f ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
                {f === "all" ? "All" : f === "pending_verification" ? "⏳ Reviewing" : f === "verified" ? "✅ Verified" : "❌ Rejected"}
              </button>
            ))}
          </div>
          {filteredEarnings.length === 0 ? (
            <Card className="border border-dashed border-gray-300 rounded-2xl">
              <CardContent className="py-16 text-center">
                <Zap className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-gray-900 mb-2">No earnings yet</h3>
                <p className="text-gray-500 text-sm">Complete tasks to start earning!</p>
              </CardContent>
            </Card>
          ) : (
            filteredEarnings.map(earning => {
              const config = getStatusConfig(earning.status)
              const amount = Number(earning.payout || earning.user_payout || 0)
              return (
                <Card key={earning.id} className="border border-gray-200 rounded-2xl shadow-sm hover:shadow-md transition-all">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0 ${config.color}`}>
                        {config.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-gray-900 text-sm truncate">
                          {earning.task?.title || `Task #${earning.task_id}`}
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {new Date(earning.completed_at || earning.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                        </p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-lg font-black text-green-600">+₹{amount.toFixed(2)}</p>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${config.color}`}>{config.label}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })
          )}
        </div>
      )}

      {/* Payouts Tab */}
      {activeTab === "payouts" && (
        <div className="space-y-3">
          {payments.length === 0 ? (
            <Card className="border border-dashed border-gray-300 rounded-2xl">
              <CardContent className="py-16 text-center">
                <ArrowDownLeft className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-gray-900 mb-2">No payouts yet</h3>
                <p className="text-gray-500 text-sm">Request a withdrawal once you have ₹{MIN_PAYOUT}+ balance</p>
              </CardContent>
            </Card>
          ) : (
            payments.map(payment => {
              const config = getStatusConfig(payment.status)
              return (
                <Card key={payment.id} className="border border-gray-200 rounded-2xl shadow-sm">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0 ${config.color}`}>
                        {config.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-black text-gray-900">₹{Number(payment.amount).toFixed(2)}</p>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${config.color}`}>{config.label}</span>
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5 truncate">
                          {payment.upi_id} · {new Date(payment.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                        </p>
                        {payment.transaction_id && (
                          <p className="text-xs text-gray-400 font-mono mt-0.5">TXN: {payment.transaction_id}</p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })
          )}
        </div>
      )}

      {/* UPI Warning */}
      {!upiId && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-gray-900 text-sm">Add UPI ID to withdraw earnings</p>
            <p className="text-xs text-gray-500 mt-0.5">Go to Profile → Edit UPI ID</p>
          </div>
        </div>
      )}
    </div>
  )
}