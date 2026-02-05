"use client"

import { Suspense } from "react"
import SignUpClient from "./sign-up-client"

export default function SignUpPage() {
  return (
    <Suspense fallback={<div className="p-6 text-center">Loading...</div>}>
      <SignUpClient />
    </Suspense>
  )
}
