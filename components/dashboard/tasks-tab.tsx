"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import type { Task, TaskCompletion } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  CheckCircle2, Circle, ExternalLink, IndianRupee, TrendingUp,
  Wallet, Clock, Upload, Camera, X, AlertCircle,
  Zap, Trophy, Edit2, CheckCircle, Users, ChevronRight, LayoutTemplate
} from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface TasksTabProps {
  userId: number
}

interface EarningsSummary {
  totalEarnings: number
  dailyEarnings: number
  monthlyEarnings: number
  tasksCompleted: number
}

interface ProofUploadState {
  completionId: number
  taskTitle: string
  payout: number
  instructions: string | null
}

interface TaskWithSlots extends Task {
  max_completions?: number | null
  completion_count?: number
  has_detail_page?: boolean
  how_to_steps?: string[]
  copy_prompts?: string[]
}

export function TasksTab({ userId }: TasksTabProps) {
  const router = useRouter()
  const [tasks, setTasks] = useState<TaskWithSlots[]>([])
  const [completions, setCompletions] = useState<any[]>([])
  const [earnings, setEarnings] = useState<EarningsSummary>({
    totalEarnings: 0, dailyEarnings: 0, monthlyEarnings: 0, tasksCompleted: 0,
  })
  const [isLoading, setIsLoading] = useState(true)
  const [completingTaskId, setCompletingTaskId] = useState<number | null>(null)
  const [upiDialogOpen, setUpiDialogOpen] = useState(false)
  const [upiId, setUpiId] = useState("")
  const [isSavingUpi, setIsSavingUpi] = useState(false)
  const [userUpiId, setUserUpiId] = useState<string | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [proofState, setProofState] = useState<ProofUploadState | null>(null)
  const [proofFile, setProofFile] = useState<File | null>(null)
  const [proofPreview, setProofPreview] = useState<string | null>(null)
  const [uploadingProof, setUploadingProof] = useState(false)
  const [proofSuccess, setProofSuccess] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => { loadData() }, [])

  const loadData = async () => {
    setIsLoading(true)
    try {
      const [tasksRes, earningsRes, profileRes] = await Promise.all([
        fetch("/api/tasks?country=IN"),
        fetch("/api/earnings"),
        fetch("/api/user/profile"),
      ])
      const tasksData = await tasksRes.json()
      const earningsData = await earningsRes.json()
      const profileData = await profileRes.json()

      setTasks(tasksData.tasks || [])
      setCompletions(earningsData.recentCompletions || [])
      setUserUpiId(profileData.user?.upi_id || null)

      const summary = earningsData.summary || {}
      setEarnings({
        totalEarnings: Number(summary.totalEarnings) || 0,
        dailyEarnings: Number(summary.dailyEarnings) || 0,
        monthlyEarnings: Number(summary.monthlyEarnings) || 0,
        tasksCompleted: Number(summary.tasksCompleted) || 0,
      })
    } catch (error) {
      console.error("Error loading data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCompleteTask = async (task: TaskWithSlots) => {
    // If detail page is enabled, navigate there instead
    if (task.has_detail_page) {
      router.push(`/dashboard/tasks/${task.id}`)
      return
    }

    if (completingTaskId) return
    try {
      const clickRes = await fetch(`/api/tasks/${task.id}/click`, { method: 'POST' })
      const clickData = await clickRes.json()
      window.open(clickData.redirect_url || task.task_url, "_blank", "noopener,noreferrer")
    } catch {
      window.open(task.task_url, "_blank", "noopener,noreferrer")
    }
    setCompletingTaskId(task.id)
    try {
      setTimeout(async () => {
        const response = await fetch(`/api/tasks/${task.id}/complete`, { method: "POST" })
        const data = await response.json()
        if (!response.ok) {
          alert(data.error || "Failed to complete task")
          setCompletingTaskId(null)
          return
        }
        await loadData()
        setCompletingTaskId(null)
        if (data.requiresProof && data.completion?.id) {
          setProofState({
            completionId: data.completion.id,
            taskTitle: task.title,
            payout: Number(task.user_payout),
            instructions: (task as any).proof_instructions || null
          })
          setProofSuccess(false)
          setProofFile(null)
          setProofPreview(null)
        }
      }, 2000)
    } catch {
      alert("Failed to complete task. Please try again.")
      setCompletingTaskId(null)
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) { alert('Please select an image file'); return }
    if (file.size > 5 * 1024 * 1024) { alert('File too large. Max 5MB'); return }
    setProofFile(file)
    const reader = new FileReader()
    reader.onload = (e) => setProofPreview(e.target?.result as string)
    reader.readAsDataURL(file)
  }

  const handleUploadProof = async () => {
    if (!proofFile || !proofState) return
    setUploadingProof(true)
    try {
      const formData = new FormData()
      formData.append('screenshot', proofFile)
      const res = await fetch(`/api/task-completions/${proofState.completionId}/proof`, {
        method: 'POST', body: formData
      })
      const data = await res.json()
      if (res.ok) { setProofSuccess(true); await loadData() }
      else alert(data.error || 'Failed to upload proof')
    } catch { alert('Failed to upload. Please try again.') }
    finally { setUploadingProof(false) }
  }

  const handleSaveUpi = async () => {
    if (!upiId.trim()) { alert("Please enter a valid UPI ID"); return }
    setIsSavingUpi(true)
    try {
      const response = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ upi_id: upiId }),
      })
      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to save UPI ID")
      }
      setUserUpiId(upiId)
      setUpiDialogOpen(false)
      setUpiId("")
    } catch (error) {
      alert(error instanceof Error ? error.message : "Failed to save UPI ID")
    } finally { setIsSavingUpi(false) }
  }

  const openUpiDialog = () => {
    setUpiId(userUpiId || "")
    setUpiDialogOpen(true)
  }

  const isTaskCompleted = (taskId: number) =>
    completions.some(c => Number(c.task_id) === Number(taskId) && c.status !== "rejected")

  const isTaskRetryable = (taskId: number) => {
    const taskCompletions = completions.filter(c => Number(c.task_id) === Number(taskId))
    return taskCompletions.length > 0 && taskCompletions.every(c => c.status === "rejected")
  }

  const availableTasks = tasks.filter(t => !isTaskCompleted(t.id) || isTaskRetryable(t.id))
  const completedCompletions = completions.filter(c => c.status !== "rejected")

  const categories = ["all", ...new Set(tasks.map(t => t.action_type || "Other"))]
  const filteredTasks = selectedCategory === "all"
    ? availableTasks
    : availableTasks.filter(t => t.action_type === selectedCategory)

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'verified': return 'bg-green-100 text-green-700 border-green-200'
      case 'pending_verification': return 'bg-orange-100 text-orange-700 border-orange-200'
      case 'rejected': return 'bg-red-100 text-red-700 border-red-200'
      default: return 'bg-blue-100 text-blue-700 border-blue-200'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'verified': return '✅ Verified'
      case 'pending_verification': return '⏳ Under Review'
      case 'rejected': return '❌ Rejected'
      default: return '🎯 Completed'
    }
  }

  const getActionTypeIcon = (type: string) => {
    switch (type) {
      case 'install': return '📲'
      case 'signup': return '✍️'
      case 'survey': return '📋'
      case 'review': return '⭐'
      case 'time_spent': return '⏱️'
      default: return '🎯'
    }
  }

  const SlotsBar = ({ task }: { task: TaskWithSlots }) => {
    if (!task.max_completions) return null
    const filled = task.completion_count || 0
    const total = task.max_completions
    const remaining = total - filled
    const pct = Math.min((filled / total) * 100, 100)
    const isFull = remaining <= 0
    const isCritical = !isFull && remaining <= Math.ceil(total * 0.1)
    return (
      <div className="mt-2 pt-2 border-t border-gray-100">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-1">
            <Users className="w-3 h-3 text-gray-400" />
            <span className={`text-xs font-semibold ${isFull ? 'text-red-500' : isCritical ? 'text-orange-600' : 'text-gray-500'}`}>
              {isFull ? '🔒 All slots filled' : isCritical ? `🔥 Only ${remaining} spots left!` : `${remaining} of ${total} spots available`}
            </span>
          </div>
          <span className="text-xs text-gray-400">{filled}/{total}</span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-1.5">
          <div
            className={`h-1.5 rounded-full transition-all ${isFull ? 'bg-red-400' : pct > 80 ? 'bg-orange-500' : 'bg-blue-400'}`}
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-4 w-full">
        <div className="grid gap-2 grid-cols-2">
          {[1,2,3,4].map(i => <div key={i} className="h-24 bg-gray-200 rounded-2xl" />)}
        </div>
        <div className="h-20 bg-gray-200 rounded-2xl" />
        <div className="h-48 bg-gray-200 rounded-2xl" />
      </div>
    )
  }

  return (
    <div className="space-y-4">

      {/* ── Proof Upload Dialog ── */}
      {proofState && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl w-full sm:max-w-md max-h-[92vh] overflow-y-auto">
            {proofSuccess ? (
              <div className="p-8 text-center">
                <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-6 sm:hidden" />
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="w-10 h-10 text-green-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Proof Submitted! 🎉</h3>
                <p className="text-gray-500 mb-4">Your screenshot has been sent for review.</p>
                <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6">
                  <p className="text-green-700 font-bold text-lg">₹{proofState.payout.toFixed(2)} pending</p>
                  <p className="text-green-600 text-sm">Admin verifies within 24 hours</p>
                </div>
                <Button onClick={() => setProofState(null)} className="bg-blue-600 hover:bg-blue-700 w-full h-12 rounded-xl font-semibold">Done</Button>
              </div>
            ) : (
              <div className="p-5 sm:p-6">
                <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-4 sm:hidden" />
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">Upload Proof</h3>
                    <p className="text-xs text-gray-500">Screenshot required to receive payment</p>
                  </div>
                  <button aria-label="Close proof upload" onClick={() => setProofState(null)} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 active:bg-gray-300 transition-colors">
                    <X className="w-4 h-4 text-gray-500" />
                  </button>
                </div>
                <div className="bg-gradient-to-r from-blue-50 to-green-50 border border-blue-100 rounded-xl p-4 mb-4">
                  <p className="text-sm font-semibold text-gray-900 mb-1 truncate">{proofState.taskTitle}</p>
                  <div className="flex items-center gap-1">
                    <IndianRupee className="w-4 h-4 text-green-600" />
                    <span className="text-2xl font-black text-green-600">{proofState.payout.toFixed(2)}</span>
                    <span className="text-xs text-gray-500 ml-1">after verification</span>
                  </div>
                </div>
                <div className="bg-orange-50 border border-orange-200 rounded-xl p-3 mb-4 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-orange-700">{proofState.instructions || "Take a screenshot proving you completed the task and upload it below."}</p>
                </div>
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all mb-4 ${proofPreview ? 'border-blue-400 bg-blue-50' : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50 active:bg-blue-100'}`}
                >
                  {proofPreview ? (
                    <div>
                      <img src={proofPreview} alt="Preview" className="max-h-40 mx-auto rounded-xl object-contain shadow-sm" />
                      <p className="text-xs text-blue-600 mt-3 font-semibold">✓ Screenshot ready — tap to change</p>
                    </div>
                  ) : (
                    <div>
                      <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                        <Camera className="w-7 h-7 text-gray-400" />
                      </div>
                      <p className="text-sm font-semibold text-gray-700">Tap to upload screenshot</p>
                      <p className="text-xs text-gray-400 mt-1">PNG, JPG up to 5MB</p>
                    </div>
                  )}
                </div>
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileSelect} aria-label="Upload proof screenshot" title="Upload proof screenshot" />
                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => setProofState(null)} className="flex-1 rounded-xl h-12">Skip for now</Button>
                  <Button onClick={handleUploadProof} disabled={!proofFile || uploadingProof} className="flex-1 bg-blue-600 hover:bg-blue-700 rounded-xl h-12">
                    {uploadingProof ? <><Clock className="w-4 h-4 mr-2 animate-spin" />Uploading...</> : <><Upload className="w-4 h-4 mr-2" />Submit Proof</>}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Earnings Summary ── */}
      <div className="grid gap-2 grid-cols-2 sm:gap-3 md:grid-cols-4">
        {[
          { label: 'Total Earned', value: `₹${earnings.totalEarnings.toFixed(2)}`, icon: Trophy, bg: 'from-blue-500 to-blue-700' },
          { label: 'Today', value: `₹${earnings.dailyEarnings.toFixed(2)}`, icon: Zap, bg: 'from-green-500 to-green-700' },
          { label: 'This Month', value: `₹${earnings.monthlyEarnings.toFixed(2)}`, icon: TrendingUp, bg: 'from-purple-500 to-purple-700' },
          { label: 'Tasks Done', value: `${earnings.tasksCompleted}`, icon: CheckCircle2, bg: 'from-orange-500 to-orange-700' },
        ].map((s, i) => (
          <Card key={i} className="border-0 shadow-md overflow-hidden rounded-2xl">
            <CardContent className="p-0">
              <div className={`bg-gradient-to-br ${s.bg} p-3 sm:p-4`}>
                <div className="w-8 h-8 sm:w-9 sm:h-9 bg-white/20 rounded-xl flex items-center justify-center mb-2 sm:mb-3">
                  <s.icon className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </div>
                <p className="text-white/70 text-xs font-medium mb-0.5 truncate">{s.label}</p>
                <p className="text-white text-lg sm:text-xl font-black truncate">{s.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ── UPI Section ── */}
      {userUpiId ? (
        <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-2xl p-4 sm:p-5">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 sm:w-11 sm:h-11 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div className="min-w-0">
                <p className="text-white/80 text-xs font-medium">Payout UPI ID</p>
                <p className="text-white font-bold text-sm mt-0.5 truncate">{userUpiId}</p>
                <p className="text-green-200 text-xs mt-0.5">Earnings sent here ✓</p>
              </div>
            </div>
            <Dialog open={upiDialogOpen} onOpenChange={setUpiDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" onClick={openUpiDialog} className="bg-white/20 hover:bg-white/30 text-white border-0 flex-shrink-0 rounded-xl text-xs px-3">
                  <Edit2 className="w-3 h-3 mr-1" /> Change
                </Button>
              </DialogTrigger>
              <DialogContent className="mx-4 sm:mx-auto rounded-2xl">
                <DialogHeader>
                  <DialogTitle>Update UPI ID</DialogTitle>
                  <DialogDescription>Change the UPI ID where your earnings are sent</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="bg-gray-50 rounded-xl p-3 flex items-center gap-2">
                    <p className="text-xs text-gray-500">Current:</p>
                    <p className="text-sm font-semibold text-gray-900 truncate">{userUpiId}</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="upi-update">New UPI ID</Label>
                    <Input id="upi-update" placeholder="yourname@paytm" value={upiId} onChange={e => setUpiId(e.target.value)} className="rounded-xl" />
                    <p className="text-xs text-gray-500">e.g. name@paytm, name@ybl, 9999999999@upi</p>
                  </div>
                  <Button onClick={handleSaveUpi} disabled={isSavingUpi} className="w-full bg-blue-600 hover:bg-blue-700 rounded-xl h-11">
                    {isSavingUpi ? "Saving..." : "Update UPI ID"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      ) : (
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-4 sm:p-5">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 sm:w-11 sm:h-11 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                <Wallet className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div>
                <p className="text-white font-semibold text-sm">Set up UPI to get paid</p>
                <p className="text-blue-200 text-xs mt-0.5">Paytm, GPay, or PhonePe</p>
              </div>
            </div>
            <Dialog open={upiDialogOpen} onOpenChange={setUpiDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="bg-white text-blue-600 hover:bg-blue-50 font-semibold flex-shrink-0 rounded-xl text-xs px-3">Add UPI</Button>
              </DialogTrigger>
              <DialogContent className="mx-4 sm:mx-auto rounded-2xl">
                <DialogHeader>
                  <DialogTitle>Enter Your UPI ID</DialogTitle>
                  <DialogDescription>Your earnings will be sent to this UPI ID after verification</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="upi-input">UPI ID</Label>
                    <Input id="upi-input" placeholder="yourname@paytm" value={upiId} onChange={e => setUpiId(e.target.value)} className="rounded-xl" />
                    <p className="text-xs text-gray-500">e.g. name@paytm, name@ybl, 9999999999@upi</p>
                  </div>
                  <Button onClick={handleSaveUpi} disabled={isSavingUpi} className="w-full bg-blue-600 hover:bg-blue-700 rounded-xl h-11">
                    {isSavingUpi ? "Saving..." : "Save UPI ID"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      )}

      {/* ── Tabs ── */}
      <Tabs defaultValue="available" className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <TabsList className="bg-gray-100 p-1 rounded-xl w-full sm:w-auto">
            <TabsTrigger value="available" className="flex-1 sm:flex-none data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm rounded-lg px-4 text-sm">
              Available
              <span className="ml-1.5 bg-blue-100 text-blue-600 text-xs px-1.5 py-0.5 rounded-full font-bold">{availableTasks.length}</span>
            </TabsTrigger>
            <TabsTrigger value="completed" className="flex-1 sm:flex-none data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm rounded-lg px-4 text-sm">
              Completed
              <span className="ml-1.5 bg-gray-200 text-gray-600 text-xs px-1.5 py-0.5 rounded-full font-bold">{completedCompletions.length}</span>
            </TabsTrigger>
          </TabsList>

          {categories.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-hide">
              {categories.map(cat => (
                <button key={cat} onClick={() => setSelectedCategory(cat)}
                  className={`flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${selectedCategory === cat ? 'bg-blue-600 text-white shadow-sm' : 'bg-gray-100 text-gray-600 hover:bg-gray-200 active:bg-gray-300'}`}>
                  {cat === 'all' ? '🎯 All' : `${getActionTypeIcon(cat)} ${cat}`}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ── Available Tab ── */}
        <TabsContent value="available" className="space-y-3 mt-0">
          {filteredTasks.length === 0 ? (
            <Card className="border-0 shadow-lg rounded-2xl overflow-hidden">
              <CardContent className="p-0">
                <div className="bg-gradient-to-r from-orange-500 to-pink-500 px-4 py-3 flex items-center gap-2">
                  <span className="relative flex h-2.5 w-2.5 flex-shrink-0">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-white" />
                  </span>
                  <p className="text-white text-xs font-bold">🔥 High demand — tasks fill up fast!</p>
                </div>
                <div className="p-6 text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-orange-100 to-pink-100 rounded-2xl flex items-center justify-center mx-auto mb-4 text-3xl">⏳</div>
                  <h3 className="text-lg font-black text-gray-900 mb-1">All slots grabbed!</h3>
                  <p className="text-gray-500 text-sm mb-5">Tasks get claimed within minutes.<br />The early bird gets the earnings. 🐦</p>
                  <div className="grid grid-cols-2 gap-3 mb-5">
                    <div className="bg-orange-50 border border-orange-100 rounded-xl p-3">
                      <p className="text-2xl font-black text-orange-600">⚡</p>
                      <p className="text-xs font-semibold text-gray-700 mt-1">Tasks go live</p>
                      <p className="text-xs text-gray-500">multiple times a day</p>
                    </div>
                    <div className="bg-pink-50 border border-pink-100 rounded-xl p-3">
                      <p className="text-2xl font-black text-pink-600">🎯</p>
                      <p className="text-xs font-semibold text-gray-700 mt-1">Limited slots</p>
                      <p className="text-xs text-gray-500">per task always</p>
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-xl px-4 py-3">
                    <p className="text-xs text-gray-500">💡 <span className="font-semibold text-gray-700">Pro tip:</span> Check morning & evening — that's when most tasks drop.</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-3 grid-cols-1 md:grid-cols-2">
              {filteredTasks.map(task => {
                const isFull = task.max_completions ? (task.completion_count || 0) >= Number(task.max_completions) : false
                const isRetryable = isTaskRetryable(task.id)
                const hasDetailPage = task.has_detail_page

                return (
                  <Card key={task.id} className="border border-gray-200 shadow-sm hover:shadow-lg active:shadow-sm transition-all duration-200 overflow-hidden rounded-2xl">
                    <CardContent className="p-4 sm:p-5">
                      <div className="flex items-start gap-3 mb-3">
                        {task.app_icon_url ? (
                          <img src={task.app_icon_url} alt={task.app_name || task.title} className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl object-cover border border-gray-200 shadow-sm flex-shrink-0" />
                        ) : (
                          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center flex-shrink-0 text-2xl shadow-sm">
                            {getActionTypeIcon(task.action_type || 'other')}
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-gray-900 text-sm leading-tight line-clamp-2">{task.title}</h3>
                          {task.app_name && <p className="text-xs text-gray-500 mt-0.5 truncate">{task.app_name}</p>}
                          <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                              {getActionTypeIcon(task.action_type || 'other')} {task.action_type}
                            </span>
                            {(task as any).requires_proof && (
                              <span className="text-xs bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full flex items-center gap-1">
                                <Camera className="w-2.5 h-2.5" /> Proof needed
                              </span>
                            )}
                            {hasDetailPage && (
                              <span className="text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full flex items-center gap-1">
                                <LayoutTemplate className="w-2.5 h-2.5" /> Guide
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0 ml-1">
                          <div className="flex items-center gap-0.5 justify-end">
                            <IndianRupee className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-600" />
                            <span className="text-xl sm:text-2xl font-black text-green-600">{Number(task.user_payout).toFixed(0)}</span>
                          </div>
                          <p className="text-xs text-gray-400">per task</p>
                        </div>
                      </div>

                      {task.description && (
                        <p className="text-xs text-gray-500 line-clamp-2 mb-2">{task.description}</p>
                      )}

                      <SlotsBar task={task} />

                      {isRetryable && (
                        <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-3 py-2 mt-3">
                          <span className="text-red-500 text-xs flex-shrink-0">❌</span>
                          <p className="text-xs text-red-600 font-medium">Previous attempt rejected — you can retry</p>
                        </div>
                      )}

                      {/* Guide hint when detail page is on */}
                      {hasDetailPage && !isFull && (
                        <div className="flex items-center gap-2 bg-blue-50 border border-blue-100 rounded-xl px-3 py-2 mt-3">
                          <LayoutTemplate className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
                          <p className="text-xs text-blue-600 font-medium">View step-by-step guide & copy prompts before starting</p>
                        </div>
                      )}

                      {isFull && !isRetryable ? (
                        <div className="w-full bg-gray-100 border border-gray-200 rounded-xl h-11 flex items-center justify-center gap-2 mt-3">
                          <span className="text-gray-400 text-sm font-semibold">🔒 All slots filled</span>
                        </div>
                      ) : (
                        <Button
                          onClick={() => handleCompleteTask(task)}
                          disabled={completingTaskId === task.id}
                          className="w-full bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-xl h-11 font-semibold mt-3 text-sm"
                        >
                          {completingTaskId === task.id
                            ? <><Clock className="w-4 h-4 mr-2 animate-spin" />Opening task...</>
                            : hasDetailPage
                            ? <><ChevronRight className="w-4 h-4 mr-1" />View Task Guide</>
                            : <><ExternalLink className="w-4 h-4 mr-2" />Start & Earn ₹{Number(task.user_payout).toFixed(0)}</>
                          }
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </TabsContent>

        {/* ── Completed Tab ── */}
        <TabsContent value="completed" className="space-y-3 mt-0">
          {completedCompletions.length === 0 ? (
            <Card className="border border-dashed border-gray-300 rounded-2xl">
              <CardContent className="py-14 text-center">
                <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Circle className="w-7 h-7 text-gray-400" />
                </div>
                <h3 className="text-base font-semibold text-gray-900 mb-1">No completed tasks yet</h3>
                <p className="text-gray-500 text-sm">Complete tasks to see them here</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {completedCompletions.map(c => {
                const needsProof = !c.completion_proof &&
                  c.status === 'pending_verification' &&
                  c.requires_proof === true
                return (
                  <Card key={c.id} className={`border shadow-sm rounded-2xl transition-all ${needsProof ? 'border-orange-200 bg-orange-50/40' : 'border-gray-200'}`}>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        {c.app_icon_url ? (
                          <img src={c.app_icon_url} alt={c.app_name || c.task_title} className="w-11 h-11 rounded-xl object-cover border border-gray-200 flex-shrink-0" />
                        ) : (
                          <div className="w-11 h-11 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0 text-lg">
                            {getActionTypeIcon(c.action_type || 'other')}
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900 text-sm truncate">{c.task_title || "Completed Task"}</h3>
                          {c.app_name && <p className="text-xs text-gray-500 truncate">{c.app_name}</p>}
                          {c.task_deleted && <p className="text-xs text-gray-400">Task no longer available</p>}
                          {needsProof && (
                            <button
                              onClick={() => setProofState({
                                completionId: c.id,
                                taskTitle: c.task_title || "Task",
                                payout: Number(c.user_payout),
                                instructions: c.proof_instructions || null
                              })}
                              className="mt-1.5 flex items-center gap-1 text-xs text-orange-600 hover:text-orange-700 font-semibold bg-orange-100 hover:bg-orange-200 active:bg-orange-300 px-2.5 py-1 rounded-lg transition-colors"
                            >
                              <Upload className="w-3 h-3" /> Upload proof to get paid
                            </button>
                          )}
                        </div>
                        <div className="text-right flex-shrink-0">
                          <div className="flex items-center gap-0.5 justify-end mb-1">
                            <IndianRupee className="w-3.5 h-3.5 text-green-600" />
                            <span className="text-base font-black text-green-600">{Number(c.user_payout).toFixed(0)}</span>
                          </div>
                          <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${getStatusColor(c.status)}`}>
                            {getStatusLabel(c.status)}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}