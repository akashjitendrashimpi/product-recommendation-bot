"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { CheckCircle, XCircle, Clock, Copy, IndianRupee, Wallet, AlertTriangle, X, ExternalLink } from "lucide-react"

interface Payment {
  id: number
  user_id: number
  amount: number
  upi_id: string
  status: 'pending' | 'processing' | 'completed' | 'rejected' | 'failed'
  transaction_id: string | null
  created_at: string
  description: string | null
  user_email?: string
  user_name?: string
  task_title?: string
}

export function AdminPayments() {
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState<number | null>(null)
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed' | 'rejected'>('pending')
  const [copied, setCopied] = useState<string | null>(null)
  const [payingPayment, setPayingPayment] = useState<Payment | null>(null)
  const [transactionId, setTransactionId] = useState('')
  const [rejectingId, setRejectingId] = useState<number | null>(null)

  useEffect(() => { fetchPayments() }, [])

  const fetchPayments = async () => {
    try {
      const res = await fetch('/api/admin/payments')
      if (res.ok) setPayments((await res.json()).payments || [])
    } catch (error) {
      console.error('Error fetching payments:', error)
    } finally {
      setLoading(false)
    }
  }

  const updatePayment = async (id: number, status: 'completed' | 'rejected', txnId?: string) => {
    setUpdating(id)
    try {
      const res = await fetch(`/api/admin/payments/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, transaction_id: txnId || null })
      })
      if (res.ok) {
        fetchPayments()
        setPayingPayment(null)
        setRejectingId(null)
        setTransactionId('')
      }
    } catch (error) {
      console.error('Error updating payment:', error)
    } finally {
      setUpdating(null)
    }
  }

  const copyUpi = (upi: string) => {
    navigator.clipboard.writeText(upi)
    setCopied(upi)
    setTimeout(() => setCopied(null), 2000)
  }

  const pendingCount = payments.filter(p => p.status === 'pending').length
  const completedCount = payments.filter(p => p.status === 'completed').length
  const rejectedCount = payments.filter(p => p.status === 'rejected').length
  const totalPaid = payments.filter(p => p.status === 'completed').reduce((s, p) => s + Number(p.amount), 0)
  const pendingAmount = payments.filter(p => p.status === 'pending').reduce((s, p) => s + Number(p.amount), 0)
  const filtered = payments.filter(p => filter === 'all' || p.status === filter)

  return (
    <div className="space-y-6">

      {/* Pay Modal */}
      {payingPayment && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-gray-900">Mark as Paid</h3>
              <button onClick={() => { setPayingPayment(null); setTransactionId('') }}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center">
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>

            {/* Payment Summary */}
            <div className="bg-green-50 border border-green-200 rounded-2xl p-4 mb-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-xs text-gray-500">User</p>
                  <p className="text-sm font-bold text-gray-900">{payingPayment.user_name || payingPayment.user_email || `User #${payingPayment.user_id}`}</p>
                  <p className="text-xs text-gray-500">{payingPayment.user_email}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500">Amount</p>
                  <div className="flex items-center gap-0.5 justify-end">
                    <IndianRupee className="w-4 h-4 text-green-600" />
                    <p className="text-2xl font-black text-green-600">{Number(payingPayment.amount).toFixed(0)}</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 bg-white rounded-xl p-3 border border-green-100">
                <Wallet className="w-4 h-4 text-gray-500 flex-shrink-0" />
                <span className="font-mono text-sm flex-1 text-gray-800">{payingPayment.upi_id}</span>
                <button onClick={() => copyUpi(payingPayment.upi_id)}
                  className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 font-semibold bg-blue-50 px-2 py-1 rounded-lg">
                  <Copy className="w-3 h-3" />
                  {copied === payingPayment.upi_id ? 'Copied!' : 'Copy'}
                </button>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 mb-4 text-xs text-blue-700">
              <p className="font-semibold mb-0.5">Steps:</p>
              <p>1. Open PhonePe / GPay / Paytm</p>
              <p>2. Send ₹{Number(payingPayment.amount).toFixed(0)} to the UPI ID above</p>
              <p>3. Copy the transaction ID and paste below</p>
            </div>

            <div className="space-y-2 mb-5">
              <label className="text-sm font-semibold text-gray-700">Transaction ID</label>
              <Input
                value={transactionId}
                onChange={e => setTransactionId(e.target.value)}
                placeholder="e.g. T2403011234567 (optional)"
                className="rounded-xl h-11"
              />
              <p className="text-xs text-gray-400">Transaction ID is optional but recommended for records</p>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" onClick={() => { setPayingPayment(null); setTransactionId('') }} className="flex-1 rounded-xl">
                Cancel
              </Button>
              <Button
                onClick={() => updatePayment(payingPayment.id, 'completed', transactionId)}
                disabled={updating === payingPayment.id}
                className="flex-1 bg-green-600 hover:bg-green-700 rounded-xl"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                {updating === payingPayment.id ? 'Saving...' : 'Confirm Paid'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Confirm */}
      {rejectingId && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 text-center">
            <div className="w-14 h-14 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <XCircle className="w-7 h-7 text-red-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Reject Payment?</h3>
            <p className="text-sm text-gray-500 mb-5">The user's earnings balance will remain unchanged. They can request again.</p>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setRejectingId(null)} className="flex-1 rounded-xl">Cancel</Button>
              <Button
                onClick={() => updatePayment(rejectingId, 'rejected')}
                disabled={updating === rejectingId}
                className="flex-1 bg-red-600 hover:bg-red-700 rounded-xl"
              >
                {updating === rejectingId ? 'Rejecting...' : 'Yes, Reject'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Payments</h1>
        <p className="text-gray-500 mt-1">Manage and process user payout requests</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Pending', value: pendingCount, sub: `₹${pendingAmount.toFixed(0)} to pay`, icon: Clock, color: 'orange' },
          { label: 'Paid Out', value: completedCount, sub: `₹${totalPaid.toFixed(0)} total`, icon: CheckCircle, color: 'green' },
          { label: 'Rejected', value: rejectedCount, sub: 'declined', icon: XCircle, color: 'red' },
          { label: 'All Time', value: payments.length, sub: 'total requests', icon: IndianRupee, color: 'blue' },
        ].map((s, i) => (
          <Card key={i} className={`border border-${s.color}-200 bg-${s.color}-50 rounded-2xl`}>
            <CardContent className="p-4">
              <div className="flex items-center gap-1.5 mb-1">
                <s.icon className={`w-3.5 h-3.5 text-${s.color}-600`} />
                <p className={`text-xs text-${s.color}-600 font-medium`}>{s.label}</p>
              </div>
              <p className={`text-2xl font-black text-${s.color}-700`}>{s.value}</p>
              <p className={`text-xs text-${s.color}-500 mt-0.5`}>{s.sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Pending Alert */}
      {pendingCount > 0 && (
        <div className="bg-orange-50 border border-orange-200 rounded-2xl p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-bold text-orange-800">{pendingCount} payment{pendingCount > 1 ? 's' : ''} waiting — ₹{pendingAmount.toFixed(0)} total</p>
            <p className="text-xs text-orange-600 mt-0.5">Send money via PhonePe/GPay/Paytm to the UPI ID, then click Pay and enter the transaction ID.</p>
          </div>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex gap-1 p-1 bg-gray-100 rounded-xl w-fit">
        {(['pending', 'completed', 'rejected', 'all'] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${filter === f ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
            {f.charAt(0).toUpperCase() + f.slice(1)}
            {f === 'pending' && pendingCount > 0 && (
              <span className="ml-1.5 bg-orange-500 text-white text-xs rounded-full px-1.5 py-0.5">{pendingCount}</span>
            )}
          </button>
        ))}
      </div>

      {/* Payments List */}
      {loading ? (
        <div className="space-y-3">
          {[1,2,3].map(i => <div key={i} className="h-24 bg-gray-100 rounded-2xl animate-pulse" />)}
        </div>
      ) : filtered.length === 0 ? (
        <Card className="border border-gray-200 rounded-2xl">
          <CardContent className="p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Wallet className="w-8 h-8 text-gray-300" />
            </div>
            <p className="text-gray-500 font-medium">No {filter} payments</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map((payment) => (
            <Card key={payment.id} className={`border rounded-2xl transition-all ${
              payment.status === 'pending' ? 'border-orange-200 hover:shadow-md' : 'border-gray-200'
            }`}>
              <CardContent className="p-5">
                <div className="flex flex-col md:flex-row md:items-center gap-4">
                  {/* Info */}
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-bold text-gray-900">
                        {payment.user_name || payment.user_email || `User #${payment.user_id}`}
                      </p>
                      <Badge className={
                        payment.status === 'completed' ? 'bg-green-100 text-green-700 border-0' :
                        payment.status === 'rejected' || payment.status === 'failed' ? 'bg-red-100 text-red-700 border-0' :
                        'bg-orange-100 text-orange-700 border-0'
                      }>
                        {payment.status === 'pending' && <Clock className="w-3 h-3 mr-1 inline" />}
                        {payment.status === 'completed' && <CheckCircle className="w-3 h-3 mr-1 inline" />}
                        {(payment.status === 'rejected' || payment.status === 'failed') && <XCircle className="w-3 h-3 mr-1 inline" />}
                        {payment.status}
                      </Badge>
                    </div>

                    <div className="flex items-center gap-3 flex-wrap">
                      {/* Amount */}
                      <div className="flex items-center gap-0.5">
                        <IndianRupee className="w-4 h-4 text-gray-700" />
                        <span className="text-lg font-black text-gray-900">{Number(payment.amount).toFixed(0)}</span>
                      </div>

                      {/* UPI */}
                      <button onClick={() => copyUpi(payment.upi_id)}
                        className="flex items-center gap-1.5 bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-xl text-xs font-mono text-gray-700 transition-colors">
                        <Copy className="w-3 h-3" />
                        {payment.upi_id}
                        {copied === payment.upi_id && <span className="text-green-600 font-semibold ml-1">Copied!</span>}
                      </button>

                      {/* Task */}
                      {payment.description && (
                        <span className="text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded-lg">
                          {payment.description}
                        </span>
                      )}

                      {/* Date */}
                      <span className="text-xs text-gray-400">
                        {new Date(payment.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>

                      {/* Transaction ID */}
                      {payment.transaction_id && (
                        <span className="text-xs text-green-600 font-mono bg-green-50 px-2 py-1 rounded-lg">
                          Txn: {payment.transaction_id}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  {payment.status === 'pending' && (
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        disabled={updating === payment.id}
                        onClick={() => setPayingPayment(payment)}
                        className="bg-green-600 hover:bg-green-700 text-white rounded-xl h-10 px-4"
                      >
                        <CheckCircle className="w-4 h-4 mr-1.5" /> Pay Now
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={updating === payment.id}
                        onClick={() => setRejectingId(payment.id)}
                        className="text-red-600 border-red-200 hover:bg-red-50 rounded-xl h-10 px-4"
                      >
                        <XCircle className="w-4 h-4 mr-1.5" /> Reject
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}