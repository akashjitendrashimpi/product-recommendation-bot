"use client"

import type React from "react"
import { useState, useEffect } from "react"
import type { Task } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Plus, Trash2, Edit, CheckSquare, X } from "lucide-react"

interface AdminTasksTabProps {
  tasks: Task[]
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>
}

export function AdminTasksTab({ tasks, setTasks }: AdminTasksTabProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [formData, setFormData] = useState({
    task_id: "",
    title: "",
    description: "",
    action_type: "install" as "install" | "signup" | "time_spent" | "other",
    app_name: "",
    app_icon_url: "",
    task_url: "",
    network_payout: "",
    user_payout: "",
    currency: "INR",
    country: "IN",
    requirements: "",
    expires_at: "",
    is_active: true,
  })

  useEffect(() => {
    loadTasks()
  }, [])

  const loadTasks = async () => {
    try {
      const response = await fetch("/api/admin/tasks")
      if (response.ok) {
        const data = await response.json()
        setTasks(data.tasks || [])
      }
    } catch (error) {
      console.error("Error loading tasks:", error)
    }
  }

  const resetForm = () => {
    setFormData({
      task_id: "",
      title: "",
      description: "",
      action_type: "install",
      app_name: "",
      app_icon_url: "",
      task_url: "",
      network_payout: "",
      user_payout: "",
      currency: "INR",
      country: "IN",
      requirements: "",
      expires_at: "",
      is_active: true,
    })
    setEditingTask(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const url = editingTask ? `/api/admin/tasks/${editingTask.id}` : "/api/admin/tasks"
      const method = editingTask ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          network_payout: parseFloat(formData.network_payout),
          user_payout: parseFloat(formData.user_payout),
          expires_at: formData.expires_at || null,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to save task")
      }

      const { task } = await response.json()

      if (editingTask) {
        setTasks((prev) => prev.map((t) => (t.id === editingTask.id ? task : t)))
      } else {
        setTasks((prev) => [task, ...prev])
      }

      setIsDialogOpen(false)
      resetForm()
    } catch (error) {
      console.error("Error saving task:", error)
      alert(error instanceof Error ? error.message : "Error saving task")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this task?")) return

    try {
      const response = await fetch(`/api/admin/tasks/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to delete task")
      }

      setTasks((prev) => prev.filter((t) => t.id !== id))
    } catch (error) {
      console.error("Error deleting task:", error)
      alert(error instanceof Error ? error.message : "Error deleting task")
    }
  }

  const handleEdit = (task: Task) => {
    setEditingTask(task)
    setFormData({
      task_id: task.task_id,
      title: task.title,
      description: task.description || "",
      action_type: task.action_type,
      app_name: task.app_name || "",
      app_icon_url: task.app_icon_url || "",
      task_url: task.task_url,
      network_payout: task.network_payout.toString(),
      user_payout: task.user_payout.toString(),
      currency: task.currency,
      country: task.country,
      requirements: task.requirements || "",
      expires_at: task.expires_at ? task.expires_at.split("T")[0] : "",
      is_active: task.is_active,
    })
    setIsDialogOpen(true)
  }

  const toggleActive = async (task: Task) => {
    try {
      const response = await fetch(`/api/admin/tasks/${task.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_active: !task.is_active }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to update task")
      }

      const { task: updated } = await response.json()
      setTasks((prev) => prev.map((t) => (t.id === task.id ? updated : t)))
    } catch (error) {
      console.error("Error updating task:", error)
      alert(error instanceof Error ? error.message : "Error updating task")
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Tasks Management</h2>
          <p className="text-muted-foreground">Manage CPA/CPI tasks and offers</p>
        </div>
        <Dialog
          open={isDialogOpen}
          onOpenChange={(open) => {
            setIsDialogOpen(open)
            if (!open) resetForm()
          }}
        >
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Task
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingTask ? "Edit Task" : "Create New Task"}</DialogTitle>
              <DialogDescription>
                {editingTask ? "Update task details" : "Add a new task for users to complete"}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="task_id">Task ID *</Label>
                  <Input
                    id="task_id"
                    required
                    value={formData.task_id}
                    onChange={(e) => setFormData({ ...formData, task_id: e.target.value })}
                    placeholder="TASK001"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="action_type">Action Type *</Label>
                  <Select
                    value={formData.action_type}
                    onValueChange={(value: any) => setFormData({ ...formData, action_type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="install">Install</SelectItem>
                      <SelectItem value="signup">Signup</SelectItem>
                      <SelectItem value="time_spent">Time Spent</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Install XYZ App"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Task description..."
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="app_name">App Name</Label>
                  <Input
                    id="app_name"
                    value={formData.app_name}
                    onChange={(e) => setFormData({ ...formData, app_name: e.target.value })}
                    placeholder="XYZ App"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="app_icon_url">App Icon URL</Label>
                  <Input
                    id="app_icon_url"
                    type="url"
                    value={formData.app_icon_url}
                    onChange={(e) => setFormData({ ...formData, app_icon_url: e.target.value })}
                    placeholder="https://..."
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="task_url">Task URL *</Label>
                <Input
                  id="task_url"
                  type="url"
                  required
                  value={formData.task_url}
                  onChange={(e) => setFormData({ ...formData, task_url: e.target.value })}
                  placeholder="https://..."
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="network_payout">Network Payout (₹) *</Label>
                  <Input
                    id="network_payout"
                    type="number"
                    step="0.01"
                    required
                    value={formData.network_payout}
                    onChange={(e) => setFormData({ ...formData, network_payout: e.target.value })}
                    placeholder="10.00"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="user_payout">User Payout (₹) *</Label>
                  <Input
                    id="user_payout"
                    type="number"
                    step="0.01"
                    required
                    value={formData.user_payout}
                    onChange={(e) => setFormData({ ...formData, user_payout: e.target.value })}
                    placeholder="8.00"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="currency">Currency</Label>
                  <Input
                    id="currency"
                    value={formData.currency}
                    onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                    placeholder="INR"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="country">Country</Label>
                  <Input
                    id="country"
                    value={formData.country}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                    placeholder="IN"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="expires_at">Expires At</Label>
                  <Input
                    id="expires_at"
                    type="datetime-local"
                    value={formData.expires_at}
                    onChange={(e) => setFormData({ ...formData, expires_at: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="requirements">Requirements</Label>
                <Textarea
                  id="requirements"
                  value={formData.requirements}
                  onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
                  placeholder="Special requirements..."
                  rows={2}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                />
                <Label htmlFor="is_active">Active</Label>
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Saving..." : editingTask ? "Update Task" : "Create Task"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="p-0">
          {tasks.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <CheckSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No tasks created yet. Add your first task to get started.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Task</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Network Payout</TableHead>
                  <TableHead>User Payout</TableHead>
                  <TableHead>Profit</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-32">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tasks.map((task) => {
                  const profit = Number(task.network_payout) - Number(task.user_payout)
                  return (
                    <TableRow key={task.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          {task.app_icon_url && (
                            <img
                              src={task.app_icon_url}
                              alt={task.app_name || task.title}
                              className="w-10 h-10 rounded-lg object-cover"
                            />
                          )}
                          <div>
                            <div className="font-medium">{task.title}</div>
                            {task.app_name && (
                              <div className="text-sm text-muted-foreground">{task.app_name}</div>
                            )}
                            <div className="text-xs text-muted-foreground font-mono">{task.task_id}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{task.action_type}</Badge>
                      </TableCell>
                      <TableCell className="font-medium">₹{Number(task.network_payout).toFixed(2)}</TableCell>
                      <TableCell className="font-medium text-green-600">₹{Number(task.user_payout).toFixed(2)}</TableCell>
                      <TableCell className="font-medium text-blue-600">₹{Number(profit).toFixed(2)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Switch checked={task.is_active} onCheckedChange={() => toggleActive(task)} />
                          <Badge variant={task.is_active ? "default" : "secondary"}>
                            {task.is_active ? "Active" : "Inactive"}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" onClick={() => handleEdit(task)}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(task.id)}>
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
