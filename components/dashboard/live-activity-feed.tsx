"use client"

import { useState, useEffect } from "react"
import { CheckCircle2 } from "lucide-react"

export function LiveActivityFeed() {
  const [feed, setFeed] = useState<any[]>([])
  const [visible, setVisible] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    async function fetchFeed() {
      try {
        const res = await fetch("/api/activity/feed?limit=20")
        const data = await res.json()
        if (data.visible && data.feed && data.feed.length > 0) {
          setFeed(data.feed)
          setVisible(true)
        }
      } catch (e) {
        // Silent catch
      }
    }
    fetchFeed()
  }, [])

  useEffect(() => {
    if (!visible || feed.length === 0) return

    // Rotate the activity every 4 seconds
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % feed.length)
    }, 4000)

    return () => clearInterval(interval)
  }, [visible, feed.length])

  if (!visible || feed.length === 0) return null

  const currentItem = feed[currentIndex]

  return (
    <div className="bg-green-50 border border-green-200 rounded-2xl p-3 flex items-center justify-between mb-5 animate-in fade-in slide-in-from-bottom-2 duration-500 shadow-sm">
      <div className="flex items-center gap-3 overflow-hidden">
        <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 animate-pulse">
          <CheckCircle2 className="w-4 h-4 text-green-600" />
        </div>
        
        {/* Key wrapper for React to unmount/remount on index change to trigger animation */}
        <div key={currentItem.id} className="min-w-0 animate-in fade-in slide-in-from-bottom-2 duration-500">
          <p className="text-sm font-medium text-gray-800 truncate">
            <span className="font-bold text-gray-900">{currentItem.name}</span> withdrew{' '}
            <span className="font-black text-green-600">₹{currentItem.amount}</span>
          </p>
          <p className="text-[10px] text-gray-500 font-semibold">{currentItem.timeAgo}</p>
        </div>
      </div>

      <div className="flex-shrink-0 pl-3 border-l border-green-200">
        <span className="flex h-2 w-2 relative">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
        </span>
      </div>
    </div>
  )
}
