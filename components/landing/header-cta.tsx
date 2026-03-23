"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export function HeaderCTA() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [checked, setChecked] = useState(false)

  useEffect(() => {
    // Lightweight session check — never returns 401, no console noise
    fetch('/api/auth/check', {
      method: 'GET',
      credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json' },
    })
      .then(res => res.ok ? res.json() : { authenticated: false })
      .then(data => {
        setIsLoggedIn(data.authenticated === true)
        setChecked(true)
      })
      .catch(() => {
        // Fail safe — show signup button
        setChecked(true)
      })
  }, [])

  // Default state before check — show signup
  if (!checked) {
    return <SignupButtons />
  }

  if (isLoggedIn) {
    return (
      <Link href="/dashboard">
        <Button className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 sm:px-5 h-9 sm:h-10 rounded-xl shadow-sm font-semibold">
          My Dashboard
        </Button>
      </Link>
    )
  }

  return <SignupButtons />
}

function SignupButtons() {
  return (
    <div className="flex items-center gap-2">
      <Link
        href="/auth/login"
        className="hidden sm:block text-sm font-semibold text-gray-600 hover:text-blue-600 transition-colors px-3"
      >
        Login
      </Link>
      <Link href="/auth/sign-up">
        <Button className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 sm:px-5 h-9 sm:h-10 rounded-xl shadow-sm font-semibold">
          Sign Up Free
        </Button>
      </Link>
    </div>
  )
}