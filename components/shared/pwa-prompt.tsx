"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { X, Download } from "lucide-react"

export function PwaPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [showPrompt, setShowPrompt] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    // 1. Never show if already dismissed
    if (localStorage.getItem("pwa_prompt_dismissed")) return

    // 2. Never show if already installed (standalone mode)
    if (window.matchMedia("(display-mode: standalone)").matches) return

    // 3. Never show on iOS Safari — it doesn't support beforeinstallprompt
    const ua = window.navigator.userAgent
    const isIosSafari =
      /iP(hone|ad|od)/.test(ua) &&
      /WebKit/.test(ua) &&
      !/CriOS|FxiOS|OPiOS|mercury/.test(ua)
    if (isIosSafari) return

    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault()
      setDeferredPrompt(e)

      // 4. Only show after user has been on the page for 30+ seconds
      timerRef.current = setTimeout(() => {
        setShowPrompt(true)
      }, 30_000)
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt)

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt)
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [])

  const handleInstallClick = async () => {
    if (!deferredPrompt) return
    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    setDeferredPrompt(null)
    setShowPrompt(false)
  }

  const handleDismiss = () => {
    setShowPrompt(false)
    if (timerRef.current) clearTimeout(timerRef.current)
    localStorage.setItem("pwa_prompt_dismissed", "true")
  }

  if (!showPrompt) return null

  return (
    <div className="fixed bottom-20 left-4 right-4 z-50 md:bottom-6 md:left-auto md:right-6 md:w-96">
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 p-4 flex gap-4 animate-in slide-in-from-bottom-5">
        <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-inner">
          <Download className="w-6 h-6 text-white" />
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-gray-900 text-sm">Install Qyantra App</h3>
          <p className="text-xs text-gray-500 mt-0.5">Faster access, better experience</p>

          <div className="flex gap-2 mt-3">
            <Button
              onClick={handleInstallClick}
              className="flex-1 h-9 rounded-xl bg-blue-600 hover:bg-blue-700 text-xs font-bold"
            >
              Install Now
            </Button>
            <Button
              onClick={handleDismiss}
              variant="outline"
              className="w-9 h-9 rounded-xl p-0 flex-shrink-0 border-gray-200"
            >
              <X className="w-4 h-4 text-gray-500" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
