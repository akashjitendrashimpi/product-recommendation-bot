"use client"

import { useState, useEffect } from "react"
import type { Task, TaskCompletion } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  CheckCircle2, 
  Circle, 
  ExternalLink, 
  IndianRupee, 
  TrendingUp, 
  Calendar, 
  Wallet,
  Clock,
  Target,
  AlertCircle
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

export function TasksTab({ userId }: TasksTabProps) {
  const [tasks, setTasks] = useState<Task[]>([])
  const [completions, setCompletions] = useState<TaskCompletion[]>([])
  const [earnings, setEarnings] = useState<EarningsSummary>({
    totalEarnings: 0,
    dailyEarnings: 0,
    monthlyEarnings: 0,
    tasksCompleted: 0,
  })
  const [isLoading, setIsLoading] = useState(true)
  const [completingTaskId, setCompletingTaskId] = useState<number | null>(null)
  const [upiDialogOpen, setUpiDialogOpen] = useState(false)
  const [upiId, setUpiId] = useState("")
  const [isSavingUpi, setIsSavingUpi] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<string>("all")

  useEffect(() => {
    loadData()
  }, [])

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
        const response = await fetch(`/api/tasks/${task.id}/complete`, {
          method: "POST",
        })

        const data = await response.json()

        if (!response.ok) {
          console.error("Failed to mark task as completed:", data.error)
          alert(data.error || "Failed to complete task")
          setCompletingTaskId(null)
          return
        }

        await loadData()
        alert(`Task completed! You earned ₹${Number(task.user_payout).toFixed(2)}`)
        setCompletingTaskId(null)
      }, 2000)
    } catch (error) {
      console.error("Error completing task:", error)
      alert("Failed to complete task. Please try again.")
      setCompletingTaskId(null)
    }
  }

  const handleSaveUpi = async () => {
    if (!upiId.trim()) {
      alert("Please enter a valid UPI ID")
      return
    }

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
      console.error("Error saving UPI:", error)
      alert(error instanceof Error ? error.message : "Failed to save UPI ID")
    } finally {
      setIsSavingUpi(false)
    }
  }

  const isTaskCompleted = (taskId: number) => {
    return completions.some((c) => c.task_id === taskId && c.status !== "rejected")
  }

  const getTaskCompletion = (taskId: number) => {
    return completions.find((c) => c.task_id === taskId)
  }

  const availableTasks = tasks.filter((t) => !isTaskCompleted(t.id))
  const completedTasks = tasks.filter((t) => isTaskCompleted(t.id))

  // Get unique categories
  const categories = ["all", ...new Set(tasks.map(t => t.action_type || "Other"))]

  // Filter tasks by category
  const filteredTasks = selectedCategory === "all" 
    ? availableTasks 
    : availableTasks.filter(t => t.action_type === selectedCategory)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-pulse space-y-6 w-full">
          <div className="grid gap-4 md:grid-cols-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-24 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
          <div className="h-64 bg-gray-200 rounded-lg"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Earnings Summary - Professional Design */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <IndianRupee className="w-5 h-5 text-blue-600" />
              </div>
              <TrendingUp className="w-4 h-4 text-green-600" />
            </div>
            <p className="text-sm font-medium text-gray-600 mb-1">Total Earnings</p>
            <p className="text-3xl font-bold text-gray-900">₹{earnings.totalEarnings.toFixed(2)}</p>
          </CardContent>
        </Card>

        <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-green-600" />
              </div>
            </div>
            <p className="text-sm font-medium text-gray-600 mb-1">Today</p>
            <p className="text-3xl font-bold text-gray-900">₹{earnings.dailyEarnings.toFixed(2)}</p>
          </CardContent>
        </Card>

        <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-purple-600" />
              </div>
            </div>
            <p className="text-sm font-medium text-gray-600 mb-1">This Month</p>
            <p className="text-3xl font-bold text-gray-900">₹{earnings.monthlyEarnings.toFixed(2)}</p>
          </CardContent>
        </Card>

        <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-orange-600" />
              </div>
            </div>
            <p className="text-sm font-medium text-gray-600 mb-1">Completed</p>
            <p className="text-3xl font-bold text-gray-900">{earnings.tasksCompleted}</p>
          </CardContent>
        </Card>
      </div>

      {/* UPI Setup Alert */}
      <Card className="border-2 border-blue-100 bg-blue-50/50">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
              <Wallet className="w-5 h-5 text-blue-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 mb-1">Payment Setup Required</h3>
              <p className="text-sm text-gray-600 mb-4">
                Add your UPI ID to receive daily payments directly to your account
              </p>
              <Dialog open={upiDialogOpen} onOpenChange={setUpiDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                    <Wallet className="w-4 h-4 mr-2" />
                    Add UPI ID
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Enter Your UPI ID</DialogTitle>
                    <DialogDescription>
                      Your earnings will be sent to this UPI ID daily
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="upi">UPI ID</Label>
                      <Input
                        id="upi"
                        placeholder="yourname@paytm or yourname@upi"
                        value={upiId}
                        onChange={(e) => setUpiId(e.target.value)}
                      />
                    </div>
                    <Button 
                      onClick={handleSaveUpi} 
                      disabled={isSavingUpi} 
                      className="w-full bg-blue-600 hover:bg-blue-700"
                    >
                      {isSavingUpi ? "Saving..." : "Save UPI ID"}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tasks Section */}
      <Tabs defaultValue="available" className="space-y-6">
        <div className="flex items-center justify-between">
          <TabsList className="bg-white border border-gray-200">
            <TabsTrigger value="available" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
              Available ({availableTasks.length})
            </TabsTrigger>
            <TabsTrigger value="completed" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
              Completed ({completedTasks.length})
            </TabsTrigger>
          </TabsList>

          {/* Category Filter */}
          {categories.length > 1 && (
            <div className="flex gap-2">
              {categories.map(cat => (
                <Button
                  key={cat}
                  variant={selectedCategory === cat ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(cat)}
                  className={selectedCategory === cat ? "bg-blue-600" : ""}
                >
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
              {filteredTasks.map((task) => (
                <Card key={task.id} className="border border-gray-200 shadow-sm hover:shadow-md transition-all">
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <CardTitle className="text-base font-semibold text-gray-900">
                          {task.title}
                        </CardTitle>
                        {task.app_name && (
                          <p className="text-sm text-gray-600 mt-1">{task.app_name}</p>
                        )}
                      </div>
                      {task.app_icon_url && (
                        <img
                          src={task.app_icon_url}
                          alt={task.app_name || task.title}
                          className="w-14 h-14 rounded-lg object-cover border border-gray-200"
                        />
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {task.description && (
                      <p className="text-sm text-gray-600 line-clamp-2">{task.description}</p>
                    )}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      <div className="flex items-center gap-3">
                        <Badge variant="secondary" className="font-medium">
                          {task.action_type}
                        </Badge>
                        <div className="flex items-center gap-1">
                          <IndianRupee className="w-4 h-4 text-green-600" />
                          <span className="text-lg font-bold text-green-600">
                            {Number(task.user_payout).toFixed(2)}
                          </span>
                        </div>
                      </div>
                      <Button
                        onClick={() => handleCompleteTask(task)}
                        disabled={completingTaskId === task.id}
                        size="sm"
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        {completingTaskId === task.id ? (
                          <>
                            <Clock className="w-4 h-4 mr-2 animate-spin" />
                            Processing
                          </>
                        ) : (
                          <>
                            <ExternalLink className="w-4 h-4 mr-2" />
                            Start
                          </>
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
              {completedTasks.map((task) => {
                const completion = getTaskCompletion(task.id)
                return (
                  <Card key={task.id} className="border border-gray-200 shadow-sm">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          {task.app_icon_url && (
                            <img
                              src={task.app_icon_url}
                              alt={task.app_name || task.title}
                              className="w-12 h-12 rounded-lg object-cover border border-gray-200"
                            />
                          )}
                          <div>
                            <h3 className="font-semibold text-gray-900">{task.title}</h3>
                            {task.app_name && (
                              <p className="text-sm text-gray-600">{task.app_name}</p>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center gap-2 mb-2">
                            <CheckCircle2 className="w-5 h-5 text-green-600" />
                            <span className="text-lg font-bold text-green-600">
                              ₹{Number(task.user_payout).toFixed(2)}
                            </span>
                          </div>
                          <Badge
                            variant={completion?.status === "verified" ? "default" : "secondary"}
                            className={completion?.status === "verified" ? "bg-green-600" : ""}
                          >
                            {completion?.status || "completed"}
                          </Badge>
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