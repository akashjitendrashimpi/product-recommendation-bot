"use client";

import type React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { useState, useEffect } from "react"
import { isSafeReturnUrl } from '@/lib/utils'
import {
  Sparkles, User, Phone, Wallet, Mail, Lock,
  ShieldCheck, ArrowRight, Eye, EyeOff, Gift, CheckCircle2
} from "lucide-react"

export default function SignUpClient() {
  const [step, setStep] = useState(1)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [repeatPassword, setRepeatPassword] = useState("")
  const [displayName, setDisplayName] = useState("")
  const [phone, setPhone] = useState("")
  const [upiId, setUpiId] = useState("")
  const [referralCode, setReferralCode] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showRepeatPassword, setShowRepeatPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [agreedToPolicy, setAgreedToPolicy] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()

  // Auto-fill referral code from URL ?ref=CODE
  useEffect(() => {
    const ref = searchParams.get("ref")
    if (ref) setReferralCode(ref.toUpperCase())
  }, [searchParams])

  const validateStep1 = () => {
    if (!displayName.trim()) { setError("Please enter your full name"); return false }
    if (!phone.trim()) { setError("Phone number is required"); return false }
    if (!/^[6-9]\d{9}$/.test(phone.replace(/\s/g, ''))) {
      setError("Please enter a valid 10-digit Indian mobile number")
      return false
    }
    if (!email.trim()) { setError("Please enter your email"); return false }
    return true
  }

  const validateStep2 = () => {
    if (password.length < 6) { setError("Password must be at least 6 characters"); return false }
    if (password !== repeatPassword) { setError("Passwords do not match"); return false }
    if (!agreedToPolicy) { setError("Please agree to the Privacy Policy to continue"); return false }
    return true
  }

  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (validateStep1()) setStep(2)
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (!validateStep2()) return

    setIsLoading(true)
    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email, password, displayName,
          phone, upiId,
          referralCode: referralCode.trim() || undefined,
        }),
      })

      const data = await response.json()
      if (!response.ok) throw new Error(data.error || "Signup failed")

      // Auto-logged in — go straight to dashboard, no login page redirect!
      const returnUrl = searchParams.get("return")
      if (returnUrl && isSafeReturnUrl(returnUrl)) {
        router.push(returnUrl)
      } else {
        router.push("/dashboard")
      }

    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  const passwordStrength = (pwd: string) => {
    if (pwd.length === 0) return null
    if (pwd.length < 6) return { label: 'Too short', color: 'bg-red-400', width: '25%' }
    if (pwd.length < 8) return { label: 'Weak', color: 'bg-orange-400', width: '50%' }
    if (!/[A-Z]/.test(pwd) || !/[0-9]/.test(pwd)) return { label: 'Medium', color: 'bg-yellow-400', width: '75%' }
    return { label: 'Strong ✓', color: 'bg-green-500', width: '100%' }
  }

  const strength = passwordStrength(password)

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">

        {/* Logo */}
        <Link href="/" className="flex items-center justify-center gap-2 mb-6 group">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
            <Sparkles className="w-7 h-7 text-white" />
          </div>
          <span className="font-black text-2xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Qyantra
          </span>
        </Link>

        {/* Referral Banner */}
        {referralCode && (
          <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-2xl p-4 mb-4 flex items-center gap-3 shadow-md">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
              <Gift className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-white font-bold text-sm">You've been invited! 🎉</p>
              <p className="text-green-100 text-xs">Sign up now and get <span className="font-bold text-white">₹10 bonus</span> instantly</p>
            </div>
          </div>
        )}

        {/* Trust Badge */}
        <div className="flex items-center justify-center gap-2 px-4 py-2 rounded-full bg-blue-100 text-blue-700 text-xs font-semibold mb-4 mx-auto w-fit">
          <ShieldCheck className="w-3.5 h-3.5" />
          100% Free • Secure • UPI Payouts
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden">

          {/* Step Indicator */}
          <div className="p-6 pb-0">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl font-black text-gray-900">
                  {step === 1 ? 'Create Account' : 'Set Password'}
                </h1>
                <p className="text-gray-500 text-sm mt-0.5">
                  {step === 1 ? 'Step 1 of 2 — Your details' : 'Step 2 of 2 — Almost done!'}
                </p>
              </div>
              <div className="flex gap-2">
                <div className={`w-8 h-2 rounded-full transition-all ${step >= 1 ? 'bg-blue-600' : 'bg-gray-200'}`} />
                <div className={`w-8 h-2 rounded-full transition-all ${step >= 2 ? 'bg-blue-600' : 'bg-gray-200'}`} />
              </div>
            </div>
          </div>

          <div className="p-6 pt-2">
            {step === 1 ? (
              <form onSubmit={handleNextStep} className="space-y-4">

                {/* Full Name */}
                <div className="space-y-1.5">
                  <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <User className="w-4 h-4 text-blue-500" /> Full Name *
                  </Label>
                  <Input
                    placeholder="Your Name"
                    required
                    value={displayName}
                    onChange={e => setDisplayName(e.target.value)}
                    className="h-12 rounded-xl border-gray-200 focus:border-blue-500 text-base"
                  />
                </div>

                {/* Phone */}
                <div className="space-y-1.5">
                  <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <Phone className="w-4 h-4 text-green-500" /> WhatsApp Number *
                  </Label>
                  <div className="flex gap-2">
                    <div className="flex items-center px-3 bg-gray-100 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 flex-shrink-0">
                      🇮🇳 +91
                    </div>
                    <Input
                      type="tel"
                      placeholder="9876543210"
                      required
                      value={phone}
                      onChange={e => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                      className="h-12 rounded-xl border-gray-200 focus:border-green-500 text-base flex-1"
                      maxLength={10}
                    />
                  </div>
                  <p className="text-xs text-gray-400">We'll send payout notifications here</p>
                </div>

                {/* Email */}
                <div className="space-y-1.5">
                  <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <Mail className="w-4 h-4 text-blue-500" /> Email Address *
                  </Label>
                  <Input
                    type="email"
                    placeholder="you@gmail.com"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="h-12 rounded-xl border-gray-200 focus:border-blue-500 text-base"
                  />
                </div>

                {/* UPI ID */}
                <div className="space-y-1.5">
                  <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <Wallet className="w-4 h-4 text-purple-500" /> UPI ID
                    <span className="text-xs text-gray-400 font-normal">(optional)</span>
                  </Label>
                  <Input
                    placeholder="yourname@paytm"
                    value={upiId}
                    onChange={e => setUpiId(e.target.value)}
                    className="h-12 rounded-xl border-gray-200 focus:border-purple-500 text-base"
                  />
                  <p className="text-xs text-gray-400">You can add this later from dashboard too</p>
                </div>

                {/* Referral Code */}
                <div className="space-y-1.5">
                  <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <Gift className="w-4 h-4 text-orange-500" /> Referral Code
                    <span className="text-xs text-gray-400 font-normal">(optional)</span>
                  </Label>
                  <div className="relative">
                    <Input
                      placeholder="e.g. ABC12345"
                      value={referralCode}
                      onChange={e => setReferralCode(e.target.value.toUpperCase())}
                      className={`h-12 rounded-xl border-gray-200 text-base font-mono tracking-wider uppercase pr-10 ${referralCode ? 'border-green-400 bg-green-50' : ''}`}
                      maxLength={8}
                    />
                    {referralCode && (
                      <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-green-500" />
                    )}
                  </div>
                  {referralCode && (
                    <p className="text-xs text-green-600 font-semibold">✓ You'll get ₹10 bonus on signup!</p>
                  )}
                </div>

                {error && (
                  <div className="p-3 rounded-xl bg-red-50 border border-red-200">
                    <p className="text-sm text-red-600 font-medium">{error}</p>
                  </div>
                )}

                <Button type="submit" className="w-full h-12 rounded-xl font-bold text-base bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg mt-2">
                  Continue <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </form>
            ) : (
              <form onSubmit={handleSignUp} className="space-y-4">

                {/* Summary of step 1 */}
                <div className="bg-gray-50 rounded-2xl p-4 flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                    {displayName[0]?.toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-gray-900 text-sm truncate">{displayName}</p>
                    <p className="text-xs text-gray-500 truncate">{email}</p>
                  </div>
                  <button type="button" onClick={() => { setStep(1); setError(null) }}
                    className="ml-auto text-xs text-blue-600 font-semibold hover:underline flex-shrink-0">
                    Edit
                  </button>
                </div>

                {/* Password */}
                <div className="space-y-1.5">
                  <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <Lock className="w-4 h-4 text-blue-500" /> Create Password *
                  </Label>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="Minimum 6 characters"
                      required
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      className="h-12 rounded-xl border-gray-200 focus:border-blue-500 text-base pr-12"
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {strength && (
                    <div className="space-y-1">
                      <div className="w-full bg-gray-100 rounded-full h-1.5">
                        <div className={`${strength.color} h-1.5 rounded-full transition-all`} style={{ width: strength.width }} />
                      </div>
                      <p className={`text-xs font-medium ${strength.color.replace('bg-', 'text-').replace('-400', '-600').replace('-500', '-600')}`}>
                        {strength.label}
                      </p>
                    </div>
                  )}
                </div>

                {/* Confirm Password */}
                <div className="space-y-1.5">
                  <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <Lock className="w-4 h-4 text-green-500" /> Confirm Password *
                  </Label>
                  <div className="relative">
                    <Input
                      type={showRepeatPassword ? "text" : "password"}
                      placeholder="Re-enter your password"
                      required
                      value={repeatPassword}
                      onChange={e => setRepeatPassword(e.target.value)}
                      className={`h-12 rounded-xl text-base pr-12 ${
                        repeatPassword && repeatPassword !== password
                          ? 'border-red-400 focus:border-red-400'
                          : repeatPassword && repeatPassword === password
                          ? 'border-green-400 focus:border-green-400'
                          : 'border-gray-200 focus:border-green-500'
                      }`}
                    />
                    <button type="button" onClick={() => setShowRepeatPassword(!showRepeatPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                      {showRepeatPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {repeatPassword && repeatPassword === password && (
                    <p className="text-xs text-green-600 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Passwords match
                    </p>
                  )}
                </div>

                {/* ── Privacy Policy Checkbox ── */}
                <div
                  onClick={() => setAgreedToPolicy(!agreedToPolicy)}
                  className={`flex items-start gap-3 p-4 rounded-2xl border-2 cursor-pointer transition-all select-none ${
                    agreedToPolicy
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 bg-gray-50 hover:border-gray-300'
                  }`}
                >
                  <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-all ${
                    agreedToPolicy ? 'bg-blue-600 border-blue-600' : 'border-gray-300 bg-white'
                  }`}>
                    {agreedToPolicy && (
                      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    I have read and agree to the{" "}
                    <Link
                      href="/privacy"
                      target="_blank"
                      onClick={e => e.stopPropagation()}
                      className="text-blue-600 font-semibold hover:underline"
                    >
                      Privacy Policy
                    </Link>
                    {" "}and{" "}
                    <Link
                      href="/terms"
                      target="_blank"
                      onClick={e => e.stopPropagation()}
                      className="text-blue-600 font-semibold hover:underline"
                    >
                      Terms of Service
                    </Link>
                  </p>
                </div>

                {/* What you get */}
                <div className="bg-gradient-to-br from-blue-50 to-purple-50 border border-blue-100 rounded-2xl p-4">
                  <p className="text-xs font-bold text-gray-700 mb-2">🎁 You're getting:</p>
                  <div className="space-y-1.5">
                    {[
                      'Daily earning tasks — ₹50 to ₹500/day',
                      'UPI payouts — minimum ₹50',
                      referralCode ? `₹10 signup bonus from referral code` : 'Referral bonus when you invite friends',
                    ].map((item, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />
                        <p className="text-xs text-gray-600">{item}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {error && (
                  <div className="p-3 rounded-xl bg-red-50 border border-red-200">
                    <p className="text-sm text-red-600 font-medium">{error}</p>
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={isLoading || !agreedToPolicy}
                  className="w-full h-12 rounded-xl font-bold text-base bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Creating account...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      Create Free Account <ArrowRight className="w-5 h-5" />
                    </span>
                  )}
                </Button>
              </form>
            )}

            {/* Sign in link */}
            <p className="text-center text-sm text-gray-500 mt-5">
              Already have an account?{" "}
              <Link href="/auth/login" className="font-bold text-blue-600 hover:text-purple-600 transition-colors">
                Sign in
              </Link>
            </p>
          </div>
        </div>

        {/* Footer note */}
        <p className="text-xs text-center text-gray-400 mt-4 px-4">
          🔒 Your data is encrypted and never shared with third parties.
        </p>
      </div>
    </div>
  )
}