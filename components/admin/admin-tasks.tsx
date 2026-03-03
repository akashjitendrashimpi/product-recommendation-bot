"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Plus, Search, Trash2, X, BarChart3, Users, IndianRupee,
  CheckCircle2, ExternalLink, Eye, TrendingUp, Clock, Target
} from "lucide-react"

interface Task {
  id: number
  title: string
  description: string | null
  task_url: string
  app_name: string | null
  app_icon_url: string | null
  action_type: string
  network_payout: number
  user_payout: number
  country_code: string
  is_active: boolean
  created_at: string
  completion_count?: number
  total_paid?: number
}

interface TaskCompletion {
  id: number
  task_id: number
  user_id: number
  status: string
  user_payout: number
  created_at: string
  user_email?: string
}

interface Stats {
  totalTasks: number
  activeTasks: number
  totalCompletions: number
  totalPaidOut: number
}

export function AdminTasks() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [completions, setCompletions] = useState<TaskCompletion[]>([])
  const [stats, setStats] = useState<Stats>({ totalTasks: 0, activeTasks: 0, totalCompletions: 0, totalPaidOut: 0 })
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [showForm, setShowForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [activeTab, setActiveTab] = useState<'tasks' | 'analytics'>('tasks')
  const [form, setForm] = useState({
    title: '', description: '', task_url: '', app_name: '', app_icon_url: '',
    network_payout: '', user_payout: '', country: 'IN', task_id: '', action_type: 'install'
  })

  useEffect(() => { fetchAll() }, [])

  const fetchAll = async () => {
    try {
      const [tasksRes, completionsRes] = await Promise.all([
        fetch('/api/admin/tasks'),
        fetch('/api/admin/task-completions')
      ])
      if (tasksRes.ok) {
        const data = await tasksRes.json()
        const taskList = data.tasks || []

        // Enrich tasks with completion counts
        const completionData = completionsRes.ok ? (await completionsRes.json()).completions || [] : []
        setCompletions(completionData)

        const enriched = taskList.map((t: Task) => {
          const tc = completionData.filter((c: TaskCompletion) => c.task_id === t.id)
          return {
            ...t,
            completion_count: tc.length,
            total_paid: tc.reduce((s: number, c: TaskCompletion) => s + Number(c.user_payout || 0), 0)
          }
        })
        setTasks(enriched)

        setStats({
          totalTasks: enriched.length,
          activeTasks: enriched.filter((t: Task) => t.is_active).length,
          totalCompletions: completionData.length,
          totalPaidOut: completionData.reduce((s: number, c: TaskCompletion) => s + Number(c.user_payout || 0), 0)
        })
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
    // Ensure URL has https://
    let url = form.task_url
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url
    }
    setSubmitting(true)
    try {
      const res = await fetch('/api/admin/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          task_url: url,
          task_id: form.task_id || `manual_${Date.now()}`,
          network_payout: parseFloat(form.network_payout),
          user_payout: parseFloat(form.user_payout),
        })
      })
      if (res.ok) {
        setShowForm(false)
        setForm({ title: '', description: '', task_url: '', app_name: '', app_icon_url: '', network_payout: '', user_payout: '', country: 'IN', task_id: '', action_type: 'install' })
        fetchAll()
      } else {
        const data = await res.json()
        alert(data.error || 'Failed to create task')
      }
    } catch (error) {
      console.error('Error creating task:', error)
    } finally {
      setSubmitting(false)
    }
  }

  const deleteTask = async (id: number) => {
    if (!confirm('Delete this task? All completion records will remain.')) return
    try {
      const res = await fetch(`/api/admin/tasks/${id}`, { method: 'DELETE' })
      if (res.ok) fetchAll()
    } catch (error) {
      console.error('Error deleting task:', error)
    }
  }

  const toggleTask = async (id: number, isActive: boolean) => {
    try {
      await fetch(`/api/admin/tasks/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: !isActive })
      })
      fetchAll()
    } catch (error) {
      console.error('Error toggling task:', error)
    }
  }

  const filtered = tasks.filter(t =>
    t.title.toLowerCase().includes(search.toLowerCase()) ||
    (t.app_name || '').toLowerCase().includes(search.toLowerCase())
  )

  const taskCompletions = selectedTask
    ? completions.filter(c => c.task_id === selectedTask.id)
    : []

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tasks</h1>
          <p className="text-gray-600 mt-1">Manage earning tasks and view analytics</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" /> Add Task
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <Target className="w-4 h-4 text-blue-600" />
              <p className="text-xs text-blue-600 font-medium">Total Tasks</p>
            </div>
            <p className="text-2xl font-bold text-blue-700">{stats.totalTasks}</p>
            <p className="text-xs text-blue-500">{stats.activeTasks} active</p>
          </CardContent>
        </Card>
        <Card className="border border-green-200 bg-green-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle2 className="w-4 h-4 text-green-600" />
              <p className="text-xs text-green-600 font-medium">Completions</p>
            </div>
            <p className="text-2xl font-bold text-green-700">{stats.totalCompletions}</p>
            <p className="text-xs text-green-500">all time</p>
          </CardContent>
        </Card>
        <Card className="border border-purple-200 bg-purple-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <IndianRupee className="w-4 h-4 text-purple-600" />
              <p className="text-xs text-purple-600 font-medium">Paid to Users</p>
            </div>
            <p className="text-2xl font-bold text-purple-700">₹{stats.totalPaidOut.toFixed(0)}</p>
            <p className="text-xs text-purple-500">total payouts</p>
          </CardContent>
        </Card>
        <Card className="border border-orange-200 bg-orange-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="w-4 h-4 text-orange-600" />
              <p className="text-xs text-orange-600 font-medium">Avg per Task</p>
            </div>
            <p className="text-2xl font-bold text-orange-700">
              {stats.totalTasks > 0 ? (stats.totalCompletions / stats.totalTasks).toFixed(1) : 0}
            </p>
            <p className="text-xs text-orange-500">completions/task</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-gray-100 rounded-xl w-fit">
        <button
          onClick={() => setActiveTab('tasks')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'tasks' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500'}`}
        >
          <Target className="w-4 h-4 inline mr-1" /> Tasks
        </button>
        <button
          onClick={() => setActiveTab('analytics')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'analytics' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500'}`}
        >
          <BarChart3 className="w-4 h-4 inline mr-1" /> Analytics
        </button>
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
                <Input value={form.title} onChange={e => setForm({...form, title: e.target.value})} placeholder="e.g. Install Spotify" className="mt-1" />
              </div>
              <div>
                <Label>Task URL * <span className="text-xs text-gray-400">(must start with https://)</span></Label>
                <Input value={form.task_url} onChange={e => setForm({...form, task_url: e.target.value})} placeholder="https://play.google.com/..." className="mt-1" />
              </div>
              <div>
                <Label>App Name</Label>
                <Input value={form.app_name} onChange={e => setForm({...form, app_name: e.target.value})} placeholder="Spotify" className="mt-1" />
              </div>
              <div>
                <Label>App Icon URL</Label>
                <Input value={form.app_icon_url} onChange={e => setForm({...form, app_icon_url: e.target.value})} placeholder="https://..." className="mt-1" />
              </div>
              <div>
                <Label>Network Payout (₹) * <span className="text-xs text-gray-400">what you earn</span></Label>
                <Input type="number" value={form.network_payout} onChange={e => setForm({...form, network_payout: e.target.value})} placeholder="0.00" className="mt-1" />
              </div>
              <div>
                <Label>User Payout (₹) * <span className="text-xs text-gray-400">what user earns</span></Label>
                <Input type="number" value={form.user_payout} onChange={e => setForm({...form, user_payout: e.target.value})} placeholder="0.00" className="mt-1" />
              </div>
              <div>
                <Label>Action Type</Label>
                <select value={form.action_type} onChange={e => setForm({...form, action_type: e.target.value})} className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 text-sm bg-white">
                  <option value="install">App Install</option>
                  <option value="signup">Sign Up</option>
                  <option value="survey">Survey</option>
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
                <Input value={form.description} onChange={e => setForm({...form, description: e.target.value})} placeholder="e.g. Install and open the app to earn" className="mt-1" />
              </div>
            </div>
            <div className="flex gap-3 mt-4">
              <Button onClick={createTask} disabled={submitting} className="bg-blue-600 hover:bg-blue-700">
                {submitting ? 'Creating...' : 'Create Task'}
              </Button>
              <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === 'tasks' && (
        <>
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
                        <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Payouts</th>
                        <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Completions</th>
                        <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Status</th>
                        <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {filtered.map((task) => (
                        <tr key={task.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              {task.app_icon_url && (
                                <img src={task.app_icon_url} alt={task.app_name || ''} className="w-10 h-10 rounded-lg object-cover border border-gray-200" />
                              )}
                              <div>
                                <p className="text-sm font-medium text-gray-900">{task.title}</p>
                                <p className="text-xs text-gray-500">{task.app_name || task.action_type}</p>
                                <a href={task.task_url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-500 hover:underline flex items-center gap-1">
                                  <ExternalLink className="w-3 h-3" /> View Link
                                </a>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <p className="text-xs text-gray-500">Network: <span className="font-medium text-gray-900">₹{task.network_payout}</span></p>
                            <p className="text-xs text-gray-500">User: <span className="font-medium text-green-600">₹{task.user_payout}</span></p>
                            <p className="text-xs text-gray-500">Margin: <span className="font-medium text-blue-600">₹{(Number(task.network_payout) - Number(task.user_payout)).toFixed(2)}</span></p>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <div className="text-center">
                                <p className="text-lg font-bold text-gray-900">{task.completion_count || 0}</p>
                                <p className="text-xs text-gray-500">completions</p>
                              </div>
                              <button
                                onClick={() => setSelectedTask(selectedTask?.id === task.id ? null : task)}
                                className="text-xs text-blue-600 hover:text-blue-700 underline"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <button onClick={() => toggleTask(task.id, task.is_active)}>
                              <Badge className={`cursor-pointer ${task.is_active ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                                {task.is_active ? 'Active' : 'Inactive'}
                              </Badge>
                            </button>
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

          {/* Task Completions Detail */}
          {selectedTask && (
            <Card className="border border-blue-200 bg-blue-50">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">
                    Completions for: {selectedTask.title}
                  </CardTitle>
                  <Button variant="ghost" size="icon" onClick={() => setSelectedTask(null)}>
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {taskCompletions.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-4">No completions yet</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-white/60">
                        <tr>
                          <th className="text-left px-3 py-2 text-xs font-medium text-gray-500">User</th>
                          <th className="text-left px-3 py-2 text-xs font-medium text-gray-500">Status</th>
                          <th className="text-left px-3 py-2 text-xs font-medium text-gray-500">Earned</th>
                          <th className="text-left px-3 py-2 text-xs font-medium text-gray-500">Date</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-blue-100">
                        {taskCompletions.map((c) => (
                          <tr key={c.id} className="bg-white/40">
                            <td className="px-3 py-2">{c.user_email || `User #${c.user_id}`}</td>
                            <td className="px-3 py-2">
                              <Badge className={c.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}>
                                {c.status}
                              </Badge>
                            </td>
                            <td className="px-3 py-2 font-medium text-green-600">₹{Number(c.user_payout).toFixed(2)}</td>
                            <td className="px-3 py-2 text-gray-500">{new Date(c.created_at).toLocaleDateString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </>
      )}

      {activeTab === 'analytics' && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Task Performance</h2>
          {tasks.length === 0 ? (
            <Card className="border border-gray-200">
              <CardContent className="p-8 text-center text-gray-500">No tasks yet</CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {[...tasks].sort((a, b) => (b.completion_count || 0) - (a.completion_count || 0)).map((task) => (
                <Card key={task.id} className="border border-gray-200 bg-white">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        {task.app_icon_url && (
                          <img src={task.app_icon_url} alt="" className="w-8 h-8 rounded-lg" />
                        )}
                        <div>
                          <p className="font-medium text-gray-900 text-sm">{task.title}</p>
                          <p className="text-xs text-gray-500">{task.action_type}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-gray-900">{task.completion_count || 0}</p>
                        <p className="text-xs text-gray-500">completions</p>
                      </div>
                    </div>
                    {/* Progress bar */}
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all"
                        style={{ width: `${stats.totalCompletions > 0 ? ((task.completion_count || 0) / stats.totalCompletions) * 100 : 0}%` }}
                      />
                    </div>
                    <div className="flex justify-between mt-2 text-xs text-gray-500">
                      <span>₹{task.user_payout} per user</span>
                      <span>₹{(task.total_paid || 0).toFixed(2)} total paid</span>
                      <span>₹{((task.completion_count || 0) * (Number(task.network_payout) - Number(task.user_payout))).toFixed(2)} profit</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}