"use client"

import { useState, useMemo, useRef, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  ArrowLeft, ExternalLink, Copy, CheckCircle2,
  IndianRupee, Clock, ListOrdered, Sparkles, Camera,
  AlertCircle, RefreshCw, ShieldCheck, Zap, X,
  Upload, Image as ImageIcon, ChevronRight,
  Trophy, Star, Info, Lock, Unlock
} from "lucide-react"

interface TaskDetailProps {
  task: {
    id: number
    title: string
    description: string | null
    task_url: string
    app_name: string | null
    app_icon_url: string | null
    action_type: string
    user_payout: number
    requires_proof: boolean
    proof_instructions: string | null
    how_to_steps: string[]
    copy_prompts: string[]
    has_detail_page: boolean
  }
  userId: number
}

type Stage = 'idle' | 'opened' | 'confirming' | 'completing' | 'proof' | 'uploading' | 'success' | 'error'

const ACTION_META: Record<string, { emoji: string; label: string; color: string; bg: string }> = {
  install:  { emoji: '📲', label: 'Install App',    color: 'text-blue-600',   bg: 'bg-blue-50'   },
  signup:   { emoji: '✍️', label: 'Sign Up',        color: 'text-purple-600', bg: 'bg-purple-50' },
  survey:   { emoji: '📋', label: 'Survey',         color: 'text-orange-600', bg: 'bg-orange-50' },
  review:   { emoji: '⭐', label: 'Write Review',   color: 'text-yellow-600', bg: 'bg-yellow-50' },
  purchase: { emoji: '🛍️', label: 'Try Product',   color: 'text-pink-600',   bg: 'bg-pink-50'   },
}

function getActionMeta(type: string) {
  return ACTION_META[type] || { emoji: '🎯', label: 'Complete Task', color: 'text-blue-600', bg: 'bg-blue-50' }
}

