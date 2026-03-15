"use client"

import { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  ArrowLeft, ExternalLink, Copy, CheckCircle2,
  IndianRupee, Clock, ListOrdered, Sparkles, Camera,
  AlertCircle, RefreshCw, ShieldCheck, Zap, X, HelpCircle
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

export function TaskDetailClient({ task, userId }: TaskDetailProps) {
  const router = useRouter()
  const [copied, setCopied] = useState(false)
  const [taskOpened, setTaskOpened] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [completing, setCompleting] = useState(false)
  const [promptSeed, setPromptSeed] = useState(0)

  const randomPrompt = useMemo(() => {
    if (!task.copy_prompts?.length) return null
    const idx = Math.floor(Math.random() * task.copy_prompts.length)
    return task.copy_prompts[idx]
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [promptSeed, task.copy_prompts])

  const copyPrompt = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
    } catch {
      const el = document.createElement('textarea')
      el.value = text
      el.style.position = 'fixed'
      el.style.opacity = '0'
      document.body.appendChild(el)
      el.select()
      document.execCommand('copy')
      document.body.removeChild(el)
    }
    setCopied(true)
    setTimeout(() => setCopied(false), 2500)
  }

  const handleOpenTask = async () => {
    try {
      const clickRes = await fetch(`/api/tasks/${task.id}/click`, { method: 'POST' })
      const clickData = await clickRes.json()
      window.open(clickData.redirect_url || task.task_url, "_blank", "noopener,noreferrer")
    } catch {
      window.open(task.task_url, "_blank", "noopener,noreferrer")
    }
    setTaskOpened(true)
  }

  const handleConfirmComplete = async (didComplete: boolean) => {
    setShowConfirm(false)
    if (!didComplete) return

    setCompleting(true)
    try {
      const response = await fetch(`/api/tasks/${task.id}/complete`, { method: "POST" })
      const data = await response.json()
      setCompleting(false)
      if (!response.ok) {
        alert(data.error || "Failed to complete task")
        return
      }
      router.push("/dashboard/tasks")
    } catch {
      setCompleting(false)
      alert("Failed to complete task. Please try again.")
    }
  }

  const getActionTypeIcon = (type: string) => {
    switch (type) {
      case 'install': return '📲'
      case 'signup': return '✍️'
      case 'survey': return '📋'
      case 'review': return '⭐'
      case 'time_spent': return '⏱️'
      default: return '🎯'
    }
  }

  return (
    <div className="space-y-4 pb-28">

      {/* ── Completion Confirmation Dialog ── */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl w-full sm:max-w-sm p-6">
            <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-5 sm:hidden" />
            <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <HelpCircle className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 text-center mb-2">Did you complete the task?</h3>
            <p className="text-sm text-gray-500 text-center mb-6 leading-relaxed">
              Only confirm if you actually completed the task. False claims may result in account suspension.
            </p>
            <div className="space-y-3">
              <Button onClick={() => handleConfirmComplete(true)} className="w-full bg-green-600 hover:bg-green-700 rounded-xl h-12 font-semibold">
                <CheckCircle2 className="w-4 h-4 mr-2" /> Yes, I completed it!
              </Button>
              <Button variant="outline" onClick={() => handleConfirmComplete(false)} className="w-full rounded-xl h-12">
                <X className="w-4 h-4 mr-2" /> Not yet — I'll do it now
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Back */}
      <button onClick={() => router.back()} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 transition-colors group">
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
        Back to Tasks
      </button>

      {/* Task Header */}
      <Card className="border border-gray-200 shadow-sm rounded-2xl overflow-hidden">
        <CardContent className="p-5">
          <div className="flex items-start gap-4">
            {task.app_icon_url ? (
              <img src={task.app_icon_url} alt={task.app_name || task.title} className="w-16 h-16 rounded-2xl object-cover border border-gray-200 shadow-sm flex-shrink-0" />
            ) : (
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center flex-shrink-0 text-3xl shadow-sm">
                {getActionTypeIcon(task.action_type)}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h1 className="text-xl font-bold text-gray-900 leading-tight">{task.title}</h1>
              {task.app_name && <p className="text-sm text-gray-500 mt-0.5">{task.app_name}</p>}
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{getActionTypeIcon(task.action_type)} {task.action_type}</span>
                {task.requires_proof && (
                  <span className="text-xs bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Camera className="w-2.5 h-2.5" /> Proof needed
                  </span>
                )}
              </div>
            </div>
            <div className="text-right flex-shrink-0">
              <div className="flex items-center gap-0.5 justify-end">
                <IndianRupee className="w-5 h-5 text-green-600" />
                <span className="text-3xl font-black text-green-600">{Number(task.user_payout).toFixed(0)}</span>
              </div>
              <p className="text-xs text-gray-400">reward</p>
            </div>
          </div>
          {task.description && (
            <p className="text-sm text-gray-600 mt-4 leading-relaxed border-t border-gray-100 pt-4">{task.description}</p>
          )}
          <div className="flex items-center gap-4 mt-4 pt-3 border-t border-gray-100">
            <div className="flex items-center gap-1.5"><Zap className="w-3.5 h-3.5 text-yellow-500" /><span className="text-xs text-gray-500 font-medium">Quick task</span></div>
            <div className="flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5 text-green-500" /><span className="text-xs text-gray-500 font-medium">Verified payout</span></div>
            {task.how_to_steps?.length > 0 && (
              <div className="flex items-center gap-1.5"><ListOrdered className="w-3.5 h-3.5 text-purple-500" /><span className="text-xs text-gray-500 font-medium">{task.how_to_steps.length} steps</span></div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* How-To Steps */}
      {task.how_to_steps?.length > 0 && (
        <Card className="border border-purple-200 bg-purple-50/40 rounded-2xl">
          <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-xl bg-purple-600 flex items-center justify-center flex-shrink-0">
                <ListOrdered className="w-4 h-4 text-white" />
              </div>
              <div>
                <h2 className="text-base font-bold text-gray-900">How to Complete</h2>
                <p className="text-xs text-gray-500">Follow these steps carefully</p>
              </div>
            </div>
            <div className="space-y-3">
              {task.how_to_steps.map((step, idx) => (
                <div key={idx} className="flex items-start gap-3">
                  <span className="w-7 h-7 rounded-full bg-purple-600 text-white text-sm font-bold flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm">{idx + 1}</span>
                  <div className="flex-1 bg-white border border-purple-100 rounded-xl px-3 py-2.5 mt-0.5">
                    <p className="text-sm text-gray-700 leading-relaxed">{step}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Random Copy Prompt */}
      {randomPrompt && (
        <Card className="border border-green-200 bg-gradient-to-br from-green-50 to-emerald-50/60 rounded-2xl overflow-hidden">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-green-600 flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-gray-900">Suggested Text</h2>
                  <p className="text-xs text-gray-500">Copy & paste when writing your review</p>
                </div>
              </div>
              {task.copy_prompts.length > 1 && (
                <button onClick={() => { setCopied(false); setPromptSeed(s => s + 1) }} aria-label="Get another suggestion" title="Get another suggestion"
                  className="w-8 h-8 rounded-xl bg-green-100 hover:bg-green-200 flex items-center justify-center transition-colors flex-shrink-0">
                  <RefreshCw className="w-4 h-4 text-green-600" />
                </button>
              )}
            </div>
            <div className="bg-white border-2 border-green-200 rounded-xl p-4 mb-3">
              <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{randomPrompt}</p>
            </div>
            <button onClick={() => copyPrompt(randomPrompt)}
              className={`w-full h-12 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all ${copied ? 'bg-green-600 text-white' : 'bg-green-100 text-green-700 hover:bg-green-200 border border-green-300'}`}>
              {copied ? <><CheckCircle2 className="w-4 h-4" />Copied! Now paste it</> : <><Copy className="w-4 h-4" />Tap to Copy This Text</>}
            </button>
            {task.copy_prompts.length > 1 && (
              <p className="text-xs text-center text-gray-400 mt-2">{task.copy_prompts.length} suggestions — tap 🔄 for another</p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Proof reminder */}
      {task.requires_proof && (
        <div className="flex items-start gap-3 bg-orange-50 border border-orange-200 rounded-2xl p-4">
          <AlertCircle className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-orange-800">Screenshot Required</p>
            <p className="text-xs text-orange-600 mt-0.5 leading-relaxed">
              {task.proof_instructions || "Take a screenshot after completing the task. You'll need to upload it to receive your payment."}
            </p>
          </div>
        </div>
      )}

      {/* ── Sticky Bottom — Two-step flow ── */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/90 backdrop-blur-md border-t border-gray-100 z-40">
        <div className="max-w-2xl mx-auto space-y-2">
          {!taskOpened ? (
            <>
              <Button onClick={handleOpenTask} className="w-full bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-2xl h-14 font-bold text-base shadow-xl">
                <ExternalLink className="w-5 h-5 mr-2" />
                Open Task & Start Earning ₹{Number(task.user_payout).toFixed(0)}
              </Button>
              <p className="text-xs text-center text-gray-400">Opens in a new tab • Complete the task • Come back to confirm</p>
            </>
          ) : completing ? (
            <Button disabled className="w-full bg-blue-600 rounded-2xl h-14 font-bold text-base">
              <Clock className="w-5 h-5 mr-2 animate-spin" /> Saving your completion...
            </Button>
          ) : (
            <>
              <Button onClick={() => setShowConfirm(true)} className="w-full bg-green-600 hover:bg-green-700 active:bg-green-800 rounded-2xl h-14 font-bold text-base shadow-xl">
                <CheckCircle2 className="w-5 h-5 mr-2" /> I've Completed — Claim ₹{Number(task.user_payout).toFixed(0)}
              </Button>
              <button onClick={handleOpenTask} className="w-full text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center justify-center gap-1">
                <ExternalLink className="w-3 h-3" /> Open task again
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}