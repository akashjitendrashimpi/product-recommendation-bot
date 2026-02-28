"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, Clock } from "lucide-react"

interface Payment {
  id: number
  user_id: number
  amount: number
  upi_id: string
  status: 'pending' | 'completed' | 'rejected'
  created_at: string
  user_email?: string
}

export function AdminPayments() {
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState<number | null>(null)
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed' | 'rejected'>('pending')

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

  const updatePayment = async (id: number, status: 'completed' | 'rejected') => {
    setUpdating(id)
    try {
      const res = await fetch(`/api/admin/payments/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      })
      if (res.ok) fetchPayments()
    } catch (error) {
      console.error('Error updating payment:', error)
    } finally {
      setUpdating(null)
    }
  }

  const filtered = payments.filter(p => filter === 'all' || p.status === filter)
  const pendingCount = payments.filter(p => p.status === 'pending').length

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Payments</h1>
        <p className="text-gray-600 mt-1">{pendingCount} pending approvals</p>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2">
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
                      <td className="px-4 py-3 text-sm font-bold text-gray-900">₹{payment.amount}</td>
                      <td className="px-4 py-3 text-sm text-gray-600 font-mono">{payment.upi_id}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {new Date(payment.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3">
                        <Badge className={
                          payment.status === 'completed' ? 'bg-green-100 text-green-700' :
                          payment.status === 'rejected' ? 'bg-red-100 text-red-700' :
                          'bg-orange-100 text-orange-700'
                        }>
                          {payment.status === 'pending' && <Clock className="w-3 h-3 mr-1 inline" />}
                          {payment.status === 'completed' && <CheckCircle className="w-3 h-3 mr-1 inline" />}
                          {payment.status === 'rejected' && <XCircle className="w-3 h-3 mr-1 inline" />}
                          {payment.status}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        {payment.status === 'pending' && (
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              disabled={updating === payment.id}
                              onClick={() => updatePayment(payment.id, 'completed')}
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