"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Plus, Search, Trash2, X } from "lucide-react"

interface Task {
  id: number
  title: string
  description: string | null
  task_url: string
  network_payout: number
  user_payout: number
  country_code: string
  is_active: boolean
  created_at: string
}

export function AdminTasks() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [showForm, setShowForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({
    title: '', description: '', task_url: '',
    network_payout: '', user_payout: '',
    country: 'IN', task_id: '',
    action_type: 'install'
  })

  useEffect(() => { fetchTasks() }, [])

  const fetchTasks = async () => {
    try {
      const res = await fetch('/api/admin/tasks')
      if (res.ok) {
        const data = await res.json()
        setTasks(data.tasks || [])
      }
    } catch (error) {
      console.error('Error fetching tasks:', error)
    } finally {
      setLoading(false)
    }
  }

  const createTask = async () => {
    if (!form.title || !form.task_url || !form.network_payout || !form.user_payout) {
      alert('Please fill in all required fields')
      return
    }
    setSubmitting(true)
    try {
      const res = await fetch('/api/admin/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          task_id: form.task_id || `manual_${Date.now()}`,
          network_payout: parseFloat(form.network_payout),
          user_payout: parseFloat(form.user_payout),
        })
      })
      if (res.ok) {
        setShowForm(false)
        setForm({ title: '', description: '', task_url: '', network_payout: '', user_payout: '', country: 'IN', task_id: '', action_type: 'install' })
        fetchTasks()
      }
    } catch (error) {
      console.error('Error creating task:', error)
    } finally {
      setSubmitting(false)
    }
  }

  const deleteTask = async (id: number) => {
    if (!confirm('Delete this task?')) return
    try {
      const res = await fetch(`/api/admin/tasks/${id}`, { method: 'DELETE' })
      if (res.ok) fetchTasks()
    } catch (error) {
      console.error('Error deleting task:', error)
    }
  }

  const filtered = tasks.filter(t =>
    t.title.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tasks</h1>
          <p className="text-gray-600 mt-1">{tasks.length} total tasks</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" /> Add Task
        </Button>
      </div>

      {/* Add Task Form */}
      {showForm && (
        <Card className="border border-blue-200 bg-blue-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">New Task</h2>
              <Button variant="ghost" size="icon" onClick={() => setShowForm(false)}><X className="w-4 h-4" /></Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Title *</Label>
                <Input value={form.title} onChange={e => setForm({...form, title: e.target.value})} placeholder="Task title" className="mt-1" />
              </div>
              <div>
                <Label>Task URL *</Label>
                <Input value={form.task_url} onChange={e => setForm({...form, task_url: e.target.value})} placeholder="https://..." className="mt-1" />
              </div>
              <div>
                <Label>Network Payout (₹) *</Label>
                <Input type="number" value={form.network_payout} onChange={e => setForm({...form, network_payout: e.target.value})} placeholder="0.00" className="mt-1" />
              </div>
              <div>
                <Label>User Payout (₹) *</Label>
                <Input type="number" value={form.user_payout} onChange={e => setForm({...form, user_payout: e.target.value})} placeholder="0.00" className="mt-1" />
              </div>
              <div>
                <Label>Action Type</Label>
                <select value={form.action_type} onChange={e => setForm({...form, action_type: e.target.value})} className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 text-sm">
                  <option value="install">App Install</option>
                  <option value="signup">Sign Up</option>
                  <option value="time_spent">Time Spent</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <Label>Country</Label>
                <Input value={form.country} onChange={e => setForm({...form, country: e.target.value})} placeholder="IN" className="mt-1" />
              </div>
              <div className="md:col-span-2">
                <Label>Description</Label>
                <Input value={form.description} onChange={e => setForm({...form, description: e.target.value})} placeholder="Task description" className="mt-1" />
              </div>
            </div>
            <Button onClick={createTask} disabled={submitting} className="mt-4 bg-blue-600 hover:bg-blue-700">
              {submitting ? 'Creating...' : 'Create Task'}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input placeholder="Search tasks..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10" />
      </div>

      {/* Tasks Table */}
      <Card className="border border-gray-200">
        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 text-center text-gray-500">Loading tasks...</div>
          ) : filtered.length === 0 ? (
            <div className="p-8 text-center text-gray-500">No tasks found. Add one above!</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Task</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Network Pay</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">User Pay</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Country</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filtered.map((task) => (
                    <tr key={task.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <p className="text-sm font-medium text-gray-900">{task.title}</p>
                        <p className="text-xs text-gray-500 truncate max-w-xs">{task.description}</p>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900 font-medium">₹{task.network_payout}</td>
                      <td className="px-4 py-3 text-sm text-green-600 font-medium">₹{task.user_payout}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{task.country_code}</td>
                      <td className="px-4 py-3">
                        <Badge className={task.is_active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}>
                          {task.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <Button variant="ghost" size="sm" onClick={() => deleteTask(task.id)} className="text-red-600 hover:bg-red-50">
                          <Trash2 className="w-4 h-4" />
                        </Button>
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