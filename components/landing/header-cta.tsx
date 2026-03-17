"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export function HeaderCTA() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [checked, setChecked] = useState(false)

  useEffect(() => {
    // Check session on client side only — avoids hydration mismatch
    fetch('/api/user/profile')
      .then(res => {
        setIsLoggedIn(res.ok)
        setChecked(true)
      })
      .catch(() => setChecked(true))
  }, [])

  if (!checked) {
    // Render signup button by default — avoids layout shift
    return (
      <div className="flex items-center gap-2">
        <Link href="/auth/login" className="hidden sm:block text-sm font-semibold text-gray-600 hover:text-blue-600 transition-colors px-3">
          Login
        </Link>
        <Link href="/auth/sign-up">
          <Button className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 sm:px-5 h-9 sm:h-10 rounded-xl shadow-sm">
            Sign Up Free
          </Button>
        </Link>
      </div>
    )
  }

  if (isLoggedIn) {
    return (
      <Link href="/dashboard">
        <Button className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 sm:px-5 h-9 sm:h-10 rounded-xl shadow-sm">
          My Dashboard
        </Button>
      </Link>
    )
  }

  return (
    <div className="flex items-center gap-2">
      <Link href="/auth/login" className="hidden sm:block text-sm font-semibold text-gray-600 hover:text-blue-600 transition-colors px-3">
        Login
      </Link>
      <Link href="/auth/sign-up">
        <Button className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 sm:px-5 h-9 sm:h-10 rounded-xl shadow-sm">
          Sign Up Free
        </Button>
      </Link>
    </div>
  )
}