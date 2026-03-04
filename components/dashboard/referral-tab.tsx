"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Users, Copy, Check, Gift, IndianRupee, Share2,
  Trophy, ArrowRight, Sparkles
} from "lucide-react"

interface Referral {
  id: number
  display_name: string | null
  email: string
  created_at: string
}

interface ReferralData {
  referral_code: string
  referral_earnings: number
  referrals: Referral[]
  total_referrals: number
}

export function ReferralTab() {
  const [data, setData] = useState<ReferralData | null>(null)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)
  const [applyCode, setApplyCode] = useState("")
  const [applying, setApplying] = useState(false)
  const [applySuccess, setApplySuccess] = useState("")
  const [applyError, setApplyError] = useState("")

  useEffect(() => { fetchReferral() }, [])

  const fetchReferral = async () => {
    try {
      const res = await fetch('/api/referral')
      if (res.ok) setData(await res.json())
    } catch (error) {
      console.error('Error fetching referral:', error)
    } finally {
      setLoading(false)
    }
  }

  const copyCode = () => {
    if (!data?.referral_code) return
    navigator.clipboard.writeText(data.referral_code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const shareLink = () => {
    const link = `${window.location.origin}/auth/sign-up?ref=${data?.referral_code}`
    if (navigator.share) {
      navigator.share({
        title: 'Join Qyantra — Earn Money!',
        text: `Join me on Qyantra and earn real money completing simple tasks! Use my referral code ${data?.referral_code} to get ₹10 bonus!`,
        url: link,
      })
    } else {
      navigator.clipboard.writeText(link)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const applyReferralCode = async () => {
    if (!applyCode.trim()) return
    setApplying(true)
    setApplyError("")
    setApplySuccess("")
    try {
      const res = await fetch('/api/referral/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ referral_code: applyCode.trim() })
      })
      const result = await res.json()
      if (res.ok) {
        setApplySuccess(result.message)
        setApplyCode("")
        fetchReferral()
      } else {
        setApplyError(result.error || 'Failed to apply code')
      }
    } catch {
      setApplyError('Failed to apply code. Try again.')
    } finally {
      setApplying(false)
    }
  }

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-40 bg-gray-200 rounded-2xl" />
        <div className="h-32 bg-gray-200 rounded-2xl" />
      </div>
    )
  }

  const referralLink = `${typeof window !== 'undefined' ? window.location.origin : 'https://qyantra.vercel.app'}/auth/sign-up?ref=${data?.referral_code}`

  return (
    <div className="space-y-6">

      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Refer & Earn</h2>
        <p className="text-gray-500 text-sm mt-1">Invite friends and earn ₹20 per referral. They get ₹10 bonus too!</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="border-0 shadow-md rounded-2xl overflow-hidden">
          <CardContent className="p-0">
            <div className="bg-gradient-to-br from-blue-500 to-blue-700 p-4 text-center">
              <Users className="w-6 h-6 text-white/80 mx-auto mb-2" />
              <p className="text-2xl font-black text-white">{data?.total_referrals || 0}</p>
              <p className="text-blue-200 text-xs font-medium">Friends Joined</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-md rounded-2xl overflow-hidden">
          <CardContent className="p-0">
            <div className="bg-gradient-to-br from-green-500 to-green-700 p-4 text-center">
              <IndianRupee className="w-6 h-6 text-white/80 mx-auto mb-2" />
              <p className="text-2xl font-black text-white">₹{data?.referral_earnings || 0}</p>
              <p className="text-green-200 text-xs font-medium">Total Earned</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-md rounded-2xl overflow-hidden">
          <CardContent className="p-0">
            <div className="bg-gradient-to-br from-purple-500 to-purple-700 p-4 text-center">
              <Gift className="w-6 h-6 text-white/80 mx-auto mb-2" />
              <p className="text-2xl font-black text-white">₹20</p>
              <p className="text-purple-200 text-xs font-medium">Per Referral</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Referral Code Card */}
      <Card className="border-0 shadow-lg rounded-2xl overflow-hidden">
        <CardContent className="p-0">
          <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-purple-700 p-6">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-5 h-5 text-yellow-300" />
              <p className="text-white font-bold">Your Referral Code</p>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4 mb-4">
              <p className="text-white text-3xl font-black text-center tracking-widest">
                {data?.referral_code || '--------'}
              </p>
            </div>
            <div className="flex gap-3">
              <Button onClick={copyCode} className="flex-1 bg-white/20 hover:bg-white/30 text-white border-0 rounded-xl h-11">
                {copied ? <><Check className="w-4 h-4 mr-2" />Copied!</> : <><Copy className="w-4 h-4 mr-2" />Copy Code</>}
              </Button>
              <Button onClick={shareLink} className="flex-1 bg-white text-blue-600 hover:bg-blue-50 rounded-xl h-11 font-semibold">
                <Share2 className="w-4 h-4 mr-2" /> Share Link
              </Button>
            </div>
          </div>

          {/* How it works */}
          <div className="p-5 bg-white">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">How it works</p>
            <div className="space-y-3">
              {[
                { icon: Share2, text: "Share your code or link with friends", color: "blue" },
                { icon: Users, text: "Friend signs up using your referral code", color: "purple" },
                { icon: Gift, text: "You earn ₹20, they earn ₹10 bonus", color: "green" },
              ].map((step, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-xl bg-${step.color}-100 flex items-center justify-center flex-shrink-0`}>
                    <step.icon className={`w-4 h-4 text-${step.color}-600`} />
                  </div>
                  <p className="text-sm text-gray-600">{step.text}</p>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Apply Referral Code */}
      <Card className="border border-gray-200 rounded-2xl shadow-sm">
        <CardContent className="p-5">
          <div className="flex items-center gap-2 mb-4">
            <Trophy className="w-5 h-5 text-orange-500" />
            <h3 className="font-bold text-gray-900">Have a referral code?</h3>
          </div>
          <p className="text-sm text-gray-500 mb-4">Enter a friend's referral code to get ₹10 bonus added to your account.</p>

          {applySuccess ? (
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3">
              <Check className="w-5 h-5 text-green-600 flex-shrink-0" />
              <p className="text-green-700 font-semibold text-sm">{applySuccess}</p>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex gap-3">
                <Input
                  placeholder="Enter referral code e.g. ABC12345"
                  value={applyCode}
                  onChange={e => setApplyCode(e.target.value.toUpperCase())}
                  className="rounded-xl font-mono tracking-wider uppercase"
                  maxLength={8}
                />
                <Button
                  onClick={applyReferralCode}
                  disabled={applying || !applyCode.trim()}
                  className="bg-blue-600 hover:bg-blue-700 rounded-xl px-5"
                >
                  {applying ? '...' : <ArrowRight className="w-4 h-4" />}
                </Button>
              </div>
              {applyError && (
                <p className="text-sm text-red-500 font-medium">{applyError}</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Referrals List */}
      {data && data.referrals.length > 0 && (
        <Card className="border border-gray-200 rounded-2xl shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-900">Friends You Referred</h3>
              <Badge className="bg-blue-100 text-blue-700">{data.total_referrals} total</Badge>
            </div>
            <div className="space-y-3">
              {data.referrals.map((referral, i) => (
                <div key={referral.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-bold text-sm">
                      {(referral.display_name || referral.email)[0].toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">
                      {referral.display_name || referral.email.split('@')[0]}
                    </p>
                    <p className="text-xs text-gray-500">
                      Joined {new Date(referral.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 text-green-600">
                    <IndianRupee className="w-3 h-3" />
                    <span className="text-sm font-bold">+20</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}