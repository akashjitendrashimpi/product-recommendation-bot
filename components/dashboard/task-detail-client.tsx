"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  ArrowLeft, ExternalLink, Copy, CheckCircle2,
  IndianRupee, Clock, ListOrdered, Sparkles, Camera, AlertCircle
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
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null)
  const [starting, setStarting] = useState(false)

  const copyPrompt = async (text: string, idx: number) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedIdx(idx)
      setTimeout(() => setCopiedIdx(null), 2000)
    } catch {
      // Fallback for older browsers
      const el = document.createElement('textarea')
      el.value = text
      document.body.appendChild(el)
      el.select()
      document.execCommand('copy')
      document.body.removeChild(el)
      setCopiedIdx(idx)
      setTimeout(() => setCopiedIdx(null), 2000)
    }
  }

  const handleStart = async () => {
    setStarting(true)
    try {
      const clickRes = await fetch(`/api/tasks/${task.id}/click`, { method: 'POST' })
      const clickData = await clickRes.json()
      window.open(clickData.redirect_url || task.task_url, "_blank", "noopener,noreferrer")

      // Wait 2s then mark complete
      setTimeout(async () => {
        const response = await fetch(`/api/tasks/${task.id}/complete`, { method: "POST" })
        const data = await response.json()
        setStarting(false)
        if (!response.ok) {
          alert(data.error || "Failed to complete task")
          return
        }
        // Navigate back to tasks with success
        router.push("/dashboard/tasks")
      }, 2000)
    } catch {
      setStarting(false)
      window.open(task.task_url, "_blank", "noopener,noreferrer")
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
    <div className="space-y-5">

      {/* Back button */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Tasks
      </button>

      {/* Task Header */}
      <Card className="border border-gray-200 shadow-sm rounded-2xl overflow-hidden">
        <CardContent className="p-5">
          <div className="flex items-start gap-4">
            {task.app_icon_url ? (
              <img
                src={task.app_icon_url}
                alt={task.app_name || task.title}
                className="w-16 h-16 rounded-2xl object-cover border border-gray-200 shadow-sm flex-shrink-0"
              />
            ) : (
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center flex-shrink-0 text-3xl shadow-sm">
                {getActionTypeIcon(task.action_type)}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h1 className="text-xl font-bold text-gray-900 leading-tight">{task.title}</h1>
              {task.app_name && <p className="text-sm text-gray-500 mt-0.5">{task.app_name}</p>}
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                  {getActionTypeIcon(task.action_type)} {task.action_type}
                </span>
                {task.requires_proof && (
                  <span className="text-xs bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Camera className="w-2.5 h-2.5" /> Proof needed
                  </span>
                )}
              </div>
            </div>
            {/* Payout badge */}
            <div className="text-right flex-shrink-0">
              <div className="flex items-center gap-0.5 justify-end">
                <IndianRupee className="w-5 h-5 text-green-600" />
                <span className="text-3xl font-black text-green-600">{Number(task.user_payout).toFixed(0)}</span>
              </div>
              <p className="text-xs text-gray-400">reward</p>
            </div>
          </div>

          {task.description && (
            <p className="text-sm text-gray-600 mt-4 leading-relaxed">{task.description}</p>
          )}
        </CardContent>
      </Card>

      {/* How-To Steps */}
      {task.how_to_steps?.length > 0 && (
        <Card className="border border-purple-200 bg-purple-50/40 rounded-2xl">
          <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-4">
              <ListOrdered className="w-5 h-5 text-purple-600" />
              <h2 className="text-base font-bold text-gray-900">How to Complete This Task</h2>
            </div>
            <div className="space-y-3">
              {task.how_to_steps.map((step, idx) => (
                <div key={idx} className="flex items-start gap-3">
                  <span className="w-7 h-7 rounded-full bg-purple-600 text-white text-sm font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <p className="text-sm text-gray-700 leading-relaxed pt-1">{step}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Copy-Paste Prompts */}
      {task.copy_prompts?.length > 0 && (
        <Card className="border border-green-200 bg-green-50/40 rounded-2xl">
          <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-5 h-5 text-green-600" />
              <h2 className="text-base font-bold text-gray-900">Suggested Review Text</h2>
            </div>
            <p className="text-xs text-gray-500 mb-4">
              Tap any prompt below to copy it, then paste it when writing your review.
            </p>
            <div className="space-y-3">
              {task.copy_prompts.map((prompt, idx) => (
                <div
                  key={idx}
                  className="bg-white border border-green-200 rounded-xl p-4 relative group"
                >
                  <p className="text-sm text-gray-700 leading-relaxed pr-10">{prompt}</p>
                  <button
                    onClick={() => copyPrompt(prompt, idx)}
                    aria-label={`Copy prompt ${idx + 1}`}
                    className={`absolute top-3 right-3 w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                      copiedIdx === idx
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-100 text-gray-500 hover:bg-green-100 hover:text-green-600'
                    }`}
                  >
                    {copiedIdx === idx
                      ? <CheckCircle2 className="w-4 h-4" />
                      : <Copy className="w-4 h-4" />
                    }
                  </button>
                  {copiedIdx === idx && (
                    <p className="text-xs text-green-600 font-semibold mt-2">✓ Copied to clipboard!</p>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Proof reminder */}
      {task.requires_proof && (
        <div className="flex items-start gap-3 bg-orange-50 border border-orange-200 rounded-2xl p-4">
          <AlertCircle className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-orange-800">Screenshot Required</p>
            <p className="text-xs text-orange-600 mt-0.5">
              {task.proof_instructions || "Take a screenshot after completing the task. You'll need to upload it to receive your payment."}
            </p>
          </div>
        </div>
      )}

      {/* Start Button */}
      <div className="sticky bottom-4">
        <Button
          onClick={handleStart}
          disabled={starting}
          className="w-full bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-2xl h-14 font-bold text-base shadow-xl"
        >
          {starting
            ? <><Clock className="w-5 h-5 mr-2 animate-spin" />Opening task...</>
            : <><ExternalLink className="w-5 h-5 mr-2" />Start Task & Earn ₹{Number(task.user_payout).toFixed(0)}</>
          }
        </Button>
        <p className="text-xs text-center text-gray-400 mt-2">
          Tapping will open the task in a new tab
        </p>
      </div>
    </div>
  )
}