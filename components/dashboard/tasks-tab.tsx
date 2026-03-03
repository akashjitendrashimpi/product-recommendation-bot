"use client"

import { useState, useEffect, useRef } from "react"
import type { Task, TaskCompletion } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  CheckCircle2, Circle, ExternalLink, IndianRupee, TrendingUp,
  Calendar, Wallet, Clock, Target, Upload, Camera, X, AlertCircle,
  Zap, Trophy, Star
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

export function TasksTab({ userId }: TasksTabProps) {
  const [tasks, setTasks] = useState<Task[]>([])
  const [completions, setCompletions] = useState<TaskCompletion[]>([])
  const [earnings, setEarnings] = useState<EarningsSummary>({
    totalEarnings: 0, dailyEarnings: 0, monthlyEarnings: 0, tasksCompleted: 0,
  })
  const [isLoading, setIsLoading] = useState(true)
  const [completingTaskId, setCompletingTaskId] = useState<number | null>(null)
  const [upiDialogOpen, setUpiDialogOpen] = useState(false)
  const [upiId, setUpiId] = useState("")
  const [isSavingUpi, setIsSavingUpi] = useState(false)
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
      const [tasksRes, earningsRes] = await Promise.all([
        fetch("/api/tasks?country=IN"),
        fetch("/api/earnings"),
      ])
      const tasksData = await tasksRes.json()
      const earningsData = await earningsRes.json()
      setTasks(tasksData.tasks || [])
      setCompletions(earningsData.recentCompletions || [])
      const summary = earningsData.summary || earnings
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

  const handleCompleteTask = async (task: Task) => {
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

        // Only show proof dialog if task requires proof
        if (data.completion?.id && (task as any).requires_proof !== false) {
          setProofState({
            completionId: data.completion.id,
            taskTitle: task.title,
            payout: Number(task.user_payout),
            instructions: (task as any).proof_instructions || null
          })
          setProofSuccess(false)
          setProofFile(null)
          setProofPreview(null)
        } else if (data.completion?.id) {
          // No proof needed — show success toast
          alert(`Task completed! ₹${Number(task.user_payout).toFixed(2)} will be credited to your account.`)
        }
      }, 2000)
    } catch (error) {
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
        method: 'POST',
        body: formData
      })
      const data = await res.json()
      if (res.ok) {
        setProofSuccess(true)
        await loadData()
      } else {
        alert(data.error || 'Failed to upload proof')
      }
    } catch {
      alert('Failed to upload. Please try again.')
    } finally {
      setUploadingProof(false)
    }
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
      setUpiDialogOpen(false)
      setUpiId("")
    } catch (error) {
      alert(error instanceof Error ? error.message : "Failed to save UPI ID")
    } finally {
      setIsSavingUpi(false)
    }
  }

  const isTaskCompleted = (taskId: number) => completions.some(c => c.task_id === taskId && c.status !== "rejected")
  const getTaskCompletion = (taskId: number) => completions.find(c => c.task_id === taskId)

  const availableTasks = tasks.filter(t => !isTaskCompleted(t.id))
  const completedTasks = tasks.filter(t => isTaskCompleted(t.id))
  const categories = ["all", ...new Set(tasks.map(t => t.action_type || "Other"))]
  const filteredTasks = selectedCategory === "all" ? availableTasks : availableTasks.filter(t => t.action_type === selectedCategory)

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
      default: return '📋 Completed'
    }
  }

  const getActionTypeIcon = (type: string) => {
    switch (type) {
      case 'install': return '📱'
      case 'signup': return '✍️'
      case 'survey': return '📋'
      case 'review': return '⭐'
      case 'time_spent': return '⏱️'
      default: return '🎯'
    }
  }

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-6 w-full">
        <div className="grid gap-4 md:grid-cols-4">
          {[1,2,3,4].map(i => <div key={i} className="h-24 bg-gray-200 rounded-xl" />)}
        </div>
        <div className="h-64 bg-gray-200 rounded-xl" />
      </div>
    )
  }

  return (
    <div className="space-y-6">

      {/* Proof Upload Dialog */}
      {proofState && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
            {proofSuccess ? (
              <div className="p-8 text-center">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="w-10 h-10 text-green-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Proof Submitted!</h3>
                <p className="text-gray-500 mb-1">Your screenshot has been sent for review.</p>
                <div className="bg-green-50 border border-green-200 rounded-xl p-3 my-4">
                  <p className="text-green-700 font-semibold">₹{proofState.payout.toFixed(2)} pending verification</p>
                  <p className="text-green-600 text-sm">Admin will verify within 24 hours</p>
                </div>
                <Button onClick={() => setProofState(null)} className="bg-blue-600 hover:bg-blue-700 w-full">Done</Button>
              </div>
            ) : (
              <div className="p-6">
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">Upload Proof</h3>
                    <p className="text-xs text-gray-500">Required to receive payment</p>
                  </div>
                  <button onClick={() => setProofState(null)} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200">
                    <X className="w-4 h-4 text-gray-500" />
                  </button>
                </div>

                {/* Task Info */}
                <div className="bg-gradient-to-r from-blue-50 to-green-50 border border-blue-100 rounded-xl p-4 mb-4">
                  <p className="text-sm font-semibold text-gray-900 mb-1">{proofState.taskTitle}</p>
                  <div className="flex items-center gap-1">
                    <IndianRupee className="w-4 h-4 text-green-600" />
                    <span className="text-xl font-black text-green-600">{proofState.payout.toFixed(2)}</span>
                    <span className="text-xs text-gray-500 ml-1">after verification</span>
                  </div>
                </div>

                {/* Instructions */}
                {proofState.instructions && (
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 mb-4 flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                    <p className="text-xs text-blue-700">{proofState.instructions}</p>
                  </div>
                )}

                {!proofState.instructions && (
                  <div className="bg-orange-50 border border-orange-200 rounded-xl p-3 mb-4 flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" />
                    <p className="text-xs text-orange-700">Take a screenshot proving you completed the task and upload it below.</p>
                  </div>
                )}

                {/* Upload Area */}
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all mb-4 ${
                    proofPreview
                      ? 'border-blue-400 bg-blue-50'
                      : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50'
                  }`}
                >
                  {proofPreview ? (
                    <div>
                      <img src={proofPreview} alt="Preview" className="max-h-44 mx-auto rounded-lg object-contain shadow-sm" />
                      <p className="text-xs text-blue-600 mt-3 font-medium">✓ Screenshot selected — click to change</p>
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
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileSelect} />

                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => setProofState(null)} className="flex-1">Cancel</Button>
                  <Button
                    onClick={handleUploadProof}
                    disabled={!proofFile || uploadingProof}
                    className="flex-1 bg-blue-600 hover:bg-blue-700"
                  >
                    {uploadingProof
                      ? <><Clock className="w-4 h-4 mr-2 animate-spin" />Uploading...</>
                      : <><Upload className="w-4 h-4 mr-2" />Submit Proof</>
                    }
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Earnings Summary */}
      <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
        {[
          { label: 'Total Earned', value: `₹${earnings.totalEarnings.toFixed(2)}`, icon: Trophy, color: 'blue', bg: 'from-blue-500 to-blue-600' },
          { label: 'Today', value: `₹${earnings.dailyEarnings.toFixed(2)}`, icon: Zap, color: 'green', bg: 'from-green-500 to-green-600' },
          { label: 'This Month', value: `₹${earnings.monthlyEarnings.toFixed(2)}`, icon: TrendingUp, color: 'purple', bg: 'from-purple-500 to-purple-600' },
          { label: 'Completed', value: `${earnings.tasksCompleted}`, icon: CheckCircle2, color: 'orange', bg: 'from-orange-500 to-orange-600' },
        ].map((s, i) => (
          <Card key={i} className="border-0 shadow-md overflow-hidden">
            <CardContent className="p-0">
              <div className={`bg-gradient-to-br ${s.bg} p-4`}>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center">
                    <s.icon className="w-5 h-5 text-white" />
                  </div>
                </div>
                <p className="text-white/80 text-xs font-medium mb-1">{s.label}</p>
                <p className="text-white text-2xl font-black">{s.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* UPI Setup Banner */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-5 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
            <Wallet className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-white font-semibold text-sm">Set up UPI to receive payments</p>
            <p className="text-blue-200 text-xs">Add your Paytm, GPay, or PhonePe UPI ID</p>
          </div>
        </div>
        <Dialog open={upiDialogOpen} onOpenChange={setUpiDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="bg-white text-blue-600 hover:bg-blue-50 font-semibold flex-shrink-0">
              Add UPI
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Enter Your UPI ID</DialogTitle>
              <DialogDescription>Your earnings will be sent to this UPI ID after verification</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>UPI ID</Label>
                <Input placeholder="yourname@paytm" value={upiId} onChange={e => setUpiId(e.target.value)} />
                <p className="text-xs text-gray-500">e.g. name@paytm, name@ybl, 9999999999@upi</p>
              </div>
              <Button onClick={handleSaveUpi} disabled={isSavingUpi} className="w-full bg-blue-600 hover:bg-blue-700">
                {isSavingUpi ? "Saving..." : "Save UPI ID"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Tasks Section */}
      <Tabs defaultValue="available" className="space-y-5">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <TabsList className="bg-gray-100 p-1 rounded-xl">
            <TabsTrigger value="available" className="data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm rounded-lg px-4">
              Available <span className="ml-1.5 bg-blue-100 text-blue-600 text-xs px-1.5 py-0.5 rounded-full font-bold">{availableTasks.length}</span>
            </TabsTrigger>
            <TabsTrigger value="completed" className="data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm rounded-lg px-4">
              Completed <span className="ml-1.5 bg-gray-200 text-gray-600 text-xs px-1.5 py-0.5 rounded-full font-bold">{completedTasks.length}</span>
            </TabsTrigger>
          </TabsList>

          {/* Category Filter */}
          {categories.length > 1 && (
            <div className="flex gap-2 flex-wrap">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    selectedCategory === cat
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {cat === 'all' ? '🎯 All' : `${getActionTypeIcon(cat)} ${cat}`}
                </button>
              ))}
            </div>
          )}
        </div>

        <TabsContent value="available" className="space-y-4 mt-0">
          {filteredTasks.length === 0 ? (
            <Card className="border border-dashed border-gray-300">
              <CardContent className="py-16 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Target className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No tasks available</h3>
                <p className="text-gray-500 text-sm">Check back soon for new earning opportunities!</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {filteredTasks.map(task => (
                <Card key={task.id} className="border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-200 group overflow-hidden">
                  <CardContent className="p-0">
                    {/* Card Top */}
                    <div className="p-5">
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="flex items-start gap-3 flex-1">
                          {task.app_icon_url ? (
                            <img src={task.app_icon_url} alt={task.app_name || task.title}
                              className="w-14 h-14 rounded-2xl object-cover border border-gray-200 shadow-sm flex-shrink-0" />
                          ) : (
                            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center flex-shrink-0 text-2xl">
                              {getActionTypeIcon(task.action_type || 'other')}
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-gray-900 text-sm leading-tight">{task.title}</h3>
                            {task.app_name && <p className="text-xs text-gray-500 mt-0.5">{task.app_name}</p>}
                            <div className="flex items-center gap-2 mt-1.5">
                              <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                                {getActionTypeIcon(task.action_type || 'other')} {task.action_type}
                              </span>
                              {(task as any).requires_proof && (
                                <span className="text-xs bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full flex items-center gap-1">
                                  <Camera className="w-2.5 h-2.5" /> Proof needed
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <div className="flex items-center gap-0.5 justify-end">
                            <IndianRupee className="w-4 h-4 text-green-600" />
                            <span className="text-2xl font-black text-green-600">{Number(task.user_payout).toFixed(0)}</span>
                          </div>
                          <p className="text-xs text-gray-400">per task</p>
                        </div>
                      </div>

                      {task.description && (
                        <p className="text-xs text-gray-500 line-clamp-2 mb-3">{task.description}</p>
                      )}
                    </div>

                    {/* Card Bottom */}
                    <div className="px-5 pb-5">
                      <Button
                        onClick={() => handleCompleteTask(task)}
                        disabled={completingTaskId === task.id}
                        className="w-full bg-blue-600 hover:bg-blue-700 group-hover:bg-blue-700 rounded-xl h-11 font-semibold"
                      >
                        {completingTaskId === task.id ? (
                          <><Clock className="w-4 h-4 mr-2 animate-spin" />Opening task...</>
                        ) : (
                          <><ExternalLink className="w-4 h-4 mr-2" />Start & Earn ₹{Number(task.user_payout).toFixed(0)}</>
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="completed" className="space-y-3 mt-0">
          {completedTasks.length === 0 ? (
            <Card className="border border-dashed border-gray-300">
              <CardContent className="py-16 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Circle className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No completed tasks yet</h3>
                <p className="text-gray-500 text-sm">Complete tasks to see them here</p>
              </CardContent>
            </Card>
          ) : (
            completedTasks.map(task => {
              const completion = getTaskCompletion(task.id)
              const needsProof = completion && !completion.completion_proof &&
                completion.status !== 'verified' && (task as any).requires_proof !== false
              return (
                <Card key={task.id} className={`border shadow-sm transition-all ${needsProof ? 'border-orange-200 bg-orange-50/30' : 'border-gray-200'}`}>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      {task.app_icon_url ? (
                        <img src={task.app_icon_url} alt={task.app_name || task.title}
                          className="w-12 h-12 rounded-xl object-cover border border-gray-200 flex-shrink-0" />
                      ) : (
                        <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0 text-xl">
                          {getActionTypeIcon(task.action_type || 'other')}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 text-sm truncate">{task.title}</h3>
                        {task.app_name && <p className="text-xs text-gray-500">{task.app_name}</p>}
                        {needsProof && (
                          <button
                            onClick={() => setProofState({
                              completionId: completion!.id,
                              taskTitle: task.title,
                              payout: Number(task.user_payout),
                              instructions: (task as any).proof_instructions || null
                            })}
                            className="mt-1.5 flex items-center gap-1 text-xs text-orange-600 hover:text-orange-700 font-semibold bg-orange-100 px-2 py-1 rounded-lg"
                          >
                            <Upload className="w-3 h-3" /> Upload proof to get paid
                          </button>
                        )}
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className="flex items-center gap-0.5 justify-end mb-1.5">
                          <IndianRupee className="w-3.5 h-3.5 text-green-600" />
                          <span className="text-lg font-black text-green-600">{Number(task.user_payout).toFixed(0)}</span>
                        </div>
                        <span className={`text-xs font-medium px-2 py-1 rounded-full border ${getStatusColor(completion?.status || 'completed')}`}>
                          {getStatusLabel(completion?.status || 'completed')}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}