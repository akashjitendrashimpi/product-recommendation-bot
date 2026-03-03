"use client"

import { useState, useEffect, useRef } from "react"
import type { Task, TaskCompletion } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  CheckCircle2, Circle, ExternalLink, IndianRupee, TrendingUp,
  Calendar, Wallet, Clock, Target, Upload, Camera, X, AlertCircle
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

  // Proof upload state
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

    // Track click first, then open URL
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

        // Show proof upload dialog
        if (data.completion?.id) {
          setProofState({
            completionId: data.completion.id,
            taskTitle: task.title,
            payout: Number(task.user_payout)
          })
          setProofSuccess(false)
          setProofFile(null)
          setProofPreview(null)
        }
      }, 2000)
    } catch (error) {
      console.error("Error completing task:", error)
      alert("Failed to complete task. Please try again.")
      setCompletingTaskId(null)
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      alert('File too large. Max 5MB')
      return
    }
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
    } catch (error) {
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
      alert("UPI ID saved successfully!")
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
      case 'verified': return 'bg-green-100 text-green-700'
      case 'pending_verification': return 'bg-orange-100 text-orange-700'
      case 'rejected': return 'bg-red-100 text-red-700'
      default: return 'bg-blue-100 text-blue-700'
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

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-6 w-full">
        <div className="grid gap-4 md:grid-cols-4">
          {[1,2,3,4].map(i => <div key={i} className="h-24 bg-gray-200 rounded-lg" />)}
        </div>
        <div className="h-64 bg-gray-200 rounded-lg" />
      </div>
    )
  }

  return (
    <div className="space-y-6">

      {/* Proof Upload Dialog */}
      {proofState && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            {proofSuccess ? (
              <div className="text-center py-4">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Screenshot Uploaded!</h3>
                <p className="text-gray-500 mb-2">Your proof has been submitted for review.</p>
                <p className="text-sm text-blue-600 font-medium mb-6">Admin will verify within 24 hours. Earnings will be credited after verification.</p>
                <Button onClick={() => setProofState(null)} className="bg-blue-600 hover:bg-blue-700 w-full">Done</Button>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-gray-900">Upload Proof</h3>
                  <button onClick={() => setProofState(null)} className="text-gray-400 hover:text-gray-600">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="bg-blue-50 rounded-xl p-4 mb-4">
                  <p className="text-sm font-medium text-gray-900">{proofState.taskTitle}</p>
                  <p className="text-green-600 font-bold text-lg">₹{proofState.payout.toFixed(2)}</p>
                  <p className="text-xs text-gray-500 mt-1">Earnings credited after admin verification</p>
                </div>

                <div className="bg-orange-50 border border-orange-200 rounded-xl p-3 mb-4 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-orange-700">Take a screenshot showing you completed the task (e.g. app installed, review posted) and upload it here.</p>
                </div>

                {/* File Upload Area */}
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors mb-4 ${proofPreview ? 'border-blue-300 bg-blue-50' : 'border-gray-300 hover:border-blue-300 hover:bg-blue-50'}`}
                >
                  {proofPreview ? (
                    <div>
                      <img src={proofPreview} alt="Preview" className="max-h-40 mx-auto rounded-lg object-contain" />
                      <p className="text-xs text-blue-600 mt-2 font-medium">Click to change</p>
                    </div>
                  ) : (
                    <div>
                      <Camera className="w-10 h-10 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm font-medium text-gray-700">Click to upload screenshot</p>
                      <p className="text-xs text-gray-500 mt-1">PNG, JPG up to 5MB</p>
                    </div>
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileSelect}
                />

                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => setProofState(null)} className="flex-1">Cancel</Button>
                  <Button
                    onClick={handleUploadProof}
                    disabled={!proofFile || uploadingProof}
                    className="flex-1 bg-blue-600 hover:bg-blue-700"
                  >
                    {uploadingProof ? (
                      <><Clock className="w-4 h-4 mr-2 animate-spin" /> Uploading...</>
                    ) : (
                      <><Upload className="w-4 h-4 mr-2" /> Submit Proof</>
                    )}
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Earnings Summary */}
      <div className="grid gap-4 md:grid-cols-4">
        {[
          { label: 'Total Earnings', value: `₹${earnings.totalEarnings.toFixed(2)}`, icon: IndianRupee, color: 'blue' },
          { label: 'Today', value: `₹${earnings.dailyEarnings.toFixed(2)}`, icon: Calendar, color: 'green' },
          { label: 'This Month', value: `₹${earnings.monthlyEarnings.toFixed(2)}`, icon: TrendingUp, color: 'purple' },
          { label: 'Completed', value: earnings.tasksCompleted, icon: CheckCircle2, color: 'orange' },
        ].map((s, i) => (
          <Card key={i} className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-10 h-10 rounded-lg bg-${s.color}-100 flex items-center justify-center`}>
                  <s.icon className={`w-5 h-5 text-${s.color}-600`} />
                </div>
              </div>
              <p className="text-sm font-medium text-gray-600 mb-1">{s.label}</p>
              <p className="text-3xl font-bold text-gray-900">{s.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* UPI Setup */}
      <Card className="border-2 border-blue-100 bg-blue-50/50">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
              <Wallet className="w-5 h-5 text-blue-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 mb-1">Payment Setup Required</h3>
              <p className="text-sm text-gray-600 mb-4">Add your UPI ID to receive payments directly to your account</p>
              <Dialog open={upiDialogOpen} onOpenChange={setUpiDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                    <Wallet className="w-4 h-4 mr-2" /> Add UPI ID
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Enter Your UPI ID</DialogTitle>
                    <DialogDescription>Your earnings will be sent to this UPI ID</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="upi">UPI ID</Label>
                      <Input id="upi" placeholder="yourname@paytm" value={upiId} onChange={e => setUpiId(e.target.value)} />
                    </div>
                    <Button onClick={handleSaveUpi} disabled={isSavingUpi} className="w-full bg-blue-600 hover:bg-blue-700">
                      {isSavingUpi ? "Saving..." : "Save UPI ID"}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tasks */}
      <Tabs defaultValue="available" className="space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <TabsList className="bg-white border border-gray-200">
            <TabsTrigger value="available" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
              Available ({availableTasks.length})
            </TabsTrigger>
            <TabsTrigger value="completed" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
              Completed ({completedTasks.length})
            </TabsTrigger>
          </TabsList>
          {categories.length > 1 && (
            <div className="flex gap-2 flex-wrap">
              {categories.map(cat => (
                <Button key={cat} variant={selectedCategory === cat ? "default" : "outline"} size="sm"
                  onClick={() => setSelectedCategory(cat)} className={selectedCategory === cat ? "bg-blue-600" : ""}>
                  {cat === "all" ? "All" : cat}
                </Button>
              ))}
            </div>
          )}
        </div>

        <TabsContent value="available" className="space-y-4">
          {filteredTasks.length === 0 ? (
            <Card className="border border-gray-200">
              <CardContent className="py-12 text-center">
                <Target className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No tasks available</h3>
                <p className="text-gray-600">Check back later for new earning opportunities!</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {filteredTasks.map(task => (
                <Card key={task.id} className="border border-gray-200 shadow-sm hover:shadow-md transition-all">
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <CardTitle className="text-base font-semibold text-gray-900">{task.title}</CardTitle>
                        {task.app_name && <p className="text-sm text-gray-600 mt-1">{task.app_name}</p>}
                      </div>
                      {task.app_icon_url && (
                        <img src={task.app_icon_url} alt={task.app_name || task.title} className="w-14 h-14 rounded-lg object-cover border border-gray-200" />
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {task.description && <p className="text-sm text-gray-600 line-clamp-2">{task.description}</p>}
                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-2 flex items-center gap-2">
                      <Camera className="w-3 h-3 text-orange-500 flex-shrink-0" />
                      <p className="text-xs text-orange-700">Screenshot proof required after completion</p>
                    </div>
                    <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                      <div className="flex items-center gap-3">
                        <Badge variant="secondary">{task.action_type}</Badge>
                        <div className="flex items-center gap-1">
                          <IndianRupee className="w-4 h-4 text-green-600" />
                          <span className="text-lg font-bold text-green-600">{Number(task.user_payout).toFixed(2)}</span>
                        </div>
                      </div>
                      <Button onClick={() => handleCompleteTask(task)} disabled={completingTaskId === task.id} size="sm" className="bg-blue-600 hover:bg-blue-700">
                        {completingTaskId === task.id ? (
                          <><Clock className="w-4 h-4 mr-2 animate-spin" />Processing</>
                        ) : (
                          <><ExternalLink className="w-4 h-4 mr-2" />Start</>
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="completed" className="space-y-4">
          {completedTasks.length === 0 ? (
            <Card className="border border-gray-200">
              <CardContent className="py-12 text-center">
                <Circle className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No completed tasks yet</h3>
                <p className="text-gray-600">Start completing tasks to see them here</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {completedTasks.map(task => {
                const completion = getTaskCompletion(task.id)
                const needsProof = completion && !completion.completion_proof && completion.status !== 'verified'
                return (
                  <Card key={task.id} className="border border-gray-200 shadow-sm">
                    <CardContent className="p-5">
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                          {task.app_icon_url && (
                            <img src={task.app_icon_url} alt={task.app_name || task.title} className="w-12 h-12 rounded-lg object-cover border border-gray-200" />
                          )}
                          <div>
                            <h3 className="font-semibold text-gray-900">{task.title}</h3>
                            {task.app_name && <p className="text-sm text-gray-600">{task.app_name}</p>}
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <div className="flex items-center gap-1 justify-end mb-2">
                            <IndianRupee className="w-4 h-4 text-green-600" />
                            <span className="text-lg font-bold text-green-600">{Number(task.user_payout).toFixed(2)}</span>
                          </div>
                          <Badge className={getStatusColor(completion?.status || 'completed')}>
                            {getStatusLabel(completion?.status || 'completed')}
                          </Badge>
                          {needsProof && (
                            <button
                              onClick={() => setProofState({ completionId: completion!.id, taskTitle: task.title, payout: Number(task.user_payout) })}
                              className="mt-2 flex items-center gap-1 text-xs text-orange-600 hover:text-orange-700 font-medium"
                            >
                              <Upload className="w-3 h-3" /> Upload Proof
                            </button>
                          )}
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