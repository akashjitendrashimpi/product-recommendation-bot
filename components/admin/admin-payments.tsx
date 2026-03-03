"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CheckCircle, XCircle, Clock, Copy, IndianRupee, Wallet, AlertTriangle } from "lucide-react"

interface Payment {
  id: number
  user_id: number
  amount: number
  upi_id: string
  status: 'pending' | 'processing' | 'completed' | 'rejected' | 'failed'
  transaction_id: string | null
  created_at: string
  user_email?: string
}

export function AdminPayments() {
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState<number | null>(null)
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed' | 'rejected'>('pending')
  const [copied, setCopied] = useState<string | null>(null)
  const [confirmPayment, setConfirmPayment] = useState<Payment | null>(null)
  const [transactionId, setTransactionId] = useState('')

  useEffect(() => { fetchPayments() }, [])

  const fetchPayments = async () => {
    try {
      const res = await fetch('/api/admin/payments')
      if (res.ok) {
        const data = await res.json()
        setPayments(data.payments || [])
      }
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
        setConfirmPayment(null)
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
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Payments</h1>
        <p className="text-gray-600 mt-1">Manage user payout requests</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border border-orange-200 bg-orange-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <Clock className="w-4 h-4 text-orange-600" />
              <p className="text-xs text-orange-600 font-medium">Pending</p>
            </div>
            <p className="text-2xl font-bold text-orange-700">{pendingCount}</p>
            <p className="text-xs text-orange-600">Rs.{pendingAmount.toFixed(2)} to pay</p>
          </CardContent>
        </Card>
        <Card className="border border-green-200 bg-green-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <p className="text-xs text-green-600 font-medium">Completed</p>
            </div>
            <p className="text-2xl font-bold text-green-700">{completedCount}</p>
            <p className="text-xs text-green-600">Rs.{totalPaid.toFixed(2)} paid</p>
          </CardContent>
        </Card>
        <Card className="border border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <XCircle className="w-4 h-4 text-red-600" />
              <p className="text-xs text-red-600 font-medium">Rejected</p>
            </div>
            <p className="text-2xl font-bold text-red-700">{rejectedCount}</p>
          </CardContent>
        </Card>
        <Card className="border border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <IndianRupee className="w-4 h-4 text-blue-600" />
              <p className="text-xs text-blue-600 font-medium">Total</p>
            </div>
            <p className="text-2xl font-bold text-blue-700">{payments.length}</p>
          </CardContent>
        </Card>
      </div>

      {/* Manual Payment Instructions */}
      {pendingCount > 0 && (
        <Card className="border border-orange-200 bg-orange-50">
          <CardContent className="p-4 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-orange-800">Manual Payment Required</p>
              <p className="text-xs text-orange-700 mt-1">
                Send money via PhonePe/GPay/Paytm to the UPI ID shown, then click Approve and enter the transaction ID.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Confirm Payment Modal */}
      {confirmPayment && (
        <Card className="border-2 border-green-300 bg-green-50">
          <CardContent className="p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Confirm Payment — Rs.{confirmPayment.amount}</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-2 p-3 bg-white rounded-lg border">
                <Wallet className="w-4 h-4 text-gray-500" />
                <span className="font-mono text-sm flex-1">{confirmPayment.upi_id}</span>
                <Button size="sm" variant="ghost" onClick={() => copyUpi(confirmPayment.upi_id)}>
                  <Copy className="w-3 h-3" />
                  {copied === confirmPayment.upi_id ? ' Copied!' : ' Copy'}
                </Button>
              </div>
              <div>
                <Label className="text-sm">Transaction ID (from your UPI app)</Label>
                <Input
                  value={transactionId}
                  onChange={e => setTransactionId(e.target.value)}
                  placeholder="e.g. T2403011234567"
                  className="mt-1"
                />
              </div>
              <div className="flex gap-2 pt-2">
                <Button
                  onClick={() => updatePayment(confirmPayment.id, 'completed', transactionId)}
                  disabled={updating === confirmPayment.id}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  {updating === confirmPayment.id ? 'Processing...' : 'Mark as Paid'}
                </Button>
                <Button variant="outline" onClick={() => { setConfirmPayment(null); setTransactionId('') }}>
                  Cancel
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filter Tabs */}
      <div className="flex gap-2 flex-wrap">
        {(['all', 'pending', 'completed', 'rejected'] as const).map(f => (
          <Button
            key={f}
            variant={filter === f ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter(f)}
            className={filter === f ? 'bg-blue-600' : ''}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
            {f === 'pending' && pendingCount > 0 && (
              <span className="ml-1 bg-red-500 text-white text-xs rounded-full px-1.5">{pendingCount}</span>
            )}
          </Button>
        ))}
      </div>

      {/* Payments Table */}
      <Card className="border border-gray-200">
        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 text-center text-gray-500">Loading payments...</div>
          ) : filtered.length === 0 ? (
            <div className="p-8 text-center text-gray-500">No {filter} payments found</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">User</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Amount</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">UPI ID</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Date</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filtered.map((payment) => (
                    <tr key={payment.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <p className="text-sm font-medium text-gray-900">{payment.user_email || `User #${payment.user_id}`}</p>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm font-bold text-gray-900">Rs.{Number(payment.amount).toFixed(2)}</span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <span className="text-sm text-gray-600 font-mono">{payment.upi_id}</span>
                          <Button size="sm" variant="ghost" className="h-6 w-6 p-0" onClick={() => copyUpi(payment.upi_id)}>
                            <Copy className="w-3 h-3" />
                          </Button>
                          {copied === payment.upi_id && <span className="text-xs text-green-600">Copied!</span>}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {new Date(payment.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3">
                        <div className="space-y-1">
                          <Badge className={
                            payment.status === 'completed' ? 'bg-green-100 text-green-700' :
                            payment.status === 'rejected' || payment.status === 'failed' ? 'bg-red-100 text-red-700' :
                            'bg-orange-100 text-orange-700'
                          }>
                            {payment.status === 'pending' && <Clock className="w-3 h-3 mr-1 inline" />}
                            {payment.status === 'completed' && <CheckCircle className="w-3 h-3 mr-1 inline" />}
                            {(payment.status === 'rejected' || payment.status === 'failed') && <XCircle className="w-3 h-3 mr-1 inline" />}
                            {payment.status}
                          </Badge>
                          {payment.transaction_id && (
                            <p className="text-xs text-gray-500 font-mono">{payment.transaction_id}</p>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {payment.status === 'pending' && (
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              disabled={updating === payment.id}
                              onClick={() => setConfirmPayment(payment)}
                              className="bg-green-600 hover:bg-green-700 text-white"
                            >
                              <CheckCircle className="w-3 h-3 mr-1" /> Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              disabled={updating === payment.id}
                              onClick={() => updatePayment(payment.id, 'rejected')}
                              className="text-red-600 border-red-200 hover:bg-red-50"
                            >
                              <XCircle className="w-3 h-3 mr-1" /> Reject
                            </Button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}