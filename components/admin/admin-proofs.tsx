"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, Eye, Clock, IndianRupee, User } from "lucide-react"

interface PendingProof {
  id: number
  user_id: number
  task_id: number
  user_email: string | null
  user_name: string | null
  task_title: string | null
  user_payout: number
  completion_proof: string | null
  status: string
  created_at: string
}

export function AdminProofs() {
  const [proofs, setProofs] = useState<PendingProof[]>([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState<number | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  useEffect(() => { fetchProofs() }, [])

  const fetchProofs = async () => {
    try {
      const res = await fetch('/api/admin/proofs')
      if (res.ok) {
        const data = await res.json()
        setProofs(data.completions || [])
      }
    } finally {
      setLoading(false)
    }
  }

  const handleAction = async (id: number, action: 'approve' | 'reject') => {
    setUpdating(id)
    try {
      const res = await fetch('/api/admin/proofs', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completion_id: id, action })
      })
      if (res.ok) fetchProofs()
    } finally {
      setUpdating(null)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Proof Verification</h1>
        <p className="text-gray-600 mt-1">{proofs.length} pending</p>
      </div>

      {/* Screenshot Preview Modal */}
      {previewUrl && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={() => setPreviewUrl(null)}>
          <div className="relative max-w-2xl w-full bg-white rounded-2xl overflow-hidden shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="font-semibold">Proof Screenshot</h3>
              <Button variant="ghost" size="sm" onClick={() => setPreviewUrl(null)}>Close</Button>
            </div>
            <img src={previewUrl} alt="Proof" className="w-full max-h-96 object-contain p-4" />
          </div>
        </div>
      )}

      {loading ? (
        <div className="p-8 text-center text-gray-500">Loading...</div>
      ) : proofs.length === 0 ? (
        <Card className="border border-gray-200">
          <CardContent className="p-12 text-center">
            <CheckCircle className="w-16 h-16 text-green-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">All caught up!</h3>
            <p className="text-gray-500">No pending verifications right now.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {proofs.map((proof) => (
            <Card key={proof.id} className="border border-orange-200 bg-orange-50/30">
              <CardContent className="p-5">
                <div className="flex flex-col md:flex-row md:items-center gap-4">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                        <User className="w-4 h-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{proof.user_name || 'Unknown'}</p>
                        <p className="text-xs text-gray-500">{proof.user_email}</p>
                      </div>
                    </div>
                    <div className="pl-10 space-y-1">
                      <p className="text-sm text-gray-700"><span className="font-medium">Task:</span> {proof.task_title}</p>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1 text-green-600">
                          <IndianRupee className="w-3 h-3" />
                          <span className="text-sm font-bold">{Number(proof.user_payout).toFixed(2)}</span>
                        </div>
                        <div className="flex items-center gap-1 text-gray-500">
                          <Clock className="w-3 h-3" />
                          <span className="text-xs">{new Date(proof.created_at).toLocaleDateString()}</span>
                        </div>
                        <Badge className="bg-orange-100 text-orange-700 text-xs">Pending</Badge>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {proof.completion_proof ? (
                      <button onClick={() => setPreviewUrl(proof.completion_proof)}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-200 rounded-lg text-blue-600 text-sm font-medium hover:bg-blue-100 transition-colors">
                        <Eye className="w-4 h-4" /> View Screenshot
                      </button>
                    ) : (
                      <span className="text-sm text-gray-400 italic">No screenshot</span>
                    )}
                    <Button size="sm" disabled={updating === proof.id}
                      onClick={() => handleAction(proof.id, 'approve')}
                      className="bg-green-600 hover:bg-green-700 text-white">
                      <CheckCircle className="w-4 h-4 mr-1" />
                      {updating === proof.id ? '...' : 'Approve'}
                    </Button>
                    <Button size="sm" variant="outline" disabled={updating === proof.id}
                      onClick={() => handleAction(proof.id, 'reject')}
                      className="text-red-600 border-red-200 hover:bg-red-50">
                      <XCircle className="w-4 h-4 mr-1" /> Reject
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}