"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Plus, Search, Trash2, X, BarChart3, IndianRupee,
  CheckCircle2, ExternalLink, Eye, TrendingUp, Target,
  MousePointer, Percent, EyeOff, Edit2, Save, Camera,
  CameraOff, Users, FileText, Copy, ChevronUp, ChevronDown,
  LayoutTemplate, ListOrdered, Sparkles
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
  requires_proof: boolean
  proof_instructions: string | null
  max_completions: number | null
  has_detail_page: boolean
  how_to_steps: string[]
  copy_prompts: string[]
  created_at: string
  completion_count?: number
  click_count?: number
  conversion_rate?: string
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
  totalClicks: number
  totalPaidOut: number
  avgConversion: string
}

const emptyForm = {
  title: '', description: '', task_url: '', app_name: '', app_icon_url: '',
  network_payout: '', user_payout: '', country: 'IN', task_id: '',
  action_type: 'install', requires_proof: true, proof_instructions: '',
  max_completions: '', has_detail_page: false,
  how_to_steps: [] as string[], copy_prompts: [] as string[],
}

export function AdminTasks() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [completions, setCompletions] = useState<TaskCompletion[]>([])
  const [stats, setStats] = useState<Stats>({
    totalTasks: 0, activeTasks: 0, totalCompletions: 0,
    totalClicks: 0, totalPaidOut: 0, avgConversion: '0'
  })
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [showForm, setShowForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [activeTab, setActiveTab] = useState<'tasks' | 'analytics'>('tasks')
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all')
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [editForm, setEditForm] = useState<Partial<Task & { how_to_steps: string[], copy_prompts: string[] }>>({})
  const [savingEdit, setSavingEdit] = useState(false)
  const [form, setForm] = useState(emptyForm)

  // Track new step/prompt inputs
  const [newStep, setNewStep] = useState("")
  const [newPrompt, setNewPrompt] = useState("")
  const [editNewStep, setEditNewStep] = useState("")
  const [editNewPrompt, setEditNewPrompt] = useState("")

  useEffect(() => { fetchAll() }, [])

  const fetchAll = async () => {
    try {
      const [tasksRes, completionsRes, clicksRes] = await Promise.all([
        fetch('/api/admin/tasks'),
        fetch('/api/admin/task-completions'),
        fetch('/api/admin/task-clicks'),
      ])
      const taskList = tasksRes.ok ? (await tasksRes.json()).tasks || [] : []
      const completionData = completionsRes.ok ? (await completionsRes.json()).completions || [] : []
      const clicksData = clicksRes.ok ? (await clicksRes.json()) : { taskStats: {}, totalClicks: 0 }

      setCompletions(completionData)

      const enriched = taskList.map((t: Task) => {
        const tc = completionData.filter((c: TaskCompletion) => c.task_id === t.id)
        const clicks = clicksData.taskStats?.[t.id]?.clicks || 0
        return {
          ...t,
          how_to_steps: t.how_to_steps || [],
          copy_prompts: t.copy_prompts || [],
          has_detail_page: t.has_detail_page || false,
          completion_count: tc.length,
          click_count: clicks,
          conversion_rate: clicks > 0 ? ((tc.length / clicks) * 100).toFixed(1) : '0',
          total_paid: tc.reduce((s: number, c: TaskCompletion) => s + Number(c.user_payout || 0), 0)
        }
      })

      setTasks(enriched)

      const totalClicks = clicksData.totalClicks || 0
      const totalCompletions = completionData.length
      setStats({
        totalTasks: enriched.length,
        activeTasks: enriched.filter((t: Task) => t.is_active).length,
        totalCompletions,
        totalClicks,
        totalPaidOut: completionData.reduce((s: number, c: TaskCompletion) => s + Number(c.user_payout || 0), 0),
        avgConversion: totalClicks > 0 ? ((totalCompletions / totalClicks) * 100).toFixed(1) : '0'
      })
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
    let url = form.task_url
    if (!url.startsWith('http://') && !url.startsWith('https://')) url = 'https://' + url
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
          requires_proof: form.requires_proof,
          proof_instructions: form.proof_instructions || null,
          max_completions: form.max_completions ? parseInt(form.max_completions) : null,
          has_detail_page: form.has_detail_page,
          how_to_steps: form.how_to_steps,
          copy_prompts: form.copy_prompts,
        })
      })
      if (res.ok) {
        setShowForm(false)
        setForm(emptyForm)
        setNewStep("")
        setNewPrompt("")
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

  const startEdit = (task: Task) => {
    setEditingTask(task)
    setEditForm({
      title: task.title,
      description: task.description,
      task_url: task.task_url,
      app_name: task.app_name,
      app_icon_url: task.app_icon_url,
      network_payout: task.network_payout,
      user_payout: task.user_payout,
      action_type: task.action_type,
      requires_proof: task.requires_proof,
      proof_instructions: task.proof_instructions,
      max_completions: task.max_completions,
      has_detail_page: task.has_detail_page || false,
      how_to_steps: [...(task.how_to_steps || [])],
      copy_prompts: [...(task.copy_prompts || [])],
    })
    setEditNewStep("")
    setEditNewPrompt("")
  }

  const saveEdit = async () => {
    if (!editingTask) return
    setSavingEdit(true)
    try {
      const res = await fetch(`/api/admin/tasks/${editingTask.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm)
      })
      if (res.ok) {
        setEditingTask(null)
        setEditForm({})
        fetchAll()
      } else {
        alert('Failed to save changes')
      }
    } catch (error) {
      console.error('Error saving task:', error)
    } finally {
      setSavingEdit(false)
    }
  }

  const toggleProofRequired = async (task: Task) => {
    try {
      await fetch(`/api/admin/tasks/${task.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requires_proof: !task.requires_proof })
      })
      fetchAll()
    } catch (error) {
      console.error('Error toggling proof:', error)
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

  const deleteTask = async (id: number) => {
    if (!confirm('Delete this task? This cannot be undone.')) return
    try {
      const res = await fetch(`/api/admin/tasks/${id}`, { method: 'DELETE' })
      if (res.ok) fetchAll()
    } catch (error) {
      console.error('Error deleting task:', error)
    }
  }

  // ── Step helpers ──
  const addStep = (isEdit: boolean) => {
    const val = isEdit ? editNewStep.trim() : newStep.trim()
    if (!val) return
    if (isEdit) {
      setEditForm(f => ({ ...f, how_to_steps: [...(f.how_to_steps || []), val] }))
      setEditNewStep("")
    } else {
      setForm(f => ({ ...f, how_to_steps: [...f.how_to_steps, val] }))
      setNewStep("")
    }
  }

  const removeStep = (idx: number, isEdit: boolean) => {
    if (isEdit) {
      setEditForm(f => ({ ...f, how_to_steps: (f.how_to_steps || []).filter((_, i) => i !== idx) }))
    } else {
      setForm(f => ({ ...f, how_to_steps: f.how_to_steps.filter((_, i) => i !== idx) }))
    }
  }

  const moveStep = (idx: number, dir: 'up' | 'down', isEdit: boolean) => {
    const arr = isEdit ? [...(editForm.how_to_steps || [])] : [...form.how_to_steps]
    const newIdx = dir === 'up' ? idx - 1 : idx + 1
    if (newIdx < 0 || newIdx >= arr.length) return
    ;[arr[idx], arr[newIdx]] = [arr[newIdx], arr[idx]]
    if (isEdit) setEditForm(f => ({ ...f, how_to_steps: arr }))
    else setForm(f => ({ ...f, how_to_steps: arr }))
  }

  // ── Prompt helpers ──
  const addPrompt = (isEdit: boolean) => {
    const val = isEdit ? editNewPrompt.trim() : newPrompt.trim()
    if (!val) return
    if (isEdit) {
      setEditForm(f => ({ ...f, copy_prompts: [...(f.copy_prompts || []), val] }))
      setEditNewPrompt("")
    } else {
      setForm(f => ({ ...f, copy_prompts: [...f.copy_prompts, val] }))
      setNewPrompt("")
    }
  }

  const removePrompt = (idx: number, isEdit: boolean) => {
    if (isEdit) {
      setEditForm(f => ({ ...f, copy_prompts: (f.copy_prompts || []).filter((_, i) => i !== idx) }))
    } else {
      setForm(f => ({ ...f, copy_prompts: f.copy_prompts.filter((_, i) => i !== idx) }))
    }
  }

  const filtered = tasks
    .filter(t => filterStatus === 'all' || (filterStatus === 'active' ? t.is_active : !t.is_active))
    .filter(t =>
      t.title.toLowerCase().includes(search.toLowerCase()) ||
      (t.app_name || '').toLowerCase().includes(search.toLowerCase())
    )

  const taskCompletions = selectedTask ? completions.filter(c => c.task_id === selectedTask.id) : []

  const getConversionColor = (rate: string) => {
    const r = parseFloat(rate)
    if (r >= 50) return 'text-green-600'
    if (r >= 20) return 'text-yellow-600'
    return 'text-red-500'
  }

  const SlotsBar = ({ task }: { task: Task }) => {
    if (!task.max_completions) return null
    const filled = task.completion_count || 0
    const total = task.max_completions
    const pct = Math.min((filled / total) * 100, 100)
    const remaining = total - filled
    const isFull = remaining <= 0
    return (
      <div className="mt-1">
        <div className="flex items-center justify-between mb-1">
          <span className={`text-xs font-semibold ${isFull ? 'text-red-600' : 'text-gray-600'}`}>
            {isFull ? '🔒 Full' : `${remaining} slots left`}
          </span>
          <span className="text-xs text-gray-400">{filled}/{total}</span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-1.5">
          <div
            className={`h-1.5 rounded-full transition-all ${isFull ? 'bg-red-500' : pct > 70 ? 'bg-orange-500' : 'bg-green-500'}`}
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
    )
  }

  // ── Reusable Steps + Prompts section (used in both create and edit forms) ──
  const StepsSection = ({ isEdit }: { isEdit: boolean }) => {
    const steps = isEdit ? (editForm.how_to_steps || []) : form.how_to_steps
    const stepInput = isEdit ? editNewStep : newStep
    const setStepInput = isEdit ? setEditNewStep : setNewStep

    return (
      <div className="md:col-span-2 p-4 bg-purple-50 border border-purple-200 rounded-xl space-y-3">
        <div className="flex items-center gap-2">
          <ListOrdered className="w-4 h-4 text-purple-600" />
          <p className="font-medium text-gray-900 text-sm">How-To Steps</p>
          <span className="text-xs bg-purple-100 text-purple-600 px-2 py-0.5 rounded-full">Optional</span>
        </div>
        <p className="text-xs text-gray-500">Step-by-step instructions shown to the user before they start the task. Only visible if Detail Page is ON.</p>

        {steps.length > 0 && (
          <div className="space-y-2">
            {steps.map((step, idx) => (
              <div key={idx} className="flex items-center gap-2 bg-white border border-purple-100 rounded-lg px-3 py-2">
                <span className="w-5 h-5 rounded-full bg-purple-100 text-purple-600 text-xs font-bold flex items-center justify-center flex-shrink-0">{idx + 1}</span>
                <p className="text-xs text-gray-700 flex-1">{step}</p>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button
                    aria-label={`Move step ${idx + 1} up`}
                    onClick={() => moveStep(idx, 'up', isEdit)}
                    disabled={idx === 0}
                    className="p-0.5 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                  >
                    <ChevronUp className="w-3 h-3" />
                  </button>
                  <button
                    aria-label={`Move step ${idx + 1} down`}
                    onClick={() => moveStep(idx, 'down', isEdit)}
                    disabled={idx === steps.length - 1}
                    className="p-0.5 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                  >
                    <ChevronDown className="w-3 h-3" />
                  </button>
                  <button
                    aria-label={`Remove step ${idx + 1}`}
                    onClick={() => removeStep(idx, isEdit)}
                    className="p-0.5 text-red-400 hover:text-red-600"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="flex gap-2">
          <Input
            value={stepInput}
            onChange={e => setStepInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addStep(isEdit))}
            placeholder="e.g. Open Google Maps and search for the business"
            className="bg-white text-sm"
          />
          <Button
            type="button"
            onClick={() => addStep(isEdit)}
            className="bg-purple-600 hover:bg-purple-700 px-3 flex-shrink-0"
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>
        <p className="text-xs text-gray-400">Press Enter or click + to add each step</p>
      </div>
    )
  }

  const PromptsSection = ({ isEdit }: { isEdit: boolean }) => {
    const prompts = isEdit ? (editForm.copy_prompts || []) : form.copy_prompts
    const promptInput = isEdit ? editNewPrompt : newPrompt
    const setPromptInput = isEdit ? setEditNewPrompt : setNewPrompt

    return (
      <div className="md:col-span-2 p-4 bg-green-50 border border-green-200 rounded-xl space-y-3">
        <div className="flex items-center gap-2">
          <Copy className="w-4 h-4 text-green-600" />
          <p className="font-medium text-gray-900 text-sm">Copy-Paste Prompts</p>
          <span className="text-xs bg-green-100 text-green-600 px-2 py-0.5 rounded-full">Optional</span>
        </div>
        <p className="text-xs text-gray-500">
          Suggested texts the user can copy and paste (e.g. review text for Google Maps). Each prompt gets a one-tap copy button. Only visible if Detail Page is ON.
        </p>

        {prompts.length > 0 && (
          <div className="space-y-2">
            {prompts.map((prompt, idx) => (
              <div key={idx} className="flex items-start gap-2 bg-white border border-green-100 rounded-lg px-3 py-2">
                <Sparkles className="w-3 h-3 text-green-500 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-gray-700 flex-1 whitespace-pre-wrap">{prompt}</p>
                <button
                  aria-label={`Remove prompt ${idx + 1}`}
                  onClick={() => removePrompt(idx, isEdit)}
                  className="p-0.5 text-red-400 hover:text-red-600 flex-shrink-0"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="flex gap-2">
          <textarea
            value={promptInput}
            onChange={e => setPromptInput(e.target.value)}
            placeholder="e.g. Great service! Highly recommend this place to everyone. Staff was very helpful and friendly. 5 stars!"
            rows={3}
            className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white resize-none focus:outline-none focus:ring-2 focus:ring-green-400"
          />
          <Button
            type="button"
            onClick={() => addPrompt(isEdit)}
            className="bg-green-600 hover:bg-green-700 px-3 flex-shrink-0 self-end"
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>
        <p className="text-xs text-gray-400">Each prompt gets a separate copy button. Add multiple variations.</p>
      </div>
    )
  }

  const DetailPageToggle = ({ isEdit }: { isEdit: boolean }) => {
    const val = isEdit ? (editForm.has_detail_page ?? false) : form.has_detail_page
    const toggle = () => {
      if (isEdit) setEditForm(f => ({ ...f, has_detail_page: !f.has_detail_page }))
      else setForm(f => ({ ...f, has_detail_page: !f.has_detail_page }))
    }
    return (
      <div className="md:col-span-2 p-4 bg-blue-50 border border-blue-200 rounded-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <LayoutTemplate className="w-4 h-4 text-blue-600" />
            <div>
              <p className="font-medium text-gray-900 text-sm">Task Detail Page</p>
              <p className="text-xs text-gray-500">
                {val
                  ? 'User sees a full detail page with steps & prompts before starting'
                  : 'User goes directly to task URL when they click Start'}
              </p>
            </div>
          </div>
          <button
            aria-label="Toggle task detail page"
            onClick={toggle}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors flex-shrink-0 ${val ? 'bg-blue-600' : 'bg-gray-300'}`}
          >
            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow ${val ? 'translate-x-6' : 'translate-x-1'}`} />
          </button>
        </div>
        {val && (
          <div className="mt-3 flex items-start gap-2 bg-blue-100 rounded-lg px-3 py-2">
            <CheckCircle2 className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-blue-700">
              Detail page is ON. How-To Steps and Copy Prompts will be shown to users. Make sure to add them below.
            </p>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-6">

      {/* ── Edit Modal ── */}
      {editingTask && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Edit Task</h2>
                <p className="text-xs text-gray-500 mt-0.5">{editingTask.title}</p>
              </div>
              <button
                aria-label="Close edit modal"
                onClick={() => setEditingTask(null)}
                className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
              >
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-title">Title *</Label>
                <Input id="edit-title" value={editForm.title || ''} onChange={e => setEditForm({...editForm, title: e.target.value})} className="mt-1" />
              </div>
              <div>
                <Label htmlFor="edit-url">Task URL *</Label>
                <Input id="edit-url" value={editForm.task_url || ''} onChange={e => setEditForm({...editForm, task_url: e.target.value})} className="mt-1" />
              </div>
              <div>
                <Label htmlFor="edit-appname">App Name</Label>
                <Input id="edit-appname" value={editForm.app_name || ''} onChange={e => setEditForm({...editForm, app_name: e.target.value})} className="mt-1" />
              </div>
              <div>
                <Label htmlFor="edit-icon">App Icon URL</Label>
                <Input id="edit-icon" value={editForm.app_icon_url || ''} onChange={e => setEditForm({...editForm, app_icon_url: e.target.value})} className="mt-1" />
              </div>
              <div>
                <Label htmlFor="edit-net">Network Payout (₹)</Label>
                <Input id="edit-net" type="number" value={editForm.network_payout || ''} onChange={e => setEditForm({...editForm, network_payout: parseFloat(e.target.value)})} className="mt-1" />
              </div>
              <div>
                <Label htmlFor="edit-user">User Payout (₹)</Label>
                <Input id="edit-user" type="number" value={editForm.user_payout || ''} onChange={e => setEditForm({...editForm, user_payout: parseFloat(e.target.value)})} className="mt-1" />
              </div>
              <div>
                <Label htmlFor="edit-action">Action Type</Label>
                <select
                  id="edit-action"
                  title="Action Type"
                  value={editForm.action_type || 'install'}
                  onChange={e => setEditForm({...editForm, action_type: e.target.value})}
                  className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                >
                  <option value="install">App Install</option>
                  <option value="signup">Sign Up</option>
                  <option value="survey">Survey</option>
                  <option value="review">Review</option>
                  <option value="time_spent">Time Spent</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <Label htmlFor="edit-desc">Description</Label>
                <Input id="edit-desc" value={editForm.description || ''} onChange={e => setEditForm({...editForm, description: e.target.value})} className="mt-1" />
              </div>

              {/* Max Completions */}
              <div className="md:col-span-2 p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-slate-600" />
                  <p className="font-medium text-gray-900 text-sm">User Completion Limit</p>
                  <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">Optional</span>
                </div>
                <p className="text-xs text-gray-500">Leave empty for unlimited completions.</p>
                <Input
                  id="edit-maxcomp"
                  type="number"
                  min="1"
                  placeholder="e.g. 100 (leave empty for unlimited)"
                  value={editForm.max_completions ?? ''}
                  onChange={e => setEditForm({ ...editForm, max_completions: e.target.value ? parseInt(e.target.value) : null })}
                  className="bg-white"
                />
                {editForm.max_completions && (
                  <p className="text-xs text-slate-600 font-medium">✓ Only {editForm.max_completions} users can complete this task</p>
                )}
              </div>

              {/* Detail Page Toggle */}
              <DetailPageToggle isEdit={true} />

              {/* How-To Steps */}
              <StepsSection isEdit={true} />

              {/* Copy Prompts */}
              <PromptsSection isEdit={true} />

              {/* Proof Settings */}
              <div className="md:col-span-2 p-4 bg-orange-50 border border-orange-200 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900 text-sm">Screenshot Proof Required</p>
                    <p className="text-xs text-gray-500">Users must upload proof to get paid</p>
                  </div>
                  <button
                    aria-label="Toggle proof required"
                    onClick={() => setEditForm({...editForm, requires_proof: !editForm.requires_proof})}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors flex-shrink-0 ${editForm.requires_proof ? 'bg-orange-500' : 'bg-gray-300'}`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow ${editForm.requires_proof ? 'translate-x-6' : 'translate-x-1'}`} />
                  </button>
                </div>
                {editForm.requires_proof && (
                  <div>
                    <Label htmlFor="edit-proof-inst">Proof Instructions <span className="text-xs text-gray-400">(shown to user)</span></Label>
                    <Input
                      id="edit-proof-inst"
                      value={editForm.proof_instructions || ''}
                      onChange={e => setEditForm({...editForm, proof_instructions: e.target.value})}
                      placeholder="e.g. Take a screenshot of the app installed on your phone"
                      className="mt-1"
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <Button onClick={saveEdit} disabled={savingEdit} className="bg-blue-600 hover:bg-blue-700 flex-1">
                <Save className="w-4 h-4 mr-2" />
                {savingEdit ? 'Saving...' : 'Save Changes'}
              </Button>
              <Button variant="outline" onClick={() => setEditingTask(null)} className="flex-1">Cancel</Button>
            </div>
          </div>
        </div>
      )}

      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tasks</h1>
          <p className="text-gray-600 mt-1">Manage earning tasks and track performance</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" /> Add Task
        </Button>
      </div>

      {/* ── Stats ── */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          { label: 'Total Tasks', value: stats.totalTasks, sub: `${stats.activeTasks} active`, icon: Target, color: 'blue' },
          { label: 'Total Clicks', value: stats.totalClicks, sub: 'all time', icon: MousePointer, color: 'purple' },
          { label: 'Completions', value: stats.totalCompletions, sub: 'all time', icon: CheckCircle2, color: 'green' },
          { label: 'Conversion', value: `${stats.avgConversion}%`, sub: 'click → complete', icon: Percent, color: 'orange' },
          { label: 'Paid to Users', value: `₹${stats.totalPaidOut.toFixed(0)}`, sub: 'total', icon: IndianRupee, color: 'green' },
          { label: 'Your Profit', value: `₹${(tasks.reduce((s, t) => s + ((t.completion_count || 0) * (Number(t.network_payout) - Number(t.user_payout))), 0)).toFixed(0)}`, sub: 'estimated', icon: TrendingUp, color: 'blue' },
        ].map((s, i) => (
          <Card key={i} className={`border border-${s.color}-200 bg-${s.color}-50`}>
            <CardContent className="p-4">
              <div className="flex items-center gap-1 mb-1">
                <s.icon className={`w-3 h-3 text-${s.color}-600`} />
                <p className={`text-xs text-${s.color}-600 font-medium`}>{s.label}</p>
              </div>
              <p className={`text-xl font-bold text-${s.color}-700`}>{s.value}</p>
              <p className={`text-xs text-${s.color}-500`}>{s.sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ── Tabs ── */}
      <div className="flex gap-1 p-1 bg-gray-100 rounded-xl w-fit">
        <button onClick={() => setActiveTab('tasks')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'tasks' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500'}`}>
          <Target className="w-4 h-4 inline mr-1" /> Tasks
        </button>
        <button onClick={() => setActiveTab('analytics')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'analytics' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500'}`}>
          <BarChart3 className="w-4 h-4 inline mr-1" /> Analytics
        </button>
      </div>

      {/* ── Create Task Form ── */}
      {showForm && (
        <Card className="border border-blue-200 bg-blue-50/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">New Task</h2>
              <button
                aria-label="Close create task form"
                onClick={() => setShowForm(false)}
                className="w-8 h-8 rounded-full bg-white flex items-center justify-center hover:bg-gray-100 transition-colors border border-gray-200"
              >
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="create-title">Title *</Label>
                <Input id="create-title" value={form.title} onChange={e => setForm({...form, title: e.target.value})} placeholder="e.g. Write a Google Review" className="mt-1" />
              </div>
              <div>
                <Label htmlFor="create-url">Task URL *</Label>
                <Input id="create-url" value={form.task_url} onChange={e => setForm({...form, task_url: e.target.value})} placeholder="https://maps.google.com/..." className="mt-1" />
              </div>
              <div>
                <Label htmlFor="create-appname">App Name</Label>
                <Input id="create-appname" value={form.app_name} onChange={e => setForm({...form, app_name: e.target.value})} placeholder="Google Maps" className="mt-1" />
              </div>
              <div>
                <Label htmlFor="create-icon">App Icon URL</Label>
                <Input id="create-icon" value={form.app_icon_url} onChange={e => setForm({...form, app_icon_url: e.target.value})} placeholder="https://..." className="mt-1" />
              </div>
              <div>
                <Label htmlFor="create-net">Network Payout (₹) *</Label>
                <Input id="create-net" type="number" value={form.network_payout} onChange={e => setForm({...form, network_payout: e.target.value})} placeholder="0.00" className="mt-1" />
              </div>
              <div>
                <Label htmlFor="create-user">User Payout (₹) *</Label>
                <Input id="create-user" type="number" value={form.user_payout} onChange={e => setForm({...form, user_payout: e.target.value})} placeholder="0.00" className="mt-1" />
              </div>
              <div>
                <Label htmlFor="create-action">Action Type</Label>
                <select
                  id="create-action"
                  title="Action Type"
                  value={form.action_type}
                  onChange={e => setForm({...form, action_type: e.target.value})}
                  className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                >
                  <option value="install">App Install</option>
                  <option value="signup">Sign Up</option>
                  <option value="survey">Survey</option>
                  <option value="review">Review</option>
                  <option value="time_spent">Time Spent</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <Label htmlFor="create-country">Country</Label>
                <Input id="create-country" value={form.country} onChange={e => setForm({...form, country: e.target.value})} placeholder="IN" className="mt-1" />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="create-desc">Description</Label>
                <Input id="create-desc" value={form.description} onChange={e => setForm({...form, description: e.target.value})} placeholder="e.g. Write a 5-star review on Google Maps for this business" className="mt-1" />
              </div>

              {/* Max Completions */}
              <div className="md:col-span-2 p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-slate-600" />
                  <p className="font-medium text-gray-900 text-sm">User Completion Limit</p>
                  <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">Optional</span>
                </div>
                <p className="text-xs text-gray-500">Limit how many users can complete this task. Leave empty for unlimited.</p>
                <Input
                  id="create-maxcomp"
                  type="number"
                  min="1"
                  placeholder="e.g. 100 (leave empty for unlimited)"
                  value={form.max_completions}
                  onChange={e => setForm({...form, max_completions: e.target.value})}
                  className="bg-white"
                />
                {form.max_completions && (
                  <p className="text-xs text-slate-600 font-medium">✓ Only {form.max_completions} users can complete this task</p>
                )}
              </div>

              {/* Detail Page Toggle */}
              <DetailPageToggle isEdit={false} />

              {/* How-To Steps */}
              <StepsSection isEdit={false} />

              {/* Copy Prompts */}
              <PromptsSection isEdit={false} />

              {/* Proof Settings */}
              <div className="md:col-span-2 p-4 bg-orange-50 border border-orange-200 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900 text-sm">Require Screenshot Proof</p>
                    <p className="text-xs text-gray-500">Users must upload proof to get paid</p>
                  </div>
                  <button
                    aria-label="Toggle proof required"
                    onClick={() => setForm({...form, requires_proof: !form.requires_proof})}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors flex-shrink-0 ${form.requires_proof ? 'bg-orange-500' : 'bg-gray-300'}`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow ${form.requires_proof ? 'translate-x-6' : 'translate-x-1'}`} />
                  </button>
                </div>
                {form.requires_proof && (
                  <div>
                    <Label htmlFor="create-proof-inst">Proof Instructions</Label>
                    <Input
                      id="create-proof-inst"
                      value={form.proof_instructions}
                      onChange={e => setForm({...form, proof_instructions: e.target.value})}
                      placeholder="e.g. Screenshot showing your posted review"
                      className="mt-1"
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-3 mt-5">
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
          {/* Search + Filter */}
          <div className="flex gap-3 flex-wrap">
            <div className="relative flex-1 min-w-48">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input placeholder="Search tasks..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10" />
            </div>
            <div className="flex gap-1 p-1 bg-gray-100 rounded-lg">
              {(['all', 'active', 'inactive'] as const).map(f => (
                <button key={f} onClick={() => setFilterStatus(f)}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${filterStatus === f ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500'}`}>
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Tasks Table */}
          <Card className="border border-gray-200">
            <CardContent className="p-0">
              {loading ? (
                <div className="p-8 text-center text-gray-500">Loading tasks...</div>
              ) : filtered.length === 0 ? (
                <div className="p-8 text-center text-gray-500">No tasks found.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Task</th>
                        <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Payouts</th>
                        <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Clicks</th>
                        <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Slots</th>
                        <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">CVR</th>
                        <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Features</th>
                        <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Status</th>
                        <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {filtered.map((task) => (
                        <tr key={task.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              {task.app_icon_url ? (
                                <img src={task.app_icon_url} alt={task.app_name || task.title} className="w-10 h-10 rounded-lg object-cover border border-gray-200 flex-shrink-0" />
                              ) : (
                                <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                                  <Target className="w-5 h-5 text-gray-400" />
                                </div>
                              )}
                              <div>
                                <p className="text-sm font-medium text-gray-900">{task.title}</p>
                                <p className="text-xs text-gray-500">{task.app_name || task.action_type}</p>
                                <a href={task.task_url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-500 hover:underline flex items-center gap-1 mt-0.5">
                                  <ExternalLink className="w-3 h-3" /> View Link
                                </a>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <p className="text-xs text-gray-500">Network: <span className="font-medium text-gray-900">₹{task.network_payout}</span></p>
                            <p className="text-xs text-gray-500">User: <span className="font-medium text-green-600">₹{task.user_payout}</span></p>
                            <p className="text-xs text-gray-500">Profit: <span className="font-medium text-blue-600">₹{(Number(task.network_payout) - Number(task.user_payout)).toFixed(2)}</span></p>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-1">
                              <MousePointer className="w-3 h-3 text-purple-500" />
                              <span className="text-sm font-bold text-gray-900">{task.click_count || 0}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 min-w-[120px]">
                            {task.max_completions ? (
                              <div>
                                <div className="flex items-center gap-1 mb-1">
                                  <Users className="w-3 h-3 text-blue-500" />
                                  <span className="text-sm font-bold text-gray-900">{task.completion_count || 0}</span>
                                  <span className="text-xs text-gray-400">/ {task.max_completions}</span>
                                </div>
                                <SlotsBar task={task} />
                              </div>
                            ) : (
                              <div className="flex items-center gap-1">
                                <span className="text-sm font-bold text-gray-900">{task.completion_count || 0}</span>
                                <button
                                  aria-label={selectedTask?.id === task.id ? "Hide completions" : "Show completions"}
                                  onClick={() => setSelectedTask(selectedTask?.id === task.id ? null : task)}
                                  className="text-blue-500 hover:text-blue-700 ml-1"
                                >
                                  {selectedTask?.id === task.id ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                              </div>
                            )}
                            {task.max_completions && (
                              <button
                                aria-label={selectedTask?.id === task.id ? "Hide completions" : "Show completions"}
                                onClick={() => setSelectedTask(selectedTask?.id === task.id ? null : task)}
                                className="text-blue-500 hover:text-blue-700 mt-1"
                              >
                                {selectedTask?.id === task.id ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                              </button>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <span className={`text-sm font-bold ${getConversionColor(task.conversion_rate || '0')}`}>
                              {task.conversion_rate}%
                            </span>
                          </td>
                          {/* Features column — shows what's enabled */}
                          <td className="px-4 py-3">
                            <div className="flex flex-col gap-1">
                              <button
                                title={task.requires_proof ? 'Proof required — click to disable' : 'No proof required — click to enable'}
                                onClick={() => toggleProofRequired(task)}
                                className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium transition-colors w-fit ${task.requires_proof ? 'bg-orange-100 text-orange-700 hover:bg-orange-200' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
                              >
                                {task.requires_proof ? <Camera className="w-3 h-3" /> : <CameraOff className="w-3 h-3" />}
                                Proof
                              </button>
                              {task.has_detail_page && (
                                <span className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium bg-blue-100 text-blue-700 w-fit">
                                  <LayoutTemplate className="w-3 h-3" /> Detail
                                </span>
                              )}
                              {task.how_to_steps?.length > 0 && (
                                <span className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium bg-purple-100 text-purple-700 w-fit">
                                  <ListOrdered className="w-3 h-3" /> {task.how_to_steps.length} steps
                                </span>
                              )}
                              {task.copy_prompts?.length > 0 && (
                                <span className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium bg-green-100 text-green-700 w-fit">
                                  <Copy className="w-3 h-3" /> {task.copy_prompts.length} prompts
                                </span>
                              )}
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
                            <div className="flex items-center gap-1">
                              <Button variant="ghost" size="sm" onClick={() => startEdit(task)} className="text-blue-600 hover:bg-blue-50" title="Edit task">
                                <Edit2 className="w-4 h-4" />
                              </Button>
                              <Button variant="ghost" size="sm" onClick={() => deleteTask(task.id)} className="text-red-600 hover:bg-red-50" title="Delete task">
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
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
                  <CardTitle className="text-base">Completions — {selectedTask.title}</CardTitle>
                  <Button variant="ghost" size="icon" aria-label="Close completions panel" onClick={() => setSelectedTask(null)}>
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
                            <td className="px-3 py-2 text-sm">{c.user_email || `User #${c.user_id}`}</td>
                            <td className="px-3 py-2">
                              <Badge className={
                                c.status === 'verified' ? 'bg-green-100 text-green-700' :
                                c.status === 'pending_verification' ? 'bg-orange-100 text-orange-700' :
                                c.status === 'rejected' ? 'bg-red-100 text-red-700' :
                                'bg-yellow-100 text-yellow-700'
                              }>
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
            <Card><CardContent className="p-8 text-center text-gray-500">No tasks yet</CardContent></Card>
          ) : (
            <div className="space-y-3">
              {[...tasks].sort((a, b) => (b.click_count || 0) - (a.click_count || 0)).map((task) => {
                const maxClicks = Math.max(...tasks.map(t => t.click_count || 0), 1)
                return (
                  <Card key={task.id} className="border border-gray-200 bg-white">
                    <CardContent className="p-5">
                      <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                        <div className="flex items-center gap-3">
                          {task.app_icon_url && <img src={task.app_icon_url} alt="" className="w-9 h-9 rounded-lg" />}
                          <div>
                            <p className="font-semibold text-gray-900 text-sm">{task.title}</p>
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="text-xs text-gray-500">{task.action_type}</p>
                              {task.requires_proof && <span className="text-xs bg-orange-100 text-orange-600 px-1.5 py-0.5 rounded">📸 Proof</span>}
                              {task.has_detail_page && <span className="text-xs bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded">📄 Detail Page</span>}
                              {task.how_to_steps?.length > 0 && <span className="text-xs bg-purple-100 text-purple-600 px-1.5 py-0.5 rounded">{task.how_to_steps.length} steps</span>}
                              {task.copy_prompts?.length > 0 && <span className="text-xs bg-green-100 text-green-600 px-1.5 py-0.5 rounded">{task.copy_prompts.length} prompts</span>}
                              {task.max_completions && (
                                <span className="text-xs bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded flex items-center gap-1">
                                  <Users className="w-2.5 h-2.5" /> {task.completion_count}/{task.max_completions}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 text-right">
                          <div><p className="text-xs text-gray-500">Clicks</p><p className="font-bold text-purple-600">{task.click_count || 0}</p></div>
                          <div><p className="text-xs text-gray-500">Completions</p><p className="font-bold text-green-600">{task.completion_count || 0}</p></div>
                          <div><p className="text-xs text-gray-500">CVR</p><p className={`font-bold ${getConversionColor(task.conversion_rate || '0')}`}>{task.conversion_rate}%</p></div>
                          <div><p className="text-xs text-gray-500">Profit</p><p className="font-bold text-blue-600">₹{((task.completion_count || 0) * (Number(task.network_payout) - Number(task.user_payout))).toFixed(0)}</p></div>
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <div className="flex justify-between text-xs text-gray-400"><span>Clicks</span><span>{task.click_count || 0}</span></div>
                        <div className="w-full bg-gray-100 rounded-full h-2">
                          <div className="bg-purple-500 h-2 rounded-full" style={{ width: `${((task.click_count || 0) / maxClicks) * 100}%` }} />
                        </div>
                        <div className="flex justify-between text-xs text-gray-400"><span>Completions</span><span>{task.completion_count || 0}</span></div>
                        <div className="w-full bg-gray-100 rounded-full h-2">
                          <div className="bg-green-500 h-2 rounded-full" style={{ width: `${((task.completion_count || 0) / maxClicks) * 100}%` }} />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </div>
      )}
    </div>
  )
}