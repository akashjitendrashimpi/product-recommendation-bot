"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Plus, Search, Trash2, X, BarChart3, IndianRupee,
  CheckCircle2, ExternalLink, Eye, TrendingUp, Target,
  MousePointer, Percent, EyeOff, Edit2, Save, Camera,
  CameraOff, Users, Copy, ChevronUp, ChevronDown,
  LayoutTemplate, ListOrdered, Sparkles, Download,
  GripVertical, CheckSquare, Square, Send, AlertTriangle
} from "lucide-react"

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────
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
  id: number; task_id: number; user_id: number; status: string
  user_payout: number; created_at: string; user_email?: string
}

interface Stats {
  totalTasks: number; activeTasks: number; totalCompletions: number
  totalClicks: number; totalPaidOut: number; avgConversion: string
}

// ─────────────────────────────────────────────────────────────────────────────
// Sub-components (outside main to prevent re-render focus loss)
// ─────────────────────────────────────────────────────────────────────────────
function StepsSection({ steps, stepInput, onStepInputChange, onAddStep, onRemoveStep, onMoveStep }: {
  steps: string[]; stepInput: string
  onStepInputChange: (v: string) => void; onAddStep: () => void
  onRemoveStep: (i: number) => void; onMoveStep: (i: number, dir: 'up' | 'down') => void
}) {
  return (
    <div className="md:col-span-2 p-4 bg-purple-50 border border-purple-200 rounded-xl space-y-3">
      <div className="flex items-center gap-2">
        <ListOrdered className="w-4 h-4 text-purple-600" />
        <p className="font-medium text-gray-900 text-sm">How-To Steps</p>
        <span className="text-xs bg-purple-100 text-purple-600 px-2 py-0.5 rounded-full">Optional</span>
      </div>
      <p className="text-xs text-gray-500">Step-by-step instructions shown to the user. Only visible if Detail Page is ON.</p>
      {steps.length > 0 && (
        <div className="space-y-2">
          {steps.map((step, idx) => (
            <div key={idx} className="flex items-center gap-2 bg-white border border-purple-100 rounded-lg px-3 py-2">
              <span className="w-5 h-5 rounded-full bg-purple-100 text-purple-600 text-xs font-bold flex items-center justify-center flex-shrink-0">{idx + 1}</span>
              <p className="text-xs text-gray-700 flex-1">{step}</p>
              <div className="flex items-center gap-1 flex-shrink-0">
                <button aria-label="Up" onClick={() => onMoveStep(idx, 'up')} disabled={idx === 0} className="p-0.5 text-gray-400 hover:text-gray-600 disabled:opacity-30"><ChevronUp className="w-3 h-3" /></button>
                <button aria-label="Down" onClick={() => onMoveStep(idx, 'down')} disabled={idx === steps.length - 1} className="p-0.5 text-gray-400 hover:text-gray-600 disabled:opacity-30"><ChevronDown className="w-3 h-3" /></button>
                <button aria-label="Remove" onClick={() => onRemoveStep(idx)} className="p-0.5 text-red-400 hover:text-red-600"><X className="w-3 h-3" /></button>
              </div>
            </div>
          ))}
        </div>
      )}
      <div className="flex gap-2">
        <Input value={stepInput} onChange={e => onStepInputChange(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); onAddStep() } }}
          placeholder="e.g. Open the app and complete signup" className="bg-white text-sm" />
        <Button type="button" onClick={onAddStep} className="bg-purple-600 hover:bg-purple-700 px-3 flex-shrink-0"><Plus className="w-4 h-4" /></Button>
      </div>
      <p className="text-xs text-gray-400">Press Enter or + to add</p>
    </div>
  )
}

function PromptsSection({ prompts, promptInput, onPromptInputChange, onAddPrompt, onRemovePrompt }: {
  prompts: string[]; promptInput: string
  onPromptInputChange: (v: string) => void; onAddPrompt: () => void; onRemovePrompt: (i: number) => void
}) {
  return (
    <div className="md:col-span-2 p-4 bg-green-50 border border-green-200 rounded-xl space-y-3">
      <div className="flex items-center gap-2">
        <Copy className="w-4 h-4 text-green-600" />
        <p className="font-medium text-gray-900 text-sm">Copy-Paste Prompts</p>
        <span className="text-xs bg-green-100 text-green-600 px-2 py-0.5 rounded-full">Optional</span>
      </div>
      <p className="text-xs text-gray-500">Suggested texts users can copy. One random prompt shown per session. Only visible if Detail Page is ON.</p>
      {prompts.length > 0 && (
        <div className="space-y-2">
          {prompts.map((prompt, idx) => (
            <div key={idx} className="flex items-start gap-2 bg-white border border-green-100 rounded-lg px-3 py-2">
              <Sparkles className="w-3 h-3 text-green-500 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-gray-700 flex-1 whitespace-pre-wrap">{prompt}</p>
              <button aria-label="Remove" onClick={() => onRemovePrompt(idx)} className="p-0.5 text-red-400 hover:text-red-600 flex-shrink-0 mt-0.5"><X className="w-3 h-3" /></button>
            </div>
          ))}
        </div>
      )}
      <div className="flex gap-2 items-end">
        <textarea value={promptInput} onChange={e => onPromptInputChange(e.target.value)}
          placeholder="e.g. Great service! Highly recommend. 5 stars!" rows={3}
          className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white resize-y focus:outline-none focus:ring-2 focus:ring-green-400 min-h-[80px]" />
        <Button type="button" onClick={onAddPrompt} className="bg-green-600 hover:bg-green-700 px-3 flex-shrink-0 self-end mb-0.5"><Plus className="w-4 h-4" /></Button>
      </div>
      <p className="text-xs text-gray-400">Add multiple variations — one random shown to user each time</p>
    </div>
  )
}

function DetailPageToggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="md:col-span-2 p-4 bg-blue-50 border border-blue-200 rounded-xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <LayoutTemplate className="w-4 h-4 text-blue-600" />
          <div>
            <p className="font-medium text-gray-900 text-sm">Task Detail Page</p>
            <p className="text-xs text-gray-500">{value ? 'User sees full detail page with steps & prompts' : 'User goes directly to task URL'}</p>
          </div>
        </div>
        <button aria-label="Toggle detail page" onClick={() => onChange(!value)}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors flex-shrink-0 ${value ? 'bg-blue-600' : 'bg-gray-300'}`}>
          <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow ${value ? 'translate-x-6' : 'translate-x-1'}`} />
        </button>
      </div>
      {value && (
        <div className="mt-3 flex items-start gap-2 bg-blue-100 rounded-lg px-3 py-2">
          <CheckCircle2 className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
          <p className="text-xs text-blue-700">Detail page ON — add How-To Steps and Copy Prompts below.</p>
        </div>
      )}
    </div>
  )
}

function SlotsBar({ task }: { task: Task }) {
  if (!task.max_completions) return null
  const filled = task.completion_count || 0
  const total = task.max_completions
  const pct = Math.min((filled / total) * 100, 100)
  const remaining = total - filled
  const isFull = remaining <= 0
  return (
    <div className="mt-1">
      <div className="flex items-center justify-between mb-1">
        <span className={`text-xs font-semibold ${isFull ? 'text-red-600' : 'text-gray-600'}`}>{isFull ? '🔒 Full' : `${remaining} slots left`}</span>
        <span className="text-xs text-gray-400">{filled}/{total}</span>
      </div>
      <div className="w-full bg-gray-100 rounded-full h-1.5">
        <div className={`h-1.5 rounded-full transition-all ${isFull ? 'bg-red-500' : pct > 70 ? 'bg-orange-500' : 'bg-green-500'}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Default form
// ─────────────────────────────────────────────────────────────────────────────
const emptyForm = {
  title: '', description: '', task_url: '', app_name: '', app_icon_url: '',
  network_payout: '', user_payout: '', country: 'IN', task_id: '',
  action_type: 'install', requires_proof: true, proof_instructions: '',
  max_completions: '', has_detail_page: false,
  how_to_steps: [] as string[], copy_prompts: [] as string[],
}

// ─────────────────────────────────────────────────────────────────────────────
// Main component
// ─────────────────────────────────────────────────────────────────────────────
export function AdminTasks() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [completions, setCompletions] = useState<TaskCompletion[]>([])
  const [stats, setStats] = useState<Stats>({ totalTasks: 0, activeTasks: 0, totalCompletions: 0, totalClicks: 0, totalPaidOut: 0, avgConversion: '0' })
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [showForm, setShowForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [activeTab, setActiveTab] = useState<'tasks' | 'analytics'>('tasks')
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all')
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [editForm, setEditForm] = useState<Partial<Task>>({})
  const [savingEdit, setSavingEdit] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [previewTask, setPreviewTask] = useState<Task | null>(null)

  // Bulk selection
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set())
  const [bulkAction, setBulkAction] = useState<string>("")
  const [bulkLoading, setBulkLoading] = useState(false)

  // Drag reorder
  const [dragId, setDragId] = useState<number | null>(null)
  const [dragOverId, setDragOverId] = useState<number | null>(null)

  // Broadcast notification
  const [showBroadcast, setShowBroadcast] = useState(false)
  const [broadcastTitle, setBroadcastTitle] = useState("")
  const [broadcastBody, setBroadcastBody] = useState("")
  const [broadcasting, setBroadcasting] = useState(false)

  // Step/prompt inputs
  const [createStep, setCreateStep] = useState("")
  const [createPrompt, setCreatePrompt] = useState("")
  const [editStep, setEditStep] = useState("")
  const [editPrompt, setEditPrompt] = useState("")

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
          how_to_steps: Array.isArray(t.how_to_steps) ? t.how_to_steps : [],
          copy_prompts: Array.isArray(t.copy_prompts) ? t.copy_prompts : [],
          has_detail_page: t.has_detail_page || false,
          completion_count: tc.length, click_count: clicks,
          conversion_rate: clicks > 0 ? ((tc.length / clicks) * 100).toFixed(1) : '0',
          total_paid: tc.reduce((s: number, c: TaskCompletion) => s + Number(c.user_payout || 0), 0)
        }
      })
      setTasks(enriched)
      const totalClicks = clicksData.totalClicks || 0
      const totalCompletions = completionData.length
      setStats({
        totalTasks: enriched.length, activeTasks: enriched.filter((t: Task) => t.is_active).length,
        totalCompletions, totalClicks,
        totalPaidOut: completionData.reduce((s: number, c: TaskCompletion) => s + Number(c.user_payout || 0), 0),
        avgConversion: totalClicks > 0 ? ((totalCompletions / totalClicks) * 100).toFixed(1) : '0'
      })
    } catch (e) { console.error(e) } finally { setLoading(false) }
  }

  const createTask = async () => {
    if (!form.title || !form.task_url || !form.network_payout || !form.user_payout) { alert('Fill required fields'); return }
    let url = form.task_url
    if (!url.startsWith('http')) url = 'https://' + url
    setSubmitting(true)
    try {
      const res = await fetch('/api/admin/tasks', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, task_url: url, task_id: form.task_id || `manual_${Date.now()}`, network_payout: parseFloat(form.network_payout), user_payout: parseFloat(form.user_payout), proof_instructions: form.proof_instructions || null, max_completions: form.max_completions ? parseInt(form.max_completions) : null })
      })
      if (res.ok) { setShowForm(false); setForm(emptyForm); setCreateStep(""); setCreatePrompt(""); fetchAll() }
      else { const d = await res.json(); alert(d.error || 'Failed') }
    } catch (e) { console.error(e) } finally { setSubmitting(false) }
  }

  const startEdit = (task: Task) => {
    setEditingTask(task)
    setEditForm({ ...task, how_to_steps: [...(task.how_to_steps || [])], copy_prompts: [...(task.copy_prompts || [])] })
    setEditStep(""); setEditPrompt("")
  }

  const saveEdit = async () => {
    if (!editingTask) return
    setSavingEdit(true)
    try {
      const res = await fetch(`/api/admin/tasks/${editingTask.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(editForm) })
      if (res.ok) { setEditingTask(null); setEditForm({}); fetchAll() } else alert('Failed to save')
    } catch (e) { console.error(e) } finally { setSavingEdit(false) }
  }

  // ── Duplicate task ──
  const duplicateTask = async (task: Task) => {
    try {
      const res = await fetch('/api/admin/tasks', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: `${task.title} (copy)`,
          description: task.description, task_url: task.task_url,
          app_name: task.app_name, app_icon_url: task.app_icon_url,
          action_type: task.action_type, network_payout: task.network_payout,
          user_payout: task.user_payout, country: task.country_code || 'IN',
          task_id: `manual_${Date.now()}`, requires_proof: task.requires_proof,
          proof_instructions: task.proof_instructions, max_completions: task.max_completions,
          has_detail_page: task.has_detail_page, how_to_steps: task.how_to_steps,
          copy_prompts: task.copy_prompts,
        })
      })
      if (res.ok) fetchAll()
      else alert('Failed to duplicate task')
    } catch (e) { console.error(e) }
  }

  // ── CSV Export ──
  const exportCSV = () => {
    const headers = ['ID', 'Title', 'App', 'Type', 'Network Payout', 'User Payout', 'Profit', 'Clicks', 'Completions', 'CVR%', 'Status', 'Created']
    const rows = filtered.map(t => [
      t.id, `"${t.title}"`, `"${t.app_name || ''}"`, t.action_type,
      t.network_payout, t.user_payout,
      (Number(t.network_payout) - Number(t.user_payout)).toFixed(2),
      t.click_count || 0, t.completion_count || 0, t.conversion_rate || '0',
      t.is_active ? 'Active' : 'Inactive',
      new Date(t.created_at).toLocaleDateString()
    ])
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = `tasks_${new Date().toISOString().split('T')[0]}.csv`
    a.click(); URL.revokeObjectURL(url)
  }

  // ── Bulk actions ──
  const toggleSelectAll = () => {
    if (selectedIds.size === filtered.length) setSelectedIds(new Set())
    else setSelectedIds(new Set(filtered.map(t => t.id)))
  }

  const toggleSelect = (id: number) => {
    const next = new Set(selectedIds)
    next.has(id) ? next.delete(id) : next.add(id)
    setSelectedIds(next)
  }

  const executeBulkAction = async () => {
    if (!bulkAction || selectedIds.size === 0) return
    if (!confirm(`Apply "${bulkAction}" to ${selectedIds.size} task(s)?`)) return
    setBulkLoading(true)
    try {
      const ids = Array.from(selectedIds)
      if (bulkAction === 'delete') {
        await Promise.allSettled(ids.map(id => fetch(`/api/admin/tasks/${id}`, { method: 'DELETE' })))
      } else if (bulkAction === 'activate' || bulkAction === 'deactivate') {
        await Promise.allSettled(ids.map(id => fetch(`/api/admin/tasks/${id}`, {
          method: 'PATCH', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ is_active: bulkAction === 'activate' })
        })))
      }
      setSelectedIds(new Set()); setBulkAction(""); fetchAll()
    } catch (e) { console.error(e) } finally { setBulkLoading(false) }
  }

  // ── Drag reorder ──
  const handleDragStart = (id: number) => setDragId(id)
  const handleDragOver = (e: React.DragEvent, id: number) => { e.preventDefault(); setDragOverId(id) }
  const handleDrop = (targetId: number) => {
    if (!dragId || dragId === targetId) { setDragId(null); setDragOverId(null); return }
    const from = tasks.findIndex(t => t.id === dragId)
    const to = tasks.findIndex(t => t.id === targetId)
    const newTasks = [...tasks]
    const [moved] = newTasks.splice(from, 1)
    newTasks.splice(to, 0, moved)
    setTasks(newTasks)
    setDragId(null); setDragOverId(null)
  }

  // ── Broadcast notification ──
  const sendBroadcast = async () => {
    if (!broadcastTitle || !broadcastBody) { alert('Fill title and message'); return }
    setBroadcasting(true)
    try {
      const res = await fetch('/api/admin/send-notification', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ broadcast: true, title: broadcastTitle, body: broadcastBody, type: 'info', actionUrl: '/dashboard/tasks' })
      })
      if (res.ok) { setShowBroadcast(false); setBroadcastTitle(""); setBroadcastBody(""); alert('Notification sent to all users!') }
      else alert('Failed to send notification')
    } catch (e) { console.error(e) } finally { setBroadcasting(false) }
  }

  const toggleProofRequired = async (task: Task) => {
    await fetch(`/api/admin/tasks/${task.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ requires_proof: !task.requires_proof }) })
    fetchAll()
  }

  const toggleTask = async (id: number, isActive: boolean) => {
    await fetch(`/api/admin/tasks/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ is_active: !isActive }) })
    fetchAll()
  }

  const deleteTask = async (id: number) => {
    if (!confirm('Delete this task?')) return
    const res = await fetch(`/api/admin/tasks/${id}`, { method: 'DELETE' })
    if (res.ok) fetchAll()
  }

  // Step/prompt handlers
  const cAddStep = () => { const v = createStep.trim(); if (!v) return; setForm(f => ({ ...f, how_to_steps: [...f.how_to_steps, v] })); setCreateStep("") }
  const cRemoveStep = (i: number) => setForm(f => ({ ...f, how_to_steps: f.how_to_steps.filter((_, j) => j !== i) }))
  const cMoveStep = (i: number, dir: 'up' | 'down') => { const arr = [...form.how_to_steps]; const ni = dir === 'up' ? i - 1 : i + 1; if (ni < 0 || ni >= arr.length) return;[arr[i], arr[ni]] = [arr[ni], arr[i]]; setForm(f => ({ ...f, how_to_steps: arr })) }
  const cAddPrompt = () => { const v = createPrompt.trim(); if (!v) return; setForm(f => ({ ...f, copy_prompts: [...f.copy_prompts, v] })); setCreatePrompt("") }
  const cRemovePrompt = (i: number) => setForm(f => ({ ...f, copy_prompts: f.copy_prompts.filter((_, j) => j !== i) }))
  const eAddStep = () => { const v = editStep.trim(); if (!v) return; setEditForm(f => ({ ...f, how_to_steps: [...(f.how_to_steps || []), v] })); setEditStep("") }
  const eRemoveStep = (i: number) => setEditForm(f => ({ ...f, how_to_steps: (f.how_to_steps || []).filter((_, j) => j !== i) }))
  const eMoveStep = (i: number, dir: 'up' | 'down') => { const arr = [...(editForm.how_to_steps || [])]; const ni = dir === 'up' ? i - 1 : i + 1; if (ni < 0 || ni >= arr.length) return;[arr[i], arr[ni]] = [arr[ni], arr[i]]; setEditForm(f => ({ ...f, how_to_steps: arr })) }
  const eAddPrompt = () => { const v = editPrompt.trim(); if (!v) return; setEditForm(f => ({ ...f, copy_prompts: [...(f.copy_prompts || []), v] })); setEditPrompt("") }
  const eRemovePrompt = (i: number) => setEditForm(f => ({ ...f, copy_prompts: (f.copy_prompts || []).filter((_, j) => j !== i) }))

  const filtered = tasks
    .filter(t => filterStatus === 'all' || (filterStatus === 'active' ? t.is_active : !t.is_active))
    .filter(t => t.title.toLowerCase().includes(search.toLowerCase()) || (t.app_name || '').toLowerCase().includes(search.toLowerCase()))

  const taskCompletions = selectedTask ? completions.filter(c => c.task_id === selectedTask.id) : []
  const getConversionColor = (r: string) => { const n = parseFloat(r); return n >= 50 ? 'text-green-600' : n >= 20 ? 'text-yellow-600' : 'text-red-500' }

  const EditFormBlock = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div><Label htmlFor="et">Title *</Label><Input id="et" value={editForm.title || ''} onChange={e => setEditForm({ ...editForm, title: e.target.value })} className="mt-1" /></div>
      <div><Label htmlFor="eu">Task URL *</Label><Input id="eu" value={editForm.task_url || ''} onChange={e => setEditForm({ ...editForm, task_url: e.target.value })} className="mt-1" /></div>
      <div><Label htmlFor="ean">App Name</Label><Input id="ean" value={editForm.app_name || ''} onChange={e => setEditForm({ ...editForm, app_name: e.target.value })} className="mt-1" /></div>
      <div><Label htmlFor="eai">App Icon URL</Label><Input id="eai" value={editForm.app_icon_url || ''} onChange={e => setEditForm({ ...editForm, app_icon_url: e.target.value })} className="mt-1" /></div>
      <div><Label htmlFor="enp">Network Payout (₹)</Label><Input id="enp" type="number" value={editForm.network_payout || ''} onChange={e => setEditForm({ ...editForm, network_payout: parseFloat(e.target.value) })} className="mt-1" /></div>
      <div><Label htmlFor="eup">User Payout (₹)</Label><Input id="eup" type="number" value={editForm.user_payout || ''} onChange={e => setEditForm({ ...editForm, user_payout: parseFloat(e.target.value) })} className="mt-1" /></div>
      <div>
        <Label htmlFor="eat">Action Type</Label>
        <select id="eat" title="Action Type" value={editForm.action_type || 'install'} onChange={e => setEditForm({ ...editForm, action_type: e.target.value })} className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-400">
          <option value="install">App Install</option><option value="signup">Sign Up</option><option value="survey">Survey</option><option value="review">Review</option><option value="time_spent">Time Spent</option><option value="other">Other</option>
        </select>
      </div>
      <div><Label htmlFor="emc">Max Completions</Label><Input id="emc" type="number" min="1" placeholder="Unlimited" value={editForm.max_completions ?? ''} onChange={e => setEditForm({ ...editForm, max_completions: e.target.value ? parseInt(e.target.value) : null })} className="mt-1" /></div>
      <div className="md:col-span-2">
        <Label htmlFor="ed">Description</Label>
        <textarea id="ed" value={editForm.description || ''} onChange={e => setEditForm({ ...editForm, description: e.target.value })} placeholder="Describe the task..." rows={3} className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 text-sm bg-white resize-y focus:outline-none focus:ring-2 focus:ring-blue-400 min-h-[80px]" />
      </div>
      <DetailPageToggle value={editForm.has_detail_page ?? false} onChange={v => setEditForm(f => ({ ...f, has_detail_page: v }))} />
      <StepsSection steps={editForm.how_to_steps || []} stepInput={editStep} onStepInputChange={setEditStep} onAddStep={eAddStep} onRemoveStep={eRemoveStep} onMoveStep={eMoveStep} />
      <PromptsSection prompts={editForm.copy_prompts || []} promptInput={editPrompt} onPromptInputChange={setEditPrompt} onAddPrompt={eAddPrompt} onRemovePrompt={eRemovePrompt} />
      <div className="md:col-span-2 p-4 bg-orange-50 border border-orange-200 rounded-xl space-y-3">
        <div className="flex items-center justify-between">
          <div><p className="font-medium text-gray-900 text-sm">Screenshot Proof Required</p><p className="text-xs text-gray-500">Users must upload proof to get paid</p></div>
          <button aria-label="Toggle proof" onClick={() => setEditForm({ ...editForm, requires_proof: !editForm.requires_proof })} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors flex-shrink-0 ${editForm.requires_proof ? 'bg-orange-500' : 'bg-gray-300'}`}>
            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow ${editForm.requires_proof ? 'translate-x-6' : 'translate-x-1'}`} />
          </button>
        </div>
        {editForm.requires_proof && <div><Label htmlFor="epi">Proof Instructions</Label><Input id="epi" value={editForm.proof_instructions || ''} onChange={e => setEditForm({ ...editForm, proof_instructions: e.target.value })} placeholder="e.g. Screenshot showing the completed action" className="mt-1" /></div>}
      </div>
    </div>
  )

  return (
    <div className="space-y-6">

      {/* ── Task Preview Modal ── */}
      {previewTask && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <p className="font-bold text-gray-900 text-sm">User Preview</p>
              <button aria-label="Close preview" onClick={() => setPreviewTask(null)} className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center hover:bg-gray-200"><X className="w-4 h-4" /></button>
            </div>
            <div className="p-4 space-y-4">
              {/* Task card preview */}
              <div className="border border-gray-200 rounded-2xl p-4">
                <div className="flex items-start gap-3">
                  {previewTask.app_icon_url
                    ? <img src={previewTask.app_icon_url} alt="" className="w-12 h-12 rounded-2xl object-cover border border-gray-200 flex-shrink-0" />
                    : <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center flex-shrink-0 text-2xl">🎯</div>
                  }
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-gray-900 text-sm">{previewTask.title}</p>
                    {previewTask.app_name && <p className="text-xs text-gray-500">{previewTask.app_name}</p>}
                    <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{previewTask.action_type}</span>
                      {previewTask.requires_proof && <span className="text-xs bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full">📸 Proof</span>}
                      {previewTask.has_detail_page && <span className="text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full">📄 Guide</span>}
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="flex items-center gap-0.5 justify-end">
                      <IndianRupee className="w-4 h-4 text-green-600" />
                      <span className="text-2xl font-black text-green-600">{Number(previewTask.user_payout).toFixed(0)}</span>
                    </div>
                    <p className="text-xs text-gray-400">reward</p>
                  </div>
                </div>
                {previewTask.description && <p className="text-xs text-gray-500 mt-3 leading-relaxed">{previewTask.description}</p>}
                <div className="mt-3 w-full bg-blue-600 text-white rounded-xl h-10 flex items-center justify-center text-sm font-semibold">
                  {previewTask.has_detail_page ? '📄 View Task Guide' : `▶ Start & Earn ₹${Number(previewTask.user_payout).toFixed(0)}`}
                </div>
              </div>

              {/* Steps preview */}
              {previewTask.how_to_steps?.length > 0 && (
                <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
                  <p className="text-xs font-bold text-purple-700 mb-3">How-To Steps</p>
                  {previewTask.how_to_steps.map((s, i) => (
                    <div key={i} className="flex items-start gap-2 mb-2 last:mb-0">
                      <span className="w-5 h-5 rounded-full bg-purple-600 text-white text-xs font-bold flex items-center justify-center flex-shrink-0">{i + 1}</span>
                      <p className="text-xs text-gray-700">{s}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Prompts preview */}
              {previewTask.copy_prompts?.length > 0 && (
                <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                  <p className="text-xs font-bold text-green-700 mb-3">Copy Prompts ({previewTask.copy_prompts.length})</p>
                  {previewTask.copy_prompts.slice(0, 2).map((p, i) => (
                    <div key={i} className="bg-white border border-green-100 rounded-lg px-3 py-2 mb-2 last:mb-0">
                      <p className="text-xs text-gray-600">{p}</p>
                    </div>
                  ))}
                  {previewTask.copy_prompts.length > 2 && <p className="text-xs text-gray-400">+{previewTask.copy_prompts.length - 2} more variations</p>}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Edit Modal ── */}
      {editingTask && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <div><h2 className="text-xl font-bold text-gray-900">Edit Task</h2><p className="text-xs text-gray-500 mt-0.5">{editingTask.title}</p></div>
              <button aria-label="Close" onClick={() => setEditingTask(null)} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200"><X className="w-4 h-4" /></button>
            </div>
            <EditFormBlock />
            <div className="flex gap-3 mt-6">
              <Button onClick={saveEdit} disabled={savingEdit} className="bg-blue-600 hover:bg-blue-700 flex-1"><Save className="w-4 h-4 mr-2" />{savingEdit ? 'Saving...' : 'Save Changes'}</Button>
              <Button variant="outline" onClick={() => setEditingTask(null)} className="flex-1">Cancel</Button>
            </div>
          </div>
        </div>
      )}

      {/* ── Broadcast Modal ── */}
      {showBroadcast && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <div><h2 className="text-lg font-bold text-gray-900">Broadcast Notification</h2><p className="text-xs text-gray-500">Send to all users</p></div>
              <button aria-label="Close" onClick={() => setShowBroadcast(false)} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200"><X className="w-4 h-4" /></button>
            </div>
            <div className="space-y-3">
              <div><Label htmlFor="bn">Title *</Label><Input id="bn" value={broadcastTitle} onChange={e => setBroadcastTitle(e.target.value)} placeholder="e.g. New tasks available!" className="mt-1" /></div>
              <div>
                <Label htmlFor="bb">Message *</Label>
                <textarea id="bb" value={broadcastBody} onChange={e => setBroadcastBody(e.target.value)} placeholder="e.g. 5 new tasks just dropped. Earn up to ₹500 today!" rows={3} className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 text-sm bg-white resize-none focus:outline-none focus:ring-2 focus:ring-blue-400" />
              </div>
              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-yellow-500 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-yellow-700">This will send push + in-app notification to ALL users. Use sparingly.</p>
              </div>
              <div className="flex gap-3">
                <Button onClick={sendBroadcast} disabled={broadcasting} className="bg-blue-600 hover:bg-blue-700 flex-1">
                  <Send className="w-4 h-4 mr-2" />{broadcasting ? 'Sending...' : 'Send to All Users'}
                </Button>
                <Button variant="outline" onClick={() => setShowBroadcast(false)} className="flex-1">Cancel</Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Header ── */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div><h1 className="text-2xl font-bold text-gray-900">Tasks</h1><p className="text-gray-600 mt-1">Manage earning tasks and track performance</p></div>
        <div className="flex items-center gap-2 flex-wrap">
          <Button variant="outline" onClick={() => setShowBroadcast(true)} className="text-sm">
            <Send className="w-4 h-4 mr-2" /> Broadcast
          </Button>
          <Button variant="outline" onClick={exportCSV} className="text-sm">
            <Download className="w-4 h-4 mr-2" /> Export CSV
          </Button>
          <Button onClick={() => setShowForm(!showForm)} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2" /> Add Task
          </Button>
        </div>
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
              <div className="flex items-center gap-1 mb-1"><s.icon className={`w-3 h-3 text-${s.color}-600`} /><p className={`text-xs text-${s.color}-600 font-medium`}>{s.label}</p></div>
              <p className={`text-xl font-bold text-${s.color}-700`}>{s.value}</p>
              <p className={`text-xs text-${s.color}-500`}>{s.sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ── Tabs ── */}
      <div className="flex gap-1 p-1 bg-gray-100 rounded-xl w-fit">
        <button onClick={() => setActiveTab('tasks')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'tasks' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500'}`}><Target className="w-4 h-4 inline mr-1" /> Tasks</button>
        <button onClick={() => setActiveTab('analytics')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'analytics' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500'}`}><BarChart3 className="w-4 h-4 inline mr-1" /> Analytics</button>
      </div>

      {/* ── Create Form ── */}
      {showForm && (
        <Card className="border border-blue-200 bg-blue-50/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">New Task</h2>
              <button aria-label="Close" onClick={() => setShowForm(false)} className="w-8 h-8 rounded-full bg-white flex items-center justify-center hover:bg-gray-100 border border-gray-200"><X className="w-4 h-4 text-gray-500" /></button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><Label htmlFor="ct">Title *</Label><Input id="ct" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="e.g. Install and open the app" className="mt-1" /></div>
              <div><Label htmlFor="cu">Task URL *</Label><Input id="cu" value={form.task_url} onChange={e => setForm({ ...form, task_url: e.target.value })} placeholder="https://..." className="mt-1" /></div>
              <div><Label htmlFor="can">App Name</Label><Input id="can" value={form.app_name} onChange={e => setForm({ ...form, app_name: e.target.value })} placeholder="App/Task name" className="mt-1" /></div>
              <div><Label htmlFor="cai">App Icon URL</Label><Input id="cai" value={form.app_icon_url} onChange={e => setForm({ ...form, app_icon_url: e.target.value })} placeholder="https://..." className="mt-1" /></div>
              <div><Label htmlFor="cnp">Network Payout (₹) *</Label><Input id="cnp" type="number" value={form.network_payout} onChange={e => setForm({ ...form, network_payout: e.target.value })} placeholder="0.00" className="mt-1" /></div>
              <div><Label htmlFor="cup">User Payout (₹) *</Label><Input id="cup" type="number" value={form.user_payout} onChange={e => setForm({ ...form, user_payout: e.target.value })} placeholder="0.00" className="mt-1" /></div>
              <div>
                <Label htmlFor="cat">Action Type</Label>
                <select id="cat" title="Action Type" value={form.action_type} onChange={e => setForm({ ...form, action_type: e.target.value })} className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-400">
                  <option value="install">App Install</option><option value="signup">Sign Up</option><option value="survey">Survey</option><option value="review">Review</option><option value="time_spent">Time Spent</option><option value="other">Other</option>
                </select>
              </div>
              <div><Label htmlFor="cco">Country</Label><Input id="cco" value={form.country} onChange={e => setForm({ ...form, country: e.target.value })} placeholder="IN" className="mt-1" /></div>
              <div className="md:col-span-2">
                <Label htmlFor="cd">Description</Label>
                <textarea id="cd" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Describe what the user needs to do..." rows={3} className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 text-sm bg-white resize-y focus:outline-none focus:ring-2 focus:ring-blue-400 min-h-[80px]" />
              </div>
              <div className="md:col-span-2 p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <div className="flex items-center gap-2"><Users className="w-4 h-4 text-slate-600" /><p className="font-medium text-gray-900 text-sm">Completion Limit</p><span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">Optional</span></div>
                <Input id="cmc" type="number" min="1" placeholder="Leave empty for unlimited" value={form.max_completions} onChange={e => setForm({ ...form, max_completions: e.target.value })} className="bg-white" />
                {form.max_completions && <p className="text-xs text-slate-600 font-medium">✓ Only {form.max_completions} users can complete</p>}
              </div>
              <DetailPageToggle value={form.has_detail_page} onChange={v => setForm(f => ({ ...f, has_detail_page: v }))} />
              <StepsSection steps={form.how_to_steps} stepInput={createStep} onStepInputChange={setCreateStep} onAddStep={cAddStep} onRemoveStep={cRemoveStep} onMoveStep={cMoveStep} />
              <PromptsSection prompts={form.copy_prompts} promptInput={createPrompt} onPromptInputChange={setCreatePrompt} onAddPrompt={cAddPrompt} onRemovePrompt={cRemovePrompt} />
              <div className="md:col-span-2 p-4 bg-orange-50 border border-orange-200 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <div><p className="font-medium text-gray-900 text-sm">Require Screenshot Proof</p><p className="text-xs text-gray-500">Users must upload proof to get paid</p></div>
                  <button aria-label="Toggle proof" onClick={() => setForm({ ...form, requires_proof: !form.requires_proof })} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors flex-shrink-0 ${form.requires_proof ? 'bg-orange-500' : 'bg-gray-300'}`}>
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow ${form.requires_proof ? 'translate-x-6' : 'translate-x-1'}`} />
                  </button>
                </div>
                {form.requires_proof && <div><Label htmlFor="cpi">Proof Instructions</Label><Input id="cpi" value={form.proof_instructions} onChange={e => setForm({ ...form, proof_instructions: e.target.value })} placeholder="e.g. Screenshot showing your completed action" className="mt-1" /></div>}
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <Button onClick={createTask} disabled={submitting} className="bg-blue-600 hover:bg-blue-700">{submitting ? 'Creating...' : 'Create Task'}</Button>
              <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === 'tasks' && (
        <>
          {/* Search + Filter + Bulk */}
          <div className="flex gap-3 flex-wrap items-center">
            <div className="relative flex-1 min-w-48">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input placeholder="Search tasks..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10" />
            </div>
            <div className="flex gap-1 p-1 bg-gray-100 rounded-lg">
              {(['all', 'active', 'inactive'] as const).map(f => (
                <button key={f} onClick={() => setFilterStatus(f)} className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${filterStatus === f ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500'}`}>{f.charAt(0).toUpperCase() + f.slice(1)}</button>
              ))}
            </div>
          </div>

          {/* Bulk action bar */}
          {selectedIds.size > 0 && (
            <div className="flex items-center gap-3 bg-blue-50 border border-blue-200 rounded-xl px-4 py-3">
              <span className="text-sm font-semibold text-blue-700">{selectedIds.size} selected</span>
              <select
                value={bulkAction}
                onChange={e => setBulkAction(e.target.value)}
                title="Bulk action"
                className="border border-blue-300 rounded-lg px-3 py-1.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                <option value="">Choose action...</option>
                <option value="activate">Activate</option>
                <option value="deactivate">Deactivate</option>
                <option value="delete">Delete</option>
              </select>
              <Button onClick={executeBulkAction} disabled={!bulkAction || bulkLoading} size="sm" className="bg-blue-600 hover:bg-blue-700">
                {bulkLoading ? 'Applying...' : 'Apply'}
              </Button>
              <button onClick={() => setSelectedIds(new Set())} className="ml-auto text-xs text-gray-500 hover:text-gray-700">Clear selection</button>
            </div>
          )}

          {/* Tasks Table */}
          <Card className="border border-gray-200">
            <CardContent className="p-0">
              {loading ? <div className="p-8 text-center text-gray-500">Loading...</div> : filtered.length === 0 ? <div className="p-8 text-center text-gray-500">No tasks found.</div> : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-3 py-3 w-8">
                          <button onClick={toggleSelectAll} aria-label="Select all" className="text-gray-400 hover:text-blue-600">
                            {selectedIds.size === filtered.length && filtered.length > 0 ? <CheckSquare className="w-4 h-4 text-blue-600" /> : <Square className="w-4 h-4" />}
                          </button>
                        </th>
                        <th className="w-6 px-2 py-3" />
                        {['Task', 'Payouts', 'Clicks', 'Slots', 'CVR', 'Features', 'Status', 'Actions'].map(h => (
                          <th key={h} className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {filtered.map(task => (
                        <tr
                          key={task.id}
                          draggable
                          onDragStart={() => handleDragStart(task.id)}
                          onDragOver={e => handleDragOver(e, task.id)}
                          onDrop={() => handleDrop(task.id)}
                          onDragEnd={() => { setDragId(null); setDragOverId(null) }}
                          className={`hover:bg-gray-50 transition-colors ${dragOverId === task.id ? 'bg-blue-50 border-t-2 border-blue-400' : ''} ${dragId === task.id ? 'opacity-50' : ''}`}
                        >
                          <td className="px-3 py-3">
                            <button onClick={() => toggleSelect(task.id)} aria-label="Select task" className="text-gray-400 hover:text-blue-600">
                              {selectedIds.has(task.id) ? <CheckSquare className="w-4 h-4 text-blue-600" /> : <Square className="w-4 h-4" />}
                            </button>
                          </td>
                          <td className="px-2 py-3 cursor-grab active:cursor-grabbing">
                            <GripVertical className="w-4 h-4 text-gray-300 hover:text-gray-500" />
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              {task.app_icon_url ? <img src={task.app_icon_url} alt="" className="w-10 h-10 rounded-lg object-cover border border-gray-200 flex-shrink-0" /> : <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0"><Target className="w-5 h-5 text-gray-400" /></div>}
                              <div>
                                <p className="text-sm font-medium text-gray-900">{task.title}</p>
                                <p className="text-xs text-gray-500">{task.app_name || task.action_type}</p>
                                <a href={task.task_url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-500 hover:underline flex items-center gap-1 mt-0.5"><ExternalLink className="w-3 h-3" /> View</a>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <p className="text-xs text-gray-500">Net: <span className="font-medium text-gray-900">₹{task.network_payout}</span></p>
                            <p className="text-xs text-gray-500">User: <span className="font-medium text-green-600">₹{task.user_payout}</span></p>
                            <p className="text-xs text-gray-500">Profit: <span className="font-medium text-blue-600">₹{(Number(task.network_payout) - Number(task.user_payout)).toFixed(2)}</span></p>
                          </td>
                          <td className="px-4 py-3"><div className="flex items-center gap-1"><MousePointer className="w-3 h-3 text-purple-500" /><span className="text-sm font-bold">{task.click_count || 0}</span></div></td>
                          <td className="px-4 py-3 min-w-[120px]">
                            {task.max_completions ? (
                              <div>
                                <div className="flex items-center gap-1 mb-1"><Users className="w-3 h-3 text-blue-500" /><span className="text-sm font-bold">{task.completion_count || 0}</span><span className="text-xs text-gray-400">/ {task.max_completions}</span></div>
                                <SlotsBar task={task} />
                              </div>
                            ) : <span className="text-sm font-bold">{task.completion_count || 0}</span>}
                            <button aria-label="Toggle completions" onClick={() => setSelectedTask(selectedTask?.id === task.id ? null : task)} className="text-blue-500 hover:text-blue-700 mt-1">
                              {selectedTask?.id === task.id ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                            </button>
                          </td>
                          <td className="px-4 py-3"><span className={`text-sm font-bold ${getConversionColor(task.conversion_rate || '0')}`}>{task.conversion_rate}%</span></td>
                          <td className="px-4 py-3">
                            <div className="flex flex-col gap-1">
                              <button title={task.requires_proof ? 'Proof ON' : 'Proof OFF'} onClick={() => toggleProofRequired(task)}
                                className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium w-fit ${task.requires_proof ? 'bg-orange-100 text-orange-700 hover:bg-orange-200' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>
                                {task.requires_proof ? <Camera className="w-3 h-3" /> : <CameraOff className="w-3 h-3" />} Proof
                              </button>
                              {task.has_detail_page && <span className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium bg-blue-100 text-blue-700 w-fit"><LayoutTemplate className="w-3 h-3" /> Detail</span>}
                              {task.how_to_steps?.length > 0 && <span className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium bg-purple-100 text-purple-700 w-fit"><ListOrdered className="w-3 h-3" /> {task.how_to_steps.length} steps</span>}
                              {task.copy_prompts?.length > 0 && <span className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium bg-green-100 text-green-700 w-fit"><Copy className="w-3 h-3" /> {task.copy_prompts.length} prompts</span>}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <button onClick={() => toggleTask(task.id, task.is_active)}>
                              <Badge className={`cursor-pointer ${task.is_active ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>{task.is_active ? 'Active' : 'Inactive'}</Badge>
                            </button>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-1">
                              <Button variant="ghost" size="sm" onClick={() => setPreviewTask(task)} className="text-gray-500 hover:bg-gray-100" title="Preview"><Eye className="w-4 h-4" /></Button>
                              <Button variant="ghost" size="sm" onClick={() => duplicateTask(task)} className="text-green-600 hover:bg-green-50" title="Duplicate"><Copy className="w-4 h-4" /></Button>
                              <Button variant="ghost" size="sm" onClick={() => startEdit(task)} className="text-blue-600 hover:bg-blue-50" title="Edit"><Edit2 className="w-4 h-4" /></Button>
                              <Button variant="ghost" size="sm" onClick={() => deleteTask(task.id)} className="text-red-600 hover:bg-red-50" title="Delete"><Trash2 className="w-4 h-4" /></Button>
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

          {/* Completions panel */}
          {selectedTask && (
            <Card className="border border-blue-200 bg-blue-50">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">Completions — {selectedTask.title}</CardTitle>
                  <Button variant="ghost" size="icon" aria-label="Close" onClick={() => setSelectedTask(null)}><X className="w-4 h-4" /></Button>
                </div>
              </CardHeader>
              <CardContent>
                {taskCompletions.length === 0 ? <p className="text-sm text-gray-500 text-center py-4">No completions yet</p> : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-white/60"><tr>{['User', 'Status', 'Earned', 'Date'].map(h => <th key={h} className="text-left px-3 py-2 text-xs font-medium text-gray-500">{h}</th>)}</tr></thead>
                      <tbody className="divide-y divide-blue-100">
                        {taskCompletions.map(c => (
                          <tr key={c.id} className="bg-white/40">
                            <td className="px-3 py-2">{c.user_email || `User #${c.user_id}`}</td>
                            <td className="px-3 py-2">
                              <Badge className={c.status === 'verified' ? 'bg-green-100 text-green-700' : c.status === 'pending_verification' ? 'bg-orange-100 text-orange-700' : c.status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}>{c.status}</Badge>
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
          {tasks.length === 0 ? <Card><CardContent className="p-8 text-center text-gray-500">No tasks yet</CardContent></Card> : (
            <div className="space-y-3">
              {[...tasks].sort((a, b) => (b.click_count || 0) - (a.click_count || 0)).map(task => {
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
                              {task.has_detail_page && <span className="text-xs bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded">📄 Detail</span>}
                              {task.max_completions && <span className="text-xs bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded flex items-center gap-1"><Users className="w-2.5 h-2.5" /> {task.completion_count}/{task.max_completions}</span>}
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
                        <div className="w-full bg-gray-100 rounded-full h-2"><div className="bg-purple-500 h-2 rounded-full" style={{ width: `${((task.click_count || 0) / maxClicks) * 100}%` }} /></div>
                        <div className="flex justify-between text-xs text-gray-400"><span>Completions</span><span>{task.completion_count || 0}</span></div>
                        <div className="w-full bg-gray-100 rounded-full h-2"><div className="bg-green-500 h-2 rounded-full" style={{ width: `${((task.completion_count || 0) / maxClicks) * 100}%` }} /></div>
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