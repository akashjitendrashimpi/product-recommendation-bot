"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Wallet, TrendingUp, Clock, CheckCircle2, ArrowUpRight,
  Calendar, IndianRupee, AlertCircle, Download, XCircle, Info
} from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface EarningsComponentProps {
  userId: number
  upiId: string | null
}

interface EarningsSummary {
  totalEarnings: number
  availableBalance: number
  pendingEarnings: number
  paidEarnings: number
  pendingPayouts: number
  dailyEarnings: number
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
  user_payout: number
  amount: number
  status: string
  created_at: string
  task?: { title: string }
}

const MIN_PAYOUT = 50
const MAX_PAYOUT = 5000

export function EarningsComponent({ userId, upiId }: EarningsComponentProps) {
  const [earnings, setEarnings] = useState<EarningsSummary>({
    totalEarnings: 0, availableBalance: 0, pendingEarnings: 0,
    paidEarnings: 0, pendingPayouts: 0, dailyEarnings: 0,
    monthlyEarnings: 0, tasksCompleted: 0
  })
  const [payments, setPayments] = useState<Payment[]>([])
  const [recentEarnings, setRecentEarnings] = useState<TaskCompletion[]>([])
  const [loading, setLoading] = useState(true)
  const [payoutDialogOpen, setPayoutDialogOpen] = useState(false)
  const [payoutAmount, setPayoutAmount] = useState("")
  const [requesting, setRequesting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  useEffect(() => { fetchData() }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      const [earningsRes, paymentsRes] = await Promise.all([
        fetch('/api/earnings'),
        fetch('/api/payments')
      ])

      if (earningsRes.ok) {
        const data = await earningsRes.json()
        const summary = data.summary || {}
        setEarnings({
          totalEarnings: Number(summary.totalEarnings) || 0,
          availableBalance: Number(summary.availableBalance) || 0,
          pendingEarnings: Number(summary.availableBalance) || 0,
          paidEarnings: Number(summary.paidEarnings) || 0,
          pendingPayouts: Number(summary.pendingPayouts) || 0,
          dailyEarnings: Number(summary.dailyEarnings) || 0,
          monthlyEarnings: Number(summary.monthlyEarnings) || 0,
          tasksCompleted: Number(summary.tasksCompleted) || 0,
        })
        setRecentEarnings(data.recentCompletions || [])
      }

      if (paymentsRes.ok) {
        const data = await paymentsRes.json()
        setPayments(data.payments || [])
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleRequestPayout = async () => {
    setError(null)
    setSuccess(null)

    if (!upiId) {
      setError("Please add your UPI ID in profile settings first")
      return
    }

    const amount = parseFloat(payoutAmount)
    if (isNaN(amount) || amount <= 0) {
      setError("Please enter a valid amount")
      return
    }
    if (amount < MIN_PAYOUT) {
      setError(`Minimum payout amount is Rs.${MIN_PAYOUT}`)
      return
    }
    if (amount > MAX_PAYOUT) {
      setError(`Maximum payout per request is Rs.${MAX_PAYOUT}`)
      return
    }
    if (amount > earnings.availableBalance) {
      setError(`Amount exceeds available balance (Rs.${earnings.availableBalance.toFixed(2)})`)
      return
    }

    setRequesting(true)
    try {
      const response = await fetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to request payout')
      }

      setPayoutDialogOpen(false)
      setPayoutAmount("")
      await fetchData()
      setSuccess('Payout requested! Admin will process within 24 hours.')
      setTimeout(() => setSuccess(null), 5000)
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to request payout')
    } finally {
      setRequesting(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': case 'verified': return 'bg-green-100 text-green-700'
      case 'pending': return 'bg-yellow-100 text-yellow-700'
      case 'processing': return 'bg-blue-100 text-blue-700'
      case 'rejected': case 'failed': return 'bg-red-100 text-red-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const canRequestPayout = upiId && earnings.availableBalance >= MIN_PAYOUT

  if (loading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="grid gap-4 md:grid-cols-4">
          {[1,2,3,4].map(i => <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>)}
        </div>
        <div className="h-64 bg-gray-200 rounded-lg"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">

      {/* Success message */}
      {success && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-700">{success}</AlertDescription>
        </Alert>
      )}

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border border-gray-200 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <Wallet className="w-5 h-5 text-blue-600" />
              </div>
              <TrendingUp className="w-4 h-4 text-green-600" />
            </div>
            <p className="text-sm font-medium text-gray-600 mb-1">Total Earned</p>
            <p className="text-3xl font-bold text-gray-900">Rs.{earnings.totalEarnings.toFixed(2)}</p>
            <p className="text-xs text-gray-500 mt-2">All time</p>
          </CardContent>
        </Card>

        <Card className="border-2 border-green-200 bg-green-50/50 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                <IndianRupee className="w-5 h-5 text-green-600" />
              </div>
            </div>
            <p className="text-sm font-medium text-gray-600 mb-1">Available Balance</p>
            <p className="text-3xl font-bold text-green-600">Rs.{earnings.availableBalance.toFixed(2)}</p>
            <p className="text-xs text-gray-500 mt-2">Ready to withdraw</p>
          </CardContent>
        </Card>

        <Card className="border border-gray-200 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
                <Clock className="w-5 h-5 text-orange-600" />
              </div>
            </div>
            <p className="text-sm font-medium text-gray-600 mb-1">Pending Payouts</p>
            <p className="text-3xl font-bold text-orange-600">Rs.{earnings.pendingPayouts.toFixed(2)}</p>
            <p className="text-xs text-gray-500 mt-2">Being processed</p>
          </CardContent>
        </Card>

        <Card className="border border-gray-200 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-purple-600" />
              </div>
            </div>
            <p className="text-sm font-medium text-gray-600 mb-1">Paid Out</p>
            <p className="text-3xl font-bold text-gray-900">Rs.{earnings.paidEarnings.toFixed(2)}</p>
            <p className="text-xs text-gray-500 mt-2">{earnings.tasksCompleted} tasks done</p>
          </CardContent>
        </Card>
      </div>

      {/* Request Payout Card */}
      <Card className="border-2 border-blue-100 bg-blue-50/50">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">Request Payout</h3>
              <p className="text-sm text-gray-600">
                Min: Rs.{MIN_PAYOUT} • Max: Rs.{MAX_PAYOUT} per request • Processing: 24 hours
              </p>
              {!upiId && (
                <p className="text-sm text-red-600 mt-2 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  Please add UPI ID in profile settings
                </p>
              )}
              {upiId && earnings.availableBalance < MIN_PAYOUT && (
                <p className="text-sm text-orange-600 mt-2 flex items-center gap-1">
                  <Info className="w-4 h-4" />
                  Need Rs.{MIN_PAYOUT} minimum to withdraw
                </p>
              )}
            </div>
            <Dialog open={payoutDialogOpen} onOpenChange={(open) => { setPayoutDialogOpen(open); setError(null) }}>
              <DialogTrigger asChild>
                <Button
                  size="lg"
                  className="bg-blue-600 hover:bg-blue-700"
                  disabled={!canRequestPayout}
                >
                  <ArrowUpRight className="w-5 h-5 mr-2" />
                  Request Payout
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Request Payout</DialogTitle>
                  <DialogDescription>
                    Withdraw earnings to your UPI account
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  {error && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}
                  <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                    <p className="text-xs text-gray-500">Available Balance</p>
                    <p className="text-2xl font-bold text-green-600">Rs.{earnings.availableBalance.toFixed(2)}</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="amount">Withdrawal Amount</Label>
                    <div className="relative">
                      <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                      <Input
                        id="amount"
                        type="number"
                        placeholder={`${MIN_PAYOUT}`}
                        value={payoutAmount}
                        onChange={(e) => setPayoutAmount(e.target.value)}
                        className="pl-10"
                        min={MIN_PAYOUT}
                        max={Math.min(MAX_PAYOUT, earnings.availableBalance)}
                      />
                    </div>
                    <p className="text-xs text-gray-500">Min: Rs.{MIN_PAYOUT} • Max: Rs.{Math.min(MAX_PAYOUT, earnings.availableBalance).toFixed(2)}</p>
                  </div>
                  {upiId && (
                    <div className="p-3 bg-gray-50 rounded-lg border">
                      <p className="text-xs text-gray-500">Sending to UPI</p>
                      <p className="text-sm font-medium text-gray-900">{upiId}</p>
                    </div>
                  )}
                  <div className="flex gap-2">
                    <Button
                      onClick={handleRequestPayout}
                      disabled={requesting}
                      className="flex-1 bg-blue-600 hover:bg-blue-700"
                      size="lg"
                    >
                      {requesting ? "Processing..." : "Confirm Request"}
                    </Button>
                    <Button variant="outline" onClick={() => setPayoutDialogOpen(false)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Earnings */}
        <div className="lg:col-span-2">
          <Card className="border border-gray-200 shadow-sm">
            <CardHeader className="border-b border-gray-100">
              <CardTitle>Recent Earnings</CardTitle>
              <CardDescription>Your latest completed tasks</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              {recentEarnings.length === 0 ? (
                <div className="text-center py-8">
                  <Wallet className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-600">No earnings yet</p>
                  <p className="text-sm text-gray-500 mt-1">Complete tasks to start earning</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentEarnings.map((earning) => (
                    <div key={earning.id} className="flex items-center justify-between p-3 rounded-lg border border-gray-100 hover:border-gray-200 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                          <CheckCircle2 className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {earning.task?.title || 'Task Completed'}
                          </p>
                          <p className="text-xs text-gray-500">
                            {new Date(earning.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-green-600">
                          +Rs.{Number(earning.user_payout || earning.amount || 0).toFixed(2)}
                        </p>
                        <Badge className={`text-xs ${getStatusColor(earning.status)}`}>
                          {earning.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Payout History */}
        <Card className="border border-gray-200 shadow-sm">
          <CardHeader className="border-b border-gray-100">
            <CardTitle>Payout History</CardTitle>
            <CardDescription>Withdrawal requests</CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            {payments.length === 0 ? (
              <div className="text-center py-8">
                <Download className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-600">No payouts yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {payments.map((payment) => (
                  <div key={payment.id} className="p-3 rounded-lg border border-gray-100">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-lg font-bold text-gray-900">
                        Rs.{Number(payment.amount).toFixed(2)}
                      </span>
                      <Badge className={getStatusColor(payment.status)}>
                        {payment.status === 'pending' && <Clock className="w-3 h-3 mr-1 inline" />}
                        {payment.status === 'completed' && <CheckCircle2 className="w-3 h-3 mr-1 inline" />}
                        {payment.status === 'rejected' && <XCircle className="w-3 h-3 mr-1 inline" />}
                        {payment.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-500">{new Date(payment.created_at).toLocaleDateString()}</p>
                    {payment.transaction_id && (
                      <p className="text-xs text-gray-600 mt-1 font-mono truncate">{payment.transaction_id}</p>
                    )}
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