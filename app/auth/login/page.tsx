"use client"

import { Suspense } from "react"
import LoginPageClient from "./login-client"

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="p-6 text-center">Loading...</div>}>
      <LoginPageClient />
    </Suspense>
  )
}

