"use client"

import { useState, useEffect } from "react"
import type { Task, TaskCompletion } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CheckCircle2, Circle, ExternalLink, IndianRupee, TrendingUp, Calendar, Wallet } from "lucide-react"
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
      
      // Ensure all earnings values are numbers
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

    // Open task URL in new window
    window.open(task.task_url, "_blank", "noopener,noreferrer")

    setCompletingTaskId(task.id)
    try {
      // Mark as completed after a delay (to allow user to complete the task)
      // In production, this would be verified by the CPA network callback
      setTimeout(async () => {
        const response = await fetch(`/api/tasks/${task.id}/complete`, {
          method: "POST",
        })

        const data = await response.json()

        if (!response.ok) {
          console.error("Failed to mark task as completed:", data.error)
          setCompletingTaskId(null)
          return
        }

        // Reload data
        await loadData()
        alert(`Task completed! You earned ₹${Number(task.user_payout).toFixed(2)}. Please complete the task in the opened window.`)
        setCompletingTaskId(null)
      }, 2000) // Give user 2 seconds to start the task
    } catch (error) {
      console.error("Error completing task:", error)
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
      window.location.reload()
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-muted-foreground">Loading tasks...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Earnings Summary */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
            <IndianRupee className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{earnings.totalEarnings.toFixed(2)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{earnings.dailyEarnings.toFixed(2)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{earnings.monthlyEarnings.toFixed(2)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tasks Done</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{earnings.tasksCompleted}</div>
          </CardContent>
        </Card>
      </div>

      {/* UPI Setup */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="w-5 h-5" />
            Payment Setup
          </CardTitle>
          <CardDescription>Add your UPI ID to receive daily payments</CardDescription>
        </CardHeader>
        <CardContent>
          <Dialog open={upiDialogOpen} onOpenChange={setUpiDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">Add/Update UPI ID</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Enter Your UPI ID</DialogTitle>
                <DialogDescription>Your earnings will be sent to this UPI ID daily</DialogDescription>
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
                <Button onClick={handleSaveUpi} disabled={isSavingUpi} className="w-full">
                  {isSavingUpi ? "Saving..." : "Save UPI ID"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>

      {/* Tasks Tabs */}
      <Tabs defaultValue="available" className="space-y-4">
        <TabsList>
          <TabsTrigger value="available">
            Available Tasks ({availableTasks.length})
          </TabsTrigger>
          <TabsTrigger value="completed">
            Completed ({completedTasks.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="available" className="space-y-4">
          {availableTasks.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                <CheckCircle2 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No available tasks at the moment. Check back later!</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {availableTasks.map((task) => (
                <Card key={task.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg">{task.title}</CardTitle>
                        {task.app_name && (
                          <CardDescription className="mt-1">{task.app_name}</CardDescription>
                        )}
                      </div>
                      {task.app_icon_url && (
                        <img
                          src={task.app_icon_url}
                          alt={task.app_name || task.title}
                          className="w-12 h-12 rounded-lg object-cover"
                        />
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {task.description && (
                      <p className="text-sm text-muted-foreground">{task.description}</p>
                    )}
                    <div className="flex items-center justify-between">
                      <div>
                        <Badge variant="secondary" className="mr-2">
                          {task.action_type}
                        </Badge>
                        <span className="text-lg font-bold text-green-600">
                          ₹{Number(task.user_payout).toFixed(2)}
                        </span>
                      </div>
                      <Button
                        onClick={() => handleCompleteTask(task)}
                        disabled={completingTaskId === task.id}
                        size="sm"
                      >
                        {completingTaskId === task.id ? (
                          "Processing..."
                        ) : (
                          <>
                            <ExternalLink className="w-4 h-4 mr-2" />
                            Start Task
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
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                <Circle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>You haven't completed any tasks yet.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {completedTasks.map((task) => {
                const completion = getTaskCompletion(task.id)
                return (
                  <Card key={task.id}>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          {task.app_icon_url && (
                            <img
                              src={task.app_icon_url}
                              alt={task.app_name || task.title}
                              className="w-12 h-12 rounded-lg object-cover"
                            />
                          )}
                          <div>
                            <h3 className="font-semibold">{task.title}</h3>
                            {task.app_name && (
                              <p className="text-sm text-muted-foreground">{task.app_name}</p>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center gap-2">
                            <CheckCircle2 className="w-5 h-5 text-green-600" />
                            <span className="font-bold text-green-600">
                              ₹{Number(task.user_payout).toFixed(2)}
                            </span>
                          </div>
                          <Badge
                            variant={
                              completion?.status === "verified"
                                ? "default"
                                : completion?.status === "completed"
                                  ? "secondary"
                                  : "outline"
                            }
                            className="mt-1"
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
