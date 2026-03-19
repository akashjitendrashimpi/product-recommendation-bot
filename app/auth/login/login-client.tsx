"use client"

import type React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { useState, useEffect, useCallback } from "react"
import { Sparkles, Mail, Lock, ArrowRight, ShieldCheck, CheckCircle2, Eye, EyeOff, AlertCircle } from "lucide-react"

// ── Constants ────────────────────────────────────────────────────────────────
const MAX_EMAIL_LENGTH = 254
const MAX_PASSWORD_LENGTH = 128
const MIN_PASSWORD_LENGTH = 6
const MAX_ATTEMPTS = 5
const LOCKOUT_DURATION = 60 * 1000 // 1 minute

// ── Client-side safe redirect validator ─────────────────────────────────────
function isSafeRedirect(url: string | null): boolean {
  if (!url || typeof url !== "string") return false
  return (
    url.startsWith("/") &&
    !url.startsWith("//") &&
    !url.includes("..") &&
    !url.toLowerCase().includes("javascript") &&
    url.length < 200
  )
}

// ── Client side rate limiter ─────────────────────────────────────────────────
function useClientRateLimit() {
  const [attempts, setAttempts] = useState(0)
  const [lockedUntil, setLockedUntil] = useState<number | null>(null)

  const isLocked = lockedUntil !== null && Date.now() < lockedUntil
  const remainingSeconds = isLocked
    ? Math.ceil((lockedUntil! - Date.now()) / 1000)
    : 0

  const recordAttempt = useCallback(() => {
    setAttempts((prev) => {
      const next = prev + 1
      if (next >= MAX_ATTEMPTS) {
        setLockedUntil(Date.now() + LOCKOUT_DURATION)
        return 0
      }
      return next
    })
  }, [])

  const resetAttempts = useCallback(() => {
    setAttempts(0)
    setLockedUntil(null)
  }, [])

  return { isLocked, remainingSeconds, recordAttempt, resetAttempts, attempts }
}

