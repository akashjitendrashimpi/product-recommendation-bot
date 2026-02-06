"use client";

import type React from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { useState } from "react"
import { Sparkles, User, Phone, Wallet, Mail, Lock, ShieldCheck, ArrowRight } from "lucide-react"

export default function SignUpPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [repeatPassword, setRepeatPassword] = useState("")
  const [displayName, setDisplayName] = useState("")
  const [phone, setPhone] = useState("")
  const [upiId, setUpiId] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    if (password !== repeatPassword) {
      setError("Passwords do not match")
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password,
          displayName,
          phone,
          upiId,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Signup failed")
      }

      // Check if there's a return URL
      const returnUrl = searchParams.get("return")
      if (returnUrl) {
        router.push(returnUrl)
      } else {
        router.push("/auth/sign-up-success")
      }
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred")
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
          <div className="flex items-center justify-center gap-2 px-4 py-2 rounded-full bg-green-100 text-green-700 text-sm font-medium mx-auto">
            <ShieldCheck className="w-4 h-4" />
            <span>100% Secure • Free Forever</span>
          </div>

          <Card className="border-2 border-gray-200 shadow-xl">
            <CardHeader className="text-center pb-4">
              <CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
                Create Your Account
              </CardTitle>
              <CardDescription className="text-base text-gray-600 mt-2">
                Start discovering products and earning money today
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSignUp}>
                <div className="flex flex-col gap-4">
                  {/* Name Field */}
                  <div className="grid gap-2">
                    <Label htmlFor="displayName" className="text-gray-700 font-medium flex items-center gap-2">
                      <User className="w-4 h-4 text-blue-500" />
                      Full Name
                    </Label>
                    <Input
                      id="displayName"
                      placeholder="Enter your full name"
                      required
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 h-12 text-base"
                    />
                  </div>

                  {/* Phone Field */}
                  <div className="grid gap-2">
                    <Label htmlFor="phone" className="text-gray-700 font-medium flex items-center gap-2">
                      <Phone className="w-4 h-4 text-green-500" />
                      WhatsApp/Phone Number
                    </Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="9876543210"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="border-gray-300 focus:border-green-500 focus:ring-green-500 h-12 text-base"
                    />
                    <p className="text-xs text-gray-500">We'll send task updates here</p>
                  </div>

                  {/* UPI ID Field */}
                  <div className="grid gap-2">
                    <Label htmlFor="upiId" className="text-gray-700 font-medium flex items-center gap-2">
                      <Wallet className="w-4 h-4 text-green-500" />
                      UPI ID
                    </Label>
                    <Input
                      id="upiId"
                      placeholder="yourname@paytm"
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                      className="border-gray-300 focus:border-green-500 focus:ring-green-500 h-12 text-base"
                    />
                    <p className="text-xs text-gray-500">For receiving daily payments</p>
                  </div>

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
                    />
                  </div>

                  {/* Password Field */}
                  <div className="grid gap-2">
                    <Label htmlFor="password" className="text-gray-700 font-medium flex items-center gap-2">
                      <Lock className="w-4 h-4 text-blue-500" />
                      Password
                    </Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="Create a strong password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 h-12 text-base"
                    />
                  </div>

                  {/* Confirm Password Field */}
                  <div className="grid gap-2">
                    <Label htmlFor="repeat-password" className="text-gray-700 font-medium flex items-center gap-2">
                      <Lock className="w-4 h-4 text-green-500" />
                      Confirm Password
                    </Label>
                    <Input
                      id="repeat-password"
                      type="password"
                      placeholder="Re-enter your password"
                      required
                      value={repeatPassword}
                      onChange={(e) => setRepeatPassword(e.target.value)}
                      className="border-gray-300 focus:border-green-500 focus:ring-green-500 h-12 text-base"
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
                        Creating your account...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        Create Free Account
                        <ArrowRight className="w-5 h-5" />
                      </span>
                    )}
                  </Button>

                  {/* Benefits List */}
                  <div className="mt-2 p-4 rounded-lg bg-gradient-to-br from-blue-50 to-green-50 border border-blue-100">
                    <p className="text-xs font-semibold text-gray-700 mb-2">What you get:</p>
                    <ul className="text-xs text-gray-600 space-y-1">
                      <li className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                        AI-powered product recommendations
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                        Daily earning opportunities
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                        Instant UPI payouts
                      </li>
                    </ul>
                  </div>
                </div>

                {/* Sign In Link */}
                <div className="mt-6 text-center">
                  <p className="text-sm text-gray-600">
                    Already have an account?{" "}
                    <Link 
                      href="/auth/login" 
                      className="font-semibold text-blue-600 hover:text-green-600 underline underline-offset-4 transition-colors"
                    >
                      Sign in here
                    </Link>
                  </p>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Privacy Notice */}
          <p className="text-xs text-center text-gray-500 px-4">
            By creating an account, you agree to our Terms of Service and Privacy Policy. 
            Your data is encrypted and secure.
          </p>
        </div>
      </div>
    </div>
  )
}