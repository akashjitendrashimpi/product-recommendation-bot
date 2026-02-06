"use client"

import type React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { useState } from "react"
import { Sparkles, Mail, ArrowRight, ShieldCheck, CheckCircle2, ArrowLeft, Clock } from "lucide-react"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to send reset email")
      }

      setIsSubmitted(true)
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "An error occurred"
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  if (isSubmitted) {
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

            <Card className="border-2 border-gray-200 shadow-xl">
              <CardHeader className="text-center pb-4">
                {/* Success Icon */}
                <div className="mx-auto w-20 h-20 rounded-full bg-gradient-to-br from-green-100 to-green-200 flex items-center justify-center mb-4 relative">
                  <div className="absolute inset-0 rounded-full bg-gradient-to-br from-green-400 to-green-500 animate-ping opacity-20"></div>
                  <Mail className="w-9 h-9 text-green-600 relative z-10" />
                </div>

                <CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent mb-3">
                  Check Your Email
                </CardTitle>
                <CardDescription className="text-base text-gray-600 leading-relaxed">
                  If an account with that email exists, we've sent you a password reset link.
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Instructions Box */}
                <div className="p-4 rounded-lg bg-gradient-to-br from-blue-50 to-green-50 border border-blue-100">
                  <p className="text-sm font-semibold text-gray-900 mb-3">What to do next:</p>
                  <div className="space-y-2">
                    <div className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 flex-shrink-0"></span>
                      <p className="text-xs text-gray-600">Check your inbox for the reset email</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500 mt-1.5 flex-shrink-0"></span>
                      <p className="text-xs text-gray-600">Click the link to create a new password</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 flex-shrink-0"></span>
                      <p className="text-xs text-gray-600">Don't see it? Check your spam folder</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500 mt-1.5 flex-shrink-0"></span>
                      <p className="text-xs text-gray-600">Link expires in 1 hour for security</p>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-3">
                  <Button 
                    asChild 
                    className="w-full h-12 text-base font-semibold bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600 shadow-lg hover:shadow-xl transition-all"
                  >
                    <Link href="/auth/login" className="flex items-center gap-2">
                      Back to Sign In
                      <ArrowRight className="w-5 h-5" />
                    </Link>
                  </Button>

                  <Button 
                    onClick={() => setIsSubmitted(false)}
                    variant="outline" 
                    className="w-full h-11 text-base border-2 border-gray-200 hover:bg-gray-50"
                  >
                    Try Different Email
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Support Notice */}
            <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
              <Clock className="w-4 h-4" />
              <span>Still need help? Contact support@qyantra.com</span>
            </div>
          </div>
        </div>
      </div>
    )
  }

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
            <span>Secure Password Reset</span>
          </div>

          <Card className="border-2 border-gray-200 shadow-xl">
            <CardHeader className="text-center pb-4">
              <CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
                Reset Your Password
              </CardTitle>
              <CardDescription className="text-base text-gray-600 mt-2">
                Enter your email and we'll send you a reset link
              </CardDescription>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleSubmit}>
                <div className="flex flex-col gap-4">
                  {/* Email Field */}
                  <div className="grid gap-2">
                    <Label htmlFor="email" className="text-gray-700 font-medium flex items-center gap-2">
                      <Mail className="w-4 h-4 text-blue-500" />
                      Email Address
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 h-12 text-base"
                      disabled={isLoading}
                    />
                  </div>

                  {/* Error Message */}
                  {error && (
                    <div className="p-3 rounded-lg bg-red-50 border border-red-200">
                      <p className="text-sm text-red-600 font-medium">{error}</p>
                    </div>
                  )}

                  {/* Submit Button */}
                  <Button 
                    type="submit" 
                    className="w-full h-12 text-base font-semibold bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600 shadow-lg hover:shadow-xl transition-all mt-2" 
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <span className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Sending reset link...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        Send Reset Link
                        <ArrowRight className="w-5 h-5" />
                      </span>
                    )}
                  </Button>

                  {/* Info Box */}
                  <div className="mt-2 p-4 rounded-lg bg-gradient-to-br from-blue-50 to-green-50 border border-blue-100">
                    <p className="text-xs font-semibold text-gray-700 mb-2">What happens next:</p>
                    <ul className="text-xs text-gray-600 space-y-1.5">
                      <li className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 flex-shrink-0"></span>
                        <span>You'll receive an email with a secure reset link</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500 mt-1.5 flex-shrink-0"></span>
                        <span>Click the link to create a new password</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 flex-shrink-0"></span>
                        <span>Link expires in 1 hour for security</span>
                      </li>
                    </ul>
                  </div>
                </div>

                {/* Back to Login Link */}
                <div className="mt-6 text-center">
                  <Link 
                    href="/auth/login" 
                    className="inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-green-600 transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Sign In
                  </Link>
                </div>

                {/* Sign Up Link */}
                <div className="mt-4 text-center">
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
            Reset links are sent securely and expire after 1 hour. We never share your information.
          </p>
        </div>
      </div>
    </div>
  )
}