// ── Step tracker component ──────────────────────────────────────────────────
function StepTracker({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex items-center gap-1.5">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className={`h-1.5 rounded-full transition-all duration-300 ${
            i < current ? 'bg-blue-600' : i === current ? 'bg-blue-400' : 'bg-gray-200'
          } ${i === current ? 'flex-1' : 'w-6'}`}
        />
      ))}
    </div>
  )
}

export function TaskDetailClient({ task, userId }: TaskDetailProps) {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [stage, setStage] = useState<Stage>('idle')
  const [copied, setCopied] = useState(false)
  const [promptIndex, setPromptIndex] = useState(0)
  const [completionId, setCompletionId] = useState<number | null>(null)
  const [proofFile, setProofFile] = useState<File | null>(null)
  const [proofPreview, setProofPreview] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string>('')
  const [checkedSteps, setCheckedSteps] = useState<Set<number>>(new Set())

  const meta = getActionMeta(task.action_type)

  const currentPrompt = useMemo(() => {
    if (!task.copy_prompts?.length) return null
    return task.copy_prompts[promptIndex % task.copy_prompts.length]
  }, [promptIndex, task.copy_prompts])

  const nextPrompt = useCallback(() => {
    setCopied(false)
    setPromptIndex(i => i + 1)
  }, [])

  const copyPrompt = useCallback(async (text: string) => {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text)
      } else {
        const el = document.createElement('textarea')
        el.value = text
        el.style.cssText = 'position:fixed;opacity:0;top:0;left:0'
        document.body.appendChild(el)
        el.select()
        document.execCommand('copy')
        document.body.removeChild(el)
      }
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    } catch {
      // Silent fail — user can manually copy
    }
  }, [])

  const toggleStep = useCallback((idx: number) => {
    setCheckedSteps(prev => {
      const next = new Set(prev)
      next.has(idx) ? next.delete(idx) : next.add(idx)
      return next
    })
  }, [])

  const handleOpenTask = useCallback(async () => {
    try {
      const res = await fetch(`/api/tasks/${task.id}/click`, { method: 'POST' })
      const data = await res.json()
      const url = data.redirect_url || task.task_url
      // Sanitize URL — only allow http/https
      if (!url.startsWith('http://') && !url.startsWith('https://')) return
      window.open(url, '_blank', 'noopener,noreferrer')
    } catch {
      if (task.task_url.startsWith('http')) {
        window.open(task.task_url, '_blank', 'noopener,noreferrer')
      }
    }
    setStage('opened')
  }, [task.id, task.task_url])

  const handleConfirmComplete = useCallback(async (didComplete: boolean) => {
    if (!didComplete) { setStage('opened'); return }

    setStage('completing')
    setErrorMessage('')

    try {
      const response = await fetch(`/api/tasks/${task.id}/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })
      const data = await response.json()

      if (!response.ok) {
        setErrorMessage(data.error || 'Failed to complete task. Please try again.')
        setStage('error')
        return
      }

      if (task.requires_proof && data.completion?.id) {
        setCompletionId(data.completion.id)
        setStage('proof')
        return
      }

      setStage('success')
      setTimeout(() => router.push('/dashboard/tasks'), 2500)
    } catch {
      setErrorMessage('Network error. Please check your connection and try again.')
      setStage('error')
    }
  }, [task.id, task.requires_proof, router])

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
    if (!allowedTypes.includes(file.type)) {
      setErrorMessage('Please select a JPG, PNG or WebP image')
      return
    }

    // Validate size — 5MB max
    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage('Image must be under 5MB')
      return
    }

    setErrorMessage('')
    setProofFile(file)

    const reader = new FileReader()
    reader.onload = e => setProofPreview(e.target?.result as string)
    reader.onerror = () => setErrorMessage('Failed to read file')
    reader.readAsDataURL(file)
  }, [])

  const handleUploadProof = useCallback(async () => {
    if (!proofFile || !completionId) return

    setStage('uploading')
    setErrorMessage('')

    try {
      const formData = new FormData()
      formData.append('screenshot', proofFile)

      const res = await fetch(`/api/task-completions/${completionId}/proof`, {
        method: 'POST',
        body: formData,
      })
      const data = await res.json()

      if (res.ok) {
        setStage('success')
        setTimeout(() => router.push('/dashboard/tasks'), 2500)
      } else {
        setErrorMessage(data.error || 'Upload failed. Please try again.')
        setStage('proof')
      }
    } catch {
      setErrorMessage('Network error. Please try again.')
      setStage('proof')
    }
  }, [proofFile, completionId, router])

  const allStepsChecked =
    task.how_to_steps?.length > 0 &&
    checkedSteps.size >= task.how_to_steps.length

  const totalStages = task.requires_proof ? 4 : 3
  const currentStageIndex =
    stage === 'idle' ? 0 :
    stage === 'opened' || stage === 'confirming' || stage === 'completing' ? 1 :
    stage === 'proof' || stage === 'uploading' ? 2 :
    stage === 'success' ? totalStages : 0

  // ── Success ──────────────────────────────────────────────────────────────
  if (stage === 'success') {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4 py-12">
        <div className="text-center max-w-sm w-full">
          {/* Animated success icon */}
          <div className="relative w-24 h-24 mx-auto mb-6">
            <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center animate-[scale_0.3s_ease-out]">
              <CheckCircle2 className="w-12 h-12 text-green-600" />
            </div>
            <div className="absolute -top-1 -right-1 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center text-sm animate-bounce">
              🎉
            </div>
          </div>

          <h2 className="text-2xl font-black text-gray-900 mb-2">
            {task.requires_proof ? 'Proof Submitted!' : 'Task Completed!'}
          </h2>
          <p className="text-gray-500 mb-6 leading-relaxed text-sm">
            {task.requires_proof
              ? 'Your screenshot is under review. You\'ll be notified once verified — usually within 24 hours.'
              : `₹${Number(task.user_payout).toFixed(0)} has been added to your balance.`
            }
          </p>

          <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-5 mb-6 text-white">
            <div className="flex items-center justify-center gap-1.5 mb-1">
              <IndianRupee className="w-6 h-6" />
              <span className="text-4xl font-black">{Number(task.user_payout).toFixed(0)}</span>
            </div>
            <p className="text-green-100 text-sm">
              {task.requires_proof ? 'Pending verification' : 'Added to balance'}
            </p>
          </div>

          <div className="flex items-center justify-center gap-2 text-xs text-gray-400">
            <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse" />
            Redirecting to tasks...
          </div>
        </div>
      </div>
    )
  }

  // ── Proof Upload ──────────────────────────────────────────────────────────
  if (stage === 'proof' || stage === 'uploading') {
    return (
      <div className="space-y-4 pb-32">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          Back
        </button>

        {/* Progress */}
        <StepTracker current={2} total={totalStages} />

        {/* Header */}
        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-6 text-white">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center flex-shrink-0">
              <Camera className="w-7 h-7 text-white" />
            </div>
            <div className="flex-1">
              <h1 className="text-lg font-black">Upload Proof</h1>
              <p className="text-orange-200 text-sm mt-0.5">Screenshot required to unlock payment</p>
            </div>
            <div className="text-right flex-shrink-0">
              <div className="flex items-center gap-0.5 justify-end">
                <IndianRupee className="w-4 h-4" />
                <span className="text-2xl font-black">{Number(task.user_payout).toFixed(0)}</span>
              </div>
              <p className="text-orange-200 text-xs">reward</p>
            </div>
          </div>
        </div>

        {/* Task info row */}
        <div className="bg-white border border-gray-100 rounded-2xl p-4 flex items-center gap-3 shadow-sm">
          {task.app_icon_url ? (
            <img
              src={task.app_icon_url}
              alt=""
              className="w-12 h-12 rounded-xl object-cover border border-gray-100 flex-shrink-0"
            />
          ) : (
            <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0 text-2xl">
              {meta.emoji}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="font-bold text-gray-900 text-sm truncate">{task.title}</p>
            {task.app_name && <p className="text-xs text-gray-400">{task.app_name}</p>}
          </div>
        </div>

        {/* Instructions */}
        <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-2xl p-4">
          <Info className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-bold text-amber-900 mb-1">What to screenshot</p>
            <p className="text-xs text-amber-700 leading-relaxed">
              {task.proof_instructions || 'Take a clear screenshot showing you completed the task. Make sure the required action is clearly visible.'}
            </p>
          </div>
        </div>

        {/* Upload area */}
        <div
          role="button"
          tabIndex={0}
          aria-label="Upload proof screenshot"
          onClick={() => fileInputRef.current?.click()}
          onKeyDown={e => e.key === 'Enter' && fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all select-none ${
            proofPreview
              ? 'border-green-400 bg-green-50'
              : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50 active:scale-[0.98]'
          }`}
        >
          {proofPreview ? (
            <div>
              <img
                src={proofPreview}
                alt="Proof preview"
                className="max-h-52 mx-auto rounded-xl object-contain shadow-md mb-3"
              />
              <div className="flex items-center justify-center gap-1.5 text-green-700">
                <CheckCircle2 className="w-4 h-4" />
                <span className="text-sm font-bold">Screenshot ready</span>
              </div>
              <p className="text-xs text-gray-400 mt-1">Tap to choose a different one</p>
            </div>
          ) : (
            <div>
              <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <ImageIcon className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-base font-bold text-gray-700">Tap to upload screenshot</p>
              <p className="text-xs text-gray-400 mt-1">JPG, PNG, WebP · Max 5MB</p>
            </div>
          )}
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          className="hidden"
          onChange={handleFileSelect}
          aria-label="Upload proof screenshot"
        />

        {/* Error */}
        {errorMessage && (
          <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl p-3">
            <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
            <p className="text-xs text-red-700">{errorMessage}</p>
          </div>
        )}

        {/* Actions */}
        <div className="fixed bottom-16 left-0 right-0 p-4 bg-white/95 backdrop-blur-md border-t border-gray-100 z-[60] lg:bottom-0">
          <div className="max-w-2xl mx-auto space-y-2">
            <Button
              onClick={handleUploadProof}
              disabled={!proofFile || stage === 'uploading'}
              className="w-full bg-orange-500 hover:bg-orange-600 active:bg-orange-700 rounded-2xl h-14 font-bold text-base shadow-lg disabled:opacity-50"
            >
              {stage === 'uploading' ? (
                <><Clock className="w-5 h-5 mr-2 animate-spin" />Uploading...</>
              ) : (
                <><Upload className="w-5 h-5 mr-2" />Submit Proof & Claim ₹{Number(task.user_payout).toFixed(0)}</>
              )}
            </Button>
            <button
              onClick={() => {
                setStage('success')
                setTimeout(() => router.push('/dashboard/tasks'), 2000)
              }}
              disabled={stage === 'uploading'}
              className="w-full text-xs text-gray-400 hover:text-gray-600 font-medium py-1 transition-colors"
            >
              Skip for now — upload later from Tasks tab
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ── Main Detail Page ──────────────────────────────────────────────────────
  return (
    <div className="space-y-4 pb-36 lg:pb-28">

      {/* ── Confirmation Dialog ── */}
      {(stage === 'confirming') && (
        <div
          className="fixed inset-0 bg-black/60 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
          onClick={() => setStage('opened')}
        >
          <div
            className="bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl w-full sm:max-w-sm p-6 pb-[calc(1.5rem+env(safe-area-inset-bottom))]"
            onClick={e => e.stopPropagation()}
          >
            {/* Drag handle — mobile */}
            <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-5 sm:hidden" />

            <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8 text-blue-600" />
            </div>

            <h3 className="text-lg font-black text-gray-900 text-center mb-2">
              Did you complete the task?
            </h3>
            <p className="text-sm text-gray-500 text-center mb-5 leading-relaxed">
              Only confirm if you genuinely completed it. False claims may result in account suspension.
            </p>

            {task.requires_proof && (
              <div className="flex items-center gap-2 bg-orange-50 border border-orange-200 rounded-xl px-3 py-2.5 mb-4">
                <Camera className="w-4 h-4 text-orange-500 flex-shrink-0" />
                <p className="text-xs text-orange-700 font-medium">
                  You'll need to upload a screenshot next to receive payment
                </p>
              </div>
            )}

            <div className="space-y-2">
              <Button
                onClick={() => handleConfirmComplete(true)}
                className="w-full bg-green-600 hover:bg-green-700 rounded-xl h-12 font-bold"
              >
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Yes, I completed it!
              </Button>
              <Button
                variant="outline"
                onClick={() => handleConfirmComplete(false)}
                className="w-full rounded-xl h-12"
              >
                <X className="w-4 h-4 mr-2" />
                Not yet — go back
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ── Back + Progress ── */}
      <div className="space-y-3">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          Back to Tasks
        </button>
        <StepTracker current={currentStageIndex} total={totalStages} />
      </div>

      {/* ── Task Header Card ── */}
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
        {/* Top gradient bar */}
        <div className={`h-1.5 ${stage === 'opened' ? 'bg-green-500' : 'bg-blue-600'}`} />

        <div className="p-5">
          <div className="flex items-start gap-4">
            {/* App icon */}
            {task.app_icon_url ? (
              <img
                src={task.app_icon_url}
                alt={task.app_name || task.title}
                className="w-16 h-16 rounded-2xl object-cover border border-gray-100 shadow-sm flex-shrink-0"
              />
            ) : (
              <div className={`w-16 h-16 rounded-2xl ${meta.bg} flex items-center justify-center flex-shrink-0 text-3xl shadow-sm`}>
                {meta.emoji}
              </div>
            )}

            <div className="flex-1 min-w-0">
              <h1 className="text-xl font-black text-gray-900 leading-tight">{task.title}</h1>
              {task.app_name && (
                <p className="text-sm text-gray-400 mt-0.5">{task.app_name}</p>
              )}
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ${meta.bg} ${meta.color}`}>
                  {meta.emoji} {meta.label}
                </span>
                {task.requires_proof ? (
                  <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-orange-50 text-orange-600">
                    <Camera className="w-3 h-3" /> Proof needed
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-green-50 text-green-600">
                    <Zap className="w-3 h-3" /> Instant credit
                  </span>
                )}
              </div>
            </div>

            {/* Reward */}
            <div className="flex-shrink-0 text-right">
              <div className="bg-green-50 border border-green-100 rounded-2xl px-3 py-2">
                <div className="flex items-center gap-0.5 justify-end">
                  <IndianRupee className="w-4 h-4 text-green-600" />
                  <span className="text-2xl font-black text-green-600">
                    {Number(task.user_payout).toFixed(0)}
                  </span>
                </div>
                <p className="text-[10px] text-green-500 font-medium text-right">reward</p>
              </div>
            </div>
          </div>

          {task.description && (
            <p className="text-sm text-gray-600 mt-4 leading-relaxed border-t border-gray-100 pt-4">
              {task.description}
            </p>
          )}

          {/* Trust badges */}
          <div className="flex items-center gap-4 mt-4 pt-3 border-t border-gray-50 flex-wrap">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-green-500" />
              <span className="text-xs text-gray-500 font-medium">Verified payout</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-blue-500" />
              <span className="text-xs text-gray-500 font-medium">2–10 mins</span>
            </div>
            {task.how_to_steps?.length > 0 && (
              <div className="flex items-center gap-1.5">
                <ListOrdered className="w-3.5 h-3.5 text-purple-500" />
                <span className="text-xs text-gray-500 font-medium">
                  {task.how_to_steps.length} step guide
                </span>
              </div>
            )}
            {stage === 'opened' && (
              <div className="flex items-center gap-1.5 ml-auto">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-xs text-green-600 font-semibold">Task opened</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── How-To Steps ── */}
      {task.how_to_steps?.length > 0 && (
        <div className="bg-white border border-purple-100 rounded-2xl shadow-sm overflow-hidden">
          <div className="bg-gradient-to-r from-purple-600 to-purple-700 px-5 py-4 flex items-center gap-3">
            <div className="w-8 h-8 bg-white/20 rounded-xl flex items-center justify-center">
              <ListOrdered className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1">
              <h2 className="text-base font-black text-white">How to Complete</h2>
              <p className="text-purple-200 text-xs">Check off each step as you go</p>
            </div>
            <div className="text-right">
              <span className="text-white/80 text-xs font-semibold">
                {checkedSteps.size}/{task.how_to_steps.length}
              </span>
            </div>
          </div>

          <div className="p-4 space-y-2">
            {task.how_to_steps.map((step, idx) => {
              const isChecked = checkedSteps.has(idx)
              return (
                <button
                  key={idx}
                  onClick={() => toggleStep(idx)}
                  className={`w-full flex items-start gap-3 p-3 rounded-xl border transition-all text-left ${
                    isChecked
                      ? 'bg-purple-50 border-purple-200'
                      : 'bg-gray-50 border-gray-100 hover:border-purple-200 hover:bg-purple-50/50'
                  }`}
                >
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 transition-all ${
                    isChecked ? 'bg-purple-600 shadow-sm' : 'bg-white border-2 border-gray-300'
                  }`}>
                    {isChecked ? (
                      <CheckCircle2 className="w-4 h-4 text-white" />
                    ) : (
                      <span className="text-xs font-black text-gray-400">{idx + 1}</span>
                    )}
                  </div>
                  <p className={`text-sm leading-relaxed flex-1 ${
                    isChecked ? 'text-purple-700 line-through opacity-60' : 'text-gray-700'
                  }`}>
                    {step}
                  </p>
                </button>
              )
            })}
          </div>

          {/* Progress bar */}
          {task.how_to_steps.length > 1 && (
            <div className="px-4 pb-4">
              <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-purple-500 rounded-full transition-all duration-300"
                  style={{ width: `${(checkedSteps.size / task.how_to_steps.length) * 100}%` }}
                />
              </div>
              {allStepsChecked && (
                <p className="text-xs text-purple-600 font-bold text-center mt-2">
                  ✅ All steps done — ready to claim!
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {/* ── Copy Prompt / Review Text ── */}
      {currentPrompt && (
        <div className="bg-white border border-green-100 rounded-2xl shadow-sm overflow-hidden">
          <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-5 py-4 flex items-center gap-3">
            <div className="w-8 h-8 bg-white/20 rounded-xl flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1">
              <h2 className="text-base font-black text-white">Suggested Text</h2>
              <p className="text-green-100 text-xs">Copy & paste when writing your review</p>
            </div>
            {task.copy_prompts.length > 1 && (
              <button
                onClick={nextPrompt}
                aria-label="Next suggestion"
                className="w-8 h-8 bg-white/20 hover:bg-white/30 rounded-xl flex items-center justify-center transition-colors"
              >
                <RefreshCw className="w-4 h-4 text-white" />
              </button>
            )}
          </div>

          <div className="p-4">
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-3 relative">
              <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap pr-8">
                {currentPrompt}
              </p>
            </div>

            <button
              onClick={() => copyPrompt(currentPrompt)}
              className={`w-full h-12 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all active:scale-[0.98] ${
                copied
                  ? 'bg-green-600 text-white shadow-md'
                  : 'bg-green-50 text-green-700 hover:bg-green-100 border border-green-200'
              }`}
            >
              {copied ? (
                <><CheckCircle2 className="w-4 h-4" />Copied! Paste it in your review</>
              ) : (
                <><Copy className="w-4 h-4" />Copy This Text</>
              )}
            </button>

            {task.copy_prompts.length > 1 && (
              <p className="text-xs text-center text-gray-400 mt-2">
                {promptIndex % task.copy_prompts.length + 1} of {task.copy_prompts.length} suggestions
              </p>
            )}
          </div>
        </div>
      )}

      {/* ── Proof reminder ── */}
      {task.requires_proof && stage !== 'opened' && (
        <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-2xl p-4">
          <Camera className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-bold text-amber-900">Screenshot required</p>
            <p className="text-xs text-amber-700 mt-0.5 leading-relaxed">
              {task.proof_instructions || 'Take a clear screenshot after completing the task. You\'ll upload it to receive payment.'}
            </p>
          </div>
        </div>
      )}

      {/* ── Error state ── */}
      {stage === 'error' && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-bold text-red-900">Something went wrong</p>
              <p className="text-xs text-red-700 mt-0.5">{errorMessage}</p>
            </div>
            <button
              onClick={() => setStage('opened')}
              className="text-xs text-red-600 font-bold hover:underline flex-shrink-0"
            >
              Try again
            </button>
          </div>
        </div>
      )}

      {/* ── Sticky Bottom CTA ── */}
      <div className="fixed bottom-16 left-0 right-0 px-4 pt-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] bg-white/95 backdrop-blur-md border-t border-gray-100 z-[60] lg:bottom-0 lg:pb-4">
        <div className="max-w-2xl mx-auto space-y-2">

          {stage === 'idle' && (
            <>
              <Button
                onClick={handleOpenTask}
                className="w-full bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-2xl h-14 font-black text-base shadow-xl hover:shadow-2xl transition-all"
              >
                <ExternalLink className="w-5 h-5 mr-2" />
                Open Task & Earn ₹{Number(task.user_payout).toFixed(0)}
              </Button>
              <p className="text-xs text-center text-gray-400">
                Opens in new tab · Complete the task · Come back to claim
              </p>
            </>
          )}

          {(stage === 'opened' || stage === 'confirming') && (
            <>
              <Button
                onClick={() => setStage('confirming')}
                className="w-full bg-green-600 hover:bg-green-700 active:bg-green-800 rounded-2xl h-14 font-black text-base shadow-xl transition-all"
              >
                <CheckCircle2 className="w-5 h-5 mr-2" />
                I've Completed — Claim ₹{Number(task.user_payout).toFixed(0)}
              </Button>
              <button
                onClick={handleOpenTask}
                className="w-full text-xs text-blue-600 hover:text-blue-700 font-semibold flex items-center justify-center gap-1.5 py-1 transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                Open task again
              </button>
            </>
          )}

          {stage === 'completing' && (
            <Button
              disabled
              className="w-full bg-blue-600 rounded-2xl h-14 font-bold text-base opacity-80"
            >
              <Clock className="w-5 h-5 mr-2 animate-spin" />
              Saving your completion...
            </Button>
          )}

          {stage === 'error' && (
            <Button
              onClick={() => setStage('idle')}
              className="w-full bg-gray-900 hover:bg-gray-800 rounded-2xl h-14 font-bold text-base"
            >
              Start Over
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}