export default function LoginPageClient() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [emailError, setEmailError] = useState<string | null>(null)
  const [passwordError, setPasswordError] = useState<string | null>(null)

  const router = useRouter()
  const searchParams = useSearchParams()
  const { isLocked, remainingSeconds, recordAttempt, resetAttempts } = useClientRateLimit()

  useEffect(() => {
    if (searchParams.get("verified") === "true") {
      setSuccess("Email verified successfully! You can now sign in.")
    }
    if (searchParams.get("expired") === "true") {
      setError("Your session expired. Please sign in again.")
    }
    if (searchParams.get("unauthorized") === "true") {
      setError("You need to sign in to access that page.")
    }
  }, [searchParams])

  // ── Real-time field validation ───────────────────────────────────────────
  const validateEmail = useCallback((value: string) => {
    if (!value) { setEmailError(null); return }
    if (value.length > MAX_EMAIL_LENGTH) {
      setEmailError("Email is too long")
      return
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      setEmailError("Enter a valid email address")
      return
    }
    setEmailError(null)
  }, [])

  const validatePassword = useCallback((value: string) => {
    if (!value) { setPasswordError(null); return }
    if (value.length < MIN_PASSWORD_LENGTH) {
      setPasswordError(`Password must be at least ${MIN_PASSWORD_LENGTH} characters`)
      return
    }
    if (value.length > MAX_PASSWORD_LENGTH) {
      setPasswordError("Password is too long")
      return
    }
    setPasswordError(null)
  }, [])

  // ── Submit handler ───────────────────────────────────────────────────────
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    // Client side lockout check
    if (isLocked) {
      setError(`Too many attempts. Try again in ${remainingSeconds} seconds.`)
      return
    }

    // Final validation before submit
    const trimmedEmail = email.trim().toLowerCase()
    if (!trimmedEmail || !password) {
      setError("Email and password are required")
      return
    }
    if (emailError || passwordError) {
      setError("Please fix the errors above")
      return
    }

    setIsLoading(true)

    try {
      // Get redirect param safely
      const redirectParam =
        searchParams.get("redirect") ||
        searchParams.get("return") ||
        null

      const response = await fetch("/api/auth/login", {
        method: "POST",
        credentials: "same-origin",
        headers: {
          "Content-Type": "application/json",
          "X-Requested-With": "XMLHttpRequest", // CSRF hint
        },
        body: JSON.stringify({
          email: trimmedEmail,
          password,
          redirect: isSafeRedirect(redirectParam) ? redirectParam : null,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        recordAttempt()

        // Handle specific error codes
        if (response.status === 429) {
          setError("Too many login attempts. Please wait a minute and try again.")
        } else if (response.status === 403) {
          setError(data.error || "Account suspended. Contact contact@qyantra.online")
        } else {
          setError(data.error || "Invalid email or password")
        }
        return
      }

      // Success — reset attempts
      resetAttempts()

      // Use server-validated redirect or fallback
      const destination = isSafeRedirect(data.redirectTo)
        ? data.redirectTo
        : "/dashboard"

      // Replace prevents back-button loop
      router.replace(destination)

    } catch (error: unknown) {
      recordAttempt()
      console.error("[login] Error:", error)
      setError("Network error. Please check your connection and try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const isSubmitDisabled = isLoading || isLocked || !!emailError || !!passwordError

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-gradient-to-br from-blue-50 via-white to-green-50 p-6 md:p-10">
      <div className="w-full max-w-md">
        <div className="flex flex-col gap-6">

          {/* Logo */}
          <Link href="/" className="flex items-center justify-center gap-2 mb-2 group">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-green-500 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
              <Sparkles className="w-7 h-7 text-white" />
            </div>
            <span className="font-bold text-2xl bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
              Qyantra
            </span>
          </Link>

          {/* Trust Badge */}
          <div className="flex items-center justify-center gap-2 px-4 py-2 rounded-full bg-blue-100 text-blue-700 text-sm font-medium mx-auto">
            <ShieldCheck className="w-4 h-4" />
            <span>Secure Login — 256-bit Encrypted</span>
          </div>

          <Card className="border-2 border-gray-200 shadow-xl">
            <CardHeader className="text-center pb-4">
              <CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
                Welcome Back!
              </CardTitle>
              <CardDescription className="text-base text-gray-600 mt-2">
                Sign in to continue earning
              </CardDescription>
            </CardHeader>

            <CardContent>
              <form
                onSubmit={handleLogin}
                noValidate
                autoComplete="on"
              >
                <div className="flex flex-col gap-4">

                  {/* Email Field */}
                  <div className="grid gap-2">
                    <Label htmlFor="email" className="text-gray-700 font-medium flex items-center gap-2">
                      <Mail className="w-4 h-4 text-blue-500" aria-hidden />
                      Email Address
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      required
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value)
                        validateEmail(e.target.value)
                      }}
                      className={`h-12 text-base transition-colors ${
                        emailError
                          ? "border-red-400 focus:border-red-500 focus:ring-red-500"
                          : "border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                      }`}
                      autoComplete="email"
                      maxLength={MAX_EMAIL_LENGTH}
                      aria-describedby={emailError ? "email-error" : undefined}
                      aria-invalid={!!emailError}
                      disabled={isLoading}
                    />
                    {emailError && (
                      <p id="email-error" className="text-xs text-red-500 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" aria-hidden /> {emailError}
                      </p>
                    )}
                  </div>

                  {/* Password Field */}
                  <div className="grid gap-2">
                    <Label htmlFor="password" className="text-gray-700 font-medium flex items-center gap-2">
                      <Lock className="w-4 h-4 text-blue-500" aria-hidden />
                      Password
                    </Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        required
                        value={password}
                        onChange={(e) => {
                          setPassword(e.target.value)
                          validatePassword(e.target.value)
                        }}
                        className={`h-12 text-base pr-12 transition-colors ${
                          passwordError
                            ? "border-red-400 focus:border-red-500 focus:ring-red-500"
                            : "border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                        }`}
                        autoComplete="current-password"
                        maxLength={MAX_PASSWORD_LENGTH}
                        aria-describedby={passwordError ? "password-error" : undefined}
                        aria-invalid={!!passwordError}
                        disabled={isLoading}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded"
                        aria-label={showPassword ? "Hide password" : "Show password"}
                        tabIndex={-1}
                      >
                        {showPassword
                          ? <EyeOff className="w-5 h-5" aria-hidden />
                          : <Eye className="w-5 h-5" aria-hidden />
                        }
                      </button>
                    </div>
                    {passwordError && (
                      <p id="password-error" className="text-xs text-red-500 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" aria-hidden /> {passwordError}
                      </p>
                    )}
                  </div>

                  {/* Forgot Password */}
                  <div className="flex justify-end">
                    <Link
                      href="/auth/forgot-password"
                      className="text-sm font-medium text-blue-600 hover:text-green-600 underline underline-offset-4 transition-colors focus-visible:ring-2 focus-visible:ring-blue-500 rounded"
                    >
                      Forgot password?
                    </Link>
                  </div>

                  {/* Success Message */}
                  {success && (
                    <div
                      role="status"
                      className="p-3 rounded-lg bg-green-50 border border-green-200 flex items-start gap-2"
                    >
                      <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" aria-hidden />
                      <p className="text-sm text-green-700 font-medium">{success}</p>
                    </div>
                  )}

                  {/* Error Message */}
                  {error && (
                    <div
                      role="alert"
                      aria-live="assertive"
                      className="p-3 rounded-lg bg-red-50 border border-red-200 flex items-start gap-2"
                    >
                      <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" aria-hidden />
                      <p className="text-sm text-red-600 font-medium">{error}</p>
                    </div>
                  )}

                  {/* Lockout warning */}
                  {isLocked && (
                    <div
                      role="alert"
                      className="p-3 rounded-lg bg-orange-50 border border-orange-200 flex items-start gap-2"
                    >
                      <AlertCircle className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" aria-hidden />
                      <p className="text-sm text-orange-600 font-medium">
                        Too many attempts. Try again in {remainingSeconds}s.
                      </p>
                    </div>
                  )}

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    className="w-full h-12 text-base font-semibold bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600 shadow-lg hover:shadow-xl transition-all mt-2 disabled:opacity-60 disabled:cursor-not-allowed"
                    disabled={isSubmitDisabled}
                    aria-busy={isLoading}
                  >
                    {isLoading ? (
                      <span className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" aria-hidden />
                        Signing in...
                      </span>
                    ) : isLocked ? (
                      <span>Locked — wait {remainingSeconds}s</span>
                    ) : (
                      <span className="flex items-center gap-2">
                        Sign In
                        <ArrowRight className="w-5 h-5" aria-hidden />
                      </span>
                    )}
                  </Button>

                  {/* Quick Benefits */}
                  <div className="mt-2 p-4 rounded-lg bg-gradient-to-br from-blue-50 to-green-50 border border-blue-100">
                    <p className="text-xs font-semibold text-gray-700 mb-2">After signing in:</p>
                    <ul className="text-xs text-gray-600 space-y-1">
                      <li className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500" aria-hidden />
                        Access your personalized dashboard
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500" aria-hidden />
                        Track your earnings & tasks
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500" aria-hidden />
                        Complete tasks and get paid to UPI
                      </li>
                    </ul>
                  </div>
                </div>

                {/* Sign Up Link */}
                <div className="mt-6 text-center">
                  <p className="text-sm text-gray-600">
                    Don't have an account?{" "}
                    <Link
                      href="/auth/sign-up"
                      className="font-semibold text-blue-600 hover:text-green-600 underline underline-offset-4 transition-colors"
                    >
                      Sign up free
                    </Link>
                  </p>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Privacy Notice */}
          <p className="text-xs text-center text-gray-500 px-4">
            Protected by Cloudflare & industry-standard encryption.
            <br />
            <Link href="/privacy" className="underline hover:text-gray-700">Privacy Policy</Link>
            {" · "}
            <Link href="/terms" className="underline hover:text-gray-700">Terms of Service</Link>
          </p>

        </div>
      </div>
    </div>
  )
}