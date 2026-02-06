"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { useState } from "react"
import { Sparkles, Mail, ArrowRight, ShieldCheck, CheckCircle2, ArrowLeft } from "lucide-react"

export default function ForgotPasswordPageClient() {
  const [email, setEmail] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    setSuccess(null)

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

      setSuccess("Password reset link has been sent to your email. Please check your inbox.")
      setEmail("")
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "An error occurred"
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
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
              <form onSubmit={handleForgotPassword}>
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

                  {/* Success Message */}
                  {success && (
                    <div className="p-4 rounded-lg bg-green-50 border border-green-200 flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm text-green-700 font-medium">{success}</p>
                        <p className="text-xs text-green-600 mt-1">Check your spam folder if you don't see it.</p>
                      </div>
                    </div>
                  )}

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