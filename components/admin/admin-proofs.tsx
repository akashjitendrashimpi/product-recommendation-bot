"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, Clock, IndianRupee, User, Camera, AlertCircle, X, Download, Filter } from "lucide-react"

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
  const [previewProof, setPreviewProof] = useState<PendingProof | null>(null)
  const [confirmAction, setConfirmAction] = useState<{ proof: PendingProof; action: 'approve' | 'reject' } | null>(null)
  const [selectedTask, setSelectedTask] = useState<string>("all")
  const [downloading, setDownloading] = useState<number | null>(null)

  useEffect(() => { fetchProofs() }, [])

  const fetchProofs = async () => {
    try {
      const res = await fetch('/api/admin/proofs')
      if (res.ok) setProofs((await res.json()).completions || [])
    } finally {
      setLoading(false)
    }
  }

  const handleAction = async (id: number, action: 'approve' | 'reject') => {
    setUpdating(id)
    setConfirmAction(null)
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

  const handleDownload = async (proof: PendingProof) => {
    if (!proof.completion_proof) return
    setDownloading(proof.id)
    try {
      const response = await fetch(proof.completion_proof)
      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      // Filename: taskname_username_date.jpg
      const taskName = (proof.task_title || 'task').replace(/\s+/g, '_').toLowerCase()
      const userName = (proof.user_name || proof.user_email || 'user').replace(/\s+/g, '_').toLowerCase()
      const date = new Date(proof.created_at).toISOString().split('T')[0]
      a.download = `${taskName}_${userName}_${date}.jpg`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch {
      alert('Failed to download. Try right-clicking the image and saving it.')
    } finally {
      setDownloading(null)
    }
  }

  // Get unique task names for filter
  const uniqueTasks = ["all", ...new Set(proofs.map(p => p.task_title || "Unknown task"))]

  const filteredProofs = selectedTask === "all"
    ? proofs
    : proofs.filter(p => p.task_title === selectedTask)

  const totalPending = filteredProofs.length
  const totalAmount = filteredProofs.reduce((s, p) => s + Number(p.user_payout), 0)

  return (
    <div className="space-y-6">

      {/* Screenshot Preview Modal */}
      {previewProof && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4" onClick={() => setPreviewProof(null)}>
          <div className="relative max-w-2xl w-full bg-white rounded-2xl overflow-hidden shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <div>
                <h3 className="font-bold text-gray-900">Proof Screenshot</h3>
                <p className="text-xs text-gray-500 mt-0.5">{previewProof.task_title} · {previewProof.user_email}</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleDownload(previewProof)}
                  disabled={downloading === previewProof.id}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-xl text-gray-700 text-sm font-medium transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  {downloading === previewProof.id ? 'Downloading...' : 'Download'}
                </button>
                <Button size="sm"
                  onClick={() => { setConfirmAction({ proof: previewProof, action: 'approve' }); setPreviewProof(null) }}
                  className="bg-green-600 hover:bg-green-700 text-white rounded-xl">
                  <CheckCircle className="w-3.5 h-3.5 mr-1.5" /> Approve
                </Button>
                <Button size="sm" variant="outline"
                  onClick={() => { setConfirmAction({ proof: previewProof, action: 'reject' }); setPreviewProof(null) }}
                  className="text-red-600 border-red-200 hover:bg-red-50 rounded-xl">
                  <XCircle className="w-3.5 h-3.5 mr-1.5" /> Reject
                </Button>
                <button onClick={() => setPreviewProof(null)}
                  className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center ml-1">
                  <X className="w-4 h-4 text-gray-500" />
                </button>
              </div>
            </div>
            <img src={previewProof.completion_proof!} alt="Proof"
              className="w-full max-h-[70vh] object-contain bg-gray-50 p-4" />
          </div>
        </div>
      )}

      {/* Confirm Action Modal */}
      {confirmAction && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 ${confirmAction.action === 'approve' ? 'bg-green-100' : 'bg-red-100'}`}>
              {confirmAction.action === 'approve'
                ? <CheckCircle className="w-7 h-7 text-green-600" />
                : <XCircle className="w-7 h-7 text-red-600" />}
            </div>
            <h3 className="text-lg font-bold text-gray-900 text-center mb-1">
              {confirmAction.action === 'approve' ? 'Approve Proof?' : 'Reject Proof?'}
            </h3>
            <p className="text-sm text-gray-500 text-center mb-1">{confirmAction.proof.task_title}</p>
            <p className="text-sm text-gray-500 text-center mb-5">{confirmAction.proof.user_email}</p>

            {confirmAction.action === 'approve' ? (
              <div className="bg-green-50 border border-green-200 rounded-xl p-3 mb-5 text-center">
                <p className="text-green-700 text-sm">₹{Number(confirmAction.proof.user_payout).toFixed(2)} will be credited to user</p>
                <p className="text-green-600 text-xs mt-0.5">Earnings added to user balance</p>
              </div>
            ) : (
              <div className="bg-red-50 border border-red-200 rounded-xl p-3 mb-5 text-center">
                <p className="text-red-700 text-sm">User will NOT receive payment</p>
                <p className="text-red-600 text-xs mt-0.5">They can resubmit the task if needed</p>
              </div>
            )}

            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setConfirmAction(null)} className="flex-1 rounded-xl">Cancel</Button>
              <Button
                onClick={() => handleAction(confirmAction.proof.id, confirmAction.action)}
                disabled={updating === confirmAction.proof.id}
                className={`flex-1 rounded-xl ${confirmAction.action === 'approve' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}`}
              >
                {updating === confirmAction.proof.id ? 'Processing...' : confirmAction.action === 'approve' ? 'Yes, Approve' : 'Yes, Reject'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Proof Verification</h1>
          <p className="text-gray-500 mt-1">Review screenshots submitted by users</p>
        </div>
        {proofs.length > 0 && (
          <div className="bg-orange-100 text-orange-700 px-4 py-2 rounded-xl text-sm font-bold">
            {totalPending} pending · ₹{totalAmount.toFixed(0)} at stake
            {selectedTask !== "all" && <span className="ml-1 text-orange-500">(filtered)</span>}
          </div>
        )}
      </div>

      {/* Task Filter */}
      {uniqueTasks.length > 2 && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <p className="text-sm font-semibold text-gray-700">Filter by Task</p>
          </div>
          <div className="flex gap-2 flex-wrap">
            {uniqueTasks.map(task => (
              <button
                key={task}
                onClick={() => setSelectedTask(task)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  selectedTask === task
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {task === "all"
                  ? `🎯 All (${proofs.length})`
                  : `${task} (${proofs.filter(p => p.task_title === task).length})`
                }
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Alert */}
      {proofs.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-blue-900">How this works</p>
            <p className="text-xs text-blue-700 mt-0.5">
              <span className="font-medium">Approve</span> → earnings credited to user balance. &nbsp;
              <span className="font-medium">Reject</span> → user gets nothing, can resubmit. &nbsp;
              <span className="font-medium">Download</span> → save screenshot to share with client.
            </p>
          </div>
        </div>
      )}

      {loading ? (
        <div className="space-y-4">
          {[1,2,3].map(i => <div key={i} className="h-28 bg-gray-100 rounded-2xl animate-pulse" />)}
        </div>
      ) : filteredProofs.length === 0 ? (
        <Card className="border border-gray-200 rounded-2xl">
          <CardContent className="p-16 text-center">
            <div className="w-20 h-20 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-10 h-10 text-green-500" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              {selectedTask === "all" ? "All caught up!" : `No pending proofs for "${selectedTask}"`}
            </h3>
            <p className="text-gray-500 text-sm">
              {selectedTask === "all"
                ? "No pending proof verifications right now."
                : "Try selecting a different task filter."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredProofs.map((proof) => (
            <Card key={proof.id} className="border border-gray-200 hover:border-orange-200 hover:shadow-md transition-all rounded-2xl">
              <CardContent className="p-5">
                <div className="flex flex-col md:flex-row md:items-center gap-4">
                  {/* User + Task Info */}
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center flex-shrink-0">
                        <User className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-900">{proof.user_name || 'Unknown User'}</p>
                        <p className="text-xs text-gray-500">{proof.user_email}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 flex-wrap">
                      <div className="bg-gray-100 rounded-xl px-3 py-1.5">
                        <p className="text-xs text-gray-500">Task</p>
                        <p className="text-sm font-semibold text-gray-800">{proof.task_title || 'Unknown task'}</p>
                      </div>
                      <div className="bg-green-50 border border-green-100 rounded-xl px-3 py-1.5">
                        <p className="text-xs text-gray-500">Payout</p>
                        <div className="flex items-center gap-0.5">
                          <IndianRupee className="w-3 h-3 text-green-600" />
                          <p className="text-sm font-black text-green-600">{Number(proof.user_payout).toFixed(0)}</p>
                        </div>
                      </div>
                      <div className="bg-gray-50 rounded-xl px-3 py-1.5">
                        <p className="text-xs text-gray-500">Submitted</p>
                        <p className="text-sm font-medium text-gray-700">
                          {new Date(proof.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                      <Badge className="bg-orange-100 text-orange-700 border-0 rounded-xl">
                        <Clock className="w-3 h-3 mr-1" /> Pending Review
                      </Badge>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 flex-wrap">
                    {proof.completion_proof ? (
                      <>
                        <button
                          onClick={() => setPreviewProof(proof)}
                          className="flex items-center gap-2 px-4 py-2.5 bg-blue-50 border border-blue-200 rounded-xl text-blue-600 text-sm font-semibold hover:bg-blue-100 transition-colors"
                        >
                          <Camera className="w-4 h-4" /> View
                        </button>
                        <button
                          onClick={() => handleDownload(proof)}
                          disabled={downloading === proof.id}
                          className="flex items-center gap-2 px-4 py-2.5 bg-purple-50 border border-purple-200 rounded-xl text-purple-600 text-sm font-semibold hover:bg-purple-100 transition-colors disabled:opacity-50"
                        >
                          <Download className="w-4 h-4" />
                          {downloading === proof.id ? '...' : 'Download'}
                        </button>
                      </>
                    ) : (
                      <span className="flex items-center gap-1.5 text-sm text-gray-400 bg-gray-100 px-3 py-2 rounded-xl">
                        <Camera className="w-4 h-4" /> No screenshot
                      </span>
                    )}
                    <Button
                      size="sm"
                      disabled={updating === proof.id}
                      onClick={() => setConfirmAction({ proof, action: 'approve' })}
                      className="bg-green-600 hover:bg-green-700 text-white rounded-xl h-10 px-4"
                    >
                      <CheckCircle className="w-4 h-4 mr-1.5" />
                      {updating === proof.id ? '...' : 'Approve'}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={updating === proof.id}
                      onClick={() => setConfirmAction({ proof, action: 'reject' })}
                      className="text-red-600 border-red-200 hover:bg-red-50 rounded-xl h-10 px-4"
                    >
                      <XCircle className="w-4 h-4 mr-1.5" /> Reject
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