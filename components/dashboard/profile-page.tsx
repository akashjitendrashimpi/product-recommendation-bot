"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"
import {
  User, Save, Mail, Phone, Wallet, Shield, CheckCircle2,
  Edit, Trophy, Star, Copy, AlertCircle,
  IndianRupee, Calendar, ExternalLink, LogOut
} from "lucide-react"

interface UserData {
  id: number
  email: string
  display_name: string | null
  upi_id: string | null
  phone: string | null
  is_admin: boolean
  referral_code?: string | null
  referral_earnings?: number
  created_at?: string
}

interface ProfilePageProps {
  user: UserData
}

export function ProfilePage({ user: initialUser }: ProfilePageProps) {
  const [user, setUser] = useState<UserData>(initialUser)
  const [isLoading, setIsLoading] = useState(false)
  const [editingField, setEditingField] = useState<string | null>(null)
  const [stats, setStats] = useState({ totalEarnings: 0, tasksCompleted: 0, totalReferrals: 0, memberDays: 0 })
  const [copied, setCopied] = useState(false)
  const [formData, setFormData] = useState({
    display_name: initialUser.display_name || "",
    upi_id: initialUser.upi_id || "",
    phone: initialUser.phone || "",
  })
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => { fetchStats() }, [])

  const fetchStats = async () => {
    try {
      const [earningsRes, referralRes] = await Promise.all([
        fetch("/api/earnings"),
        fetch("/api/referral"),
      ])
      const earnings = earningsRes.ok ? await earningsRes.json() : {}
      const referral = referralRes.ok ? await referralRes.json() : {}

      const memberDays = user.created_at
        ? Math.floor((Date.now() - new Date(user.created_at).getTime()) / (1000 * 60 * 60 * 24))
        : 0

      setStats({
        totalEarnings: Number(earnings.summary?.totalEarnings || 0),
        tasksCompleted: Number(earnings.summary?.tasksCompleted || 0),
        totalReferrals: Number(referral.total_referrals || 0),
        memberDays,
      })
    } catch (error) {
      console.error("Error fetching stats:", error)
    }
  }

  const handleSave = async (field: string) => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || "Failed to update")
      setUser(data.user)
      setEditingField(null)
      toast({ title: "✅ Saved!", description: `${field} updated successfully.` })
      router.refresh()
    } catch (error: any) {
      toast({ title: "❌ Error", description: error.message, variant: "destructive" })
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" })
    router.push("/auth/login")
  }

  const copyReferral = () => {
    if (user.referral_code) {
      navigator.clipboard.writeText(`https://qyantra.vercel.app/auth/sign-up?ref=${user.referral_code}`)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const initials = (user.display_name || user.email || "U")
    .split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2)

  const getLevel = () => {
    const e = stats.totalEarnings
    if (e >= 5000) return { label: "Diamond", emoji: "💎", color: "text-blue-500", bg: "bg-blue-100", next: null }
    if (e >= 2000) return { label: "Gold", emoji: "🥇", color: "text-yellow-500", bg: "bg-yellow-100", next: 5000 }
    if (e >= 500) return { label: "Silver", emoji: "🥈", color: "text-gray-500", bg: "bg-gray-100", next: 2000 }
    return { label: "Bronze", emoji: "🥉", color: "text-orange-500", bg: "bg-orange-100", next: 500 }
  }

  const level = getLevel()

  return (
    <div className="max-w-2xl mx-auto space-y-6">

      {/* Profile Header Card */}
      <Card className="border-0 shadow-lg rounded-3xl overflow-hidden">
        <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-purple-700 p-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full -translate-y-24 translate-x-24" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full translate-y-16 -translate-x-16" />

          <div className="relative flex items-center gap-5">
            {/* Avatar */}
            <div className="relative flex-shrink-0">
              <div className="w-20 h-20 rounded-2xl bg-white/20 flex items-center justify-center text-white text-2xl font-black border-2 border-white/30 shadow-lg">
                {initials}
              </div>
              {user.is_admin && (
                <div className="absolute -top-2 -right-2 w-7 h-7 bg-yellow-400 rounded-full flex items-center justify-center shadow-md">
                  <Shield className="w-4 h-4 text-yellow-900" />
                </div>
              )}
            </div>

            {/* Name + Level */}
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-black text-white truncate">
                {user.display_name || user.email?.split("@")[0] || "User"}
              </h1>
              <p className="text-blue-200 text-sm truncate mt-0.5">{user.email}</p>
              <div className="flex items-center gap-2 mt-2.5 flex-wrap">
                <span className={"text-xs font-bold px-2.5 py-1 rounded-full " + level.bg + " " + level.color}>
                  {level.emoji} {level.label}
                </span>
                {user.is_admin && (
                  <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-yellow-400 text-yellow-900">
                    👑 Admin
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Level Progress */}
          {level.next && (
            <div className="relative mt-5">
              <div className="flex justify-between mb-1.5">
                <span className="text-blue-200 text-xs font-medium">Progress to next level</span>
                <span className="text-white text-xs font-bold">₹{stats.totalEarnings} / ₹{level.next}</span>
              </div>
              <div className="w-full bg-white/20 rounded-full h-2">
                <div
                  className="bg-white rounded-full h-2 transition-all duration-500"
                  style={{ width: `${Math.min((stats.totalEarnings / level.next) * 100, 100)}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-4 divide-x divide-gray-100 bg-white">
          {[
            { label: "Earned", value: `₹${stats.totalEarnings.toFixed(0)}` },
            { label: "Tasks", value: stats.tasksCompleted },
            { label: "Referrals", value: stats.totalReferrals },
            { label: "Days", value: stats.memberDays },
          ].map((s, i) => (
            <div key={i} className="p-4 text-center">
              <p className="text-lg font-black text-gray-900">{s.value}</p>
              <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* Admin Panel Button */}
      {user.is_admin && (
        <Link href="/admin">
          <div className="bg-gradient-to-r from-yellow-400 via-orange-400 to-orange-500 rounded-2xl p-4 flex items-center justify-between group hover:shadow-lg hover:shadow-orange-200 transition-all cursor-pointer">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/30 rounded-xl flex items-center justify-center">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-white font-bold">Admin Panel</p>
                <p className="text-yellow-100 text-xs">Manage tasks, users, payments</p>
              </div>
            </div>
            <ExternalLink className="w-5 h-5 text-white group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>
      )}

      {/* Profile Fields */}
      <Card className="border border-gray-200 rounded-2xl shadow-sm">
        <CardContent className="p-0 divide-y divide-gray-100">

          {/* Display Name */}
          <ProfileField
            icon={<User className="w-4 h-4 text-blue-600" />}
            label="Display Name"
            value={user.display_name}
            placeholder="Add your name"
            editing={editingField === "name"}
            onEdit={() => setEditingField("name")}
            onCancel={() => setEditingField(null)}
            onSave={() => handleSave("Display name")}
            isLoading={isLoading}
          >
            <Input
              value={formData.display_name}
              onChange={e => setFormData(p => ({ ...p, display_name: e.target.value }))}
              placeholder="Your full name"
              className="rounded-xl"
            />
          </ProfileField>

          {/* Email */}
          <ProfileField
            icon={<Mail className="w-4 h-4 text-gray-400" />}
            label="Email"
            value={user.email}
            readonly
          />

          {/* Phone */}
          <ProfileField
            icon={<Phone className="w-4 h-4 text-green-600" />}
            label="WhatsApp Number"
            value={user.phone}
            placeholder="Add phone number"
            editing={editingField === "phone"}
            onEdit={() => setEditingField("phone")}
            onCancel={() => setEditingField(null)}
            onSave={() => handleSave("Phone number")}
            isLoading={isLoading}
          >
            <div className="flex">
              <span className="flex items-center px-3 bg-gray-100 border border-r-0 border-gray-200 rounded-l-xl text-sm text-gray-600">+91</span>
              <Input
                value={formData.phone}
                onChange={e => setFormData(p => ({ ...p, phone: e.target.value }))}
                placeholder="10-digit number"
                className="rounded-l-none rounded-r-xl"
                maxLength={10}
              />
            </div>
          </ProfileField>

          {/* UPI ID */}
          <ProfileField
            icon={<Wallet className="w-4 h-4 text-purple-600" />}
            label="UPI ID"
            value={user.upi_id}
            placeholder="Add UPI for payouts"
            editing={editingField === "upi"}
            onEdit={() => setEditingField("upi")}
            onCancel={() => setEditingField(null)}
            onSave={() => handleSave("UPI ID")}
            isLoading={isLoading}
            badge={user.upi_id
              ? <Badge className="bg-green-100 text-green-700 text-xs">✓ Set</Badge>
              : <Badge className="bg-yellow-100 text-yellow-700 text-xs">⚠ Required</Badge>
            }
          >
            <Input
              value={formData.upi_id}
              onChange={e => setFormData(p => ({ ...p, upi_id: e.target.value }))}
              placeholder="yourname@upi"
              className="rounded-xl"
            />
            <p className="text-xs text-gray-500 mt-1.5">Required to receive task earnings</p>
          </ProfileField>

        </CardContent>
      </Card>

      {/* Referral Card */}
      {user.referral_code && (
        <Card className="border border-green-200 bg-green-50 rounded-2xl shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="font-bold text-gray-900">Your Referral Code</h3>
                <p className="text-xs text-gray-500 mt-0.5">Share and earn ₹20 per friend who joins</p>
              </div>
              <Badge className="bg-green-600 text-white">₹20/referral</Badge>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-white border border-green-200 rounded-xl px-4 py-3 font-mono font-bold text-gray-900 text-lg tracking-widest text-center">
                {user.referral_code}
              </div>
              <Button onClick={copyReferral} className="bg-green-600 hover:bg-green-700 rounded-xl h-12 px-4">
                {copied ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </Button>
            </div>
            <p className="text-xs text-gray-500 mt-2 text-center">
              {copied ? "✅ Link copied to clipboard!" : "Tap copy to share your invite link"}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Account Info */}
      <Card className="border border-gray-200 rounded-2xl shadow-sm">
        <CardContent className="p-5 space-y-3">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">Account Info</p>
          <div className="flex items-center justify-between py-1">
            <span className="text-sm text-gray-600">Member since</span>
            <span className="text-sm font-semibold text-gray-900">
              {user.created_at
                ? new Date(user.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })
                : "N/A"}
            </span>
          </div>
          <div className="flex items-center justify-between py-1">
            <span className="text-sm text-gray-600">Account ID</span>
            <span className="text-sm font-mono text-gray-500">#{user.id}</span>
          </div>
          <div className="flex items-center justify-between py-1">
            <span className="text-sm text-gray-600">Account type</span>
            <span className="text-sm font-semibold text-gray-900">{user.is_admin ? "👑 Admin" : "User"}</span>
          </div>
          <div className="pt-3 border-t border-gray-100">
            <Button
              variant="outline"
              onClick={handleLogout}
              className="w-full rounded-xl h-11 text-red-600 border-red-200 hover:bg-red-50 font-semibold"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </CardContent>
      </Card>

    </div>
  )
}

function ProfileField({
  icon, label, value, placeholder, readonly, editing, onEdit, onCancel, onSave,
  isLoading, badge, children
}: {
  icon: React.ReactNode
  label: string
  value: string | null | undefined
  placeholder?: string
  readonly?: boolean
  editing?: boolean
  onEdit?: () => void
  onCancel?: () => void
  onSave?: () => void
  isLoading?: boolean
  badge?: React.ReactNode
  children?: React.ReactNode
}) {
  return (
    <div className="p-4">
      {editing ? (
        <div className="space-y-2">
          <div className="flex items-center gap-2 mb-2">
            {icon}
            <Label className="text-sm font-semibold text-gray-700">{label}</Label>
          </div>
          {children}
          <div className="flex gap-2 mt-2">
            <Button size="sm" onClick={onSave} disabled={isLoading} className="bg-blue-600 hover:bg-blue-700 rounded-xl h-9">
              <Save className="w-3.5 h-3.5 mr-1.5" />
              {isLoading ? "Saving..." : "Save"}
            </Button>
            <Button size="sm" variant="outline" onClick={onCancel} className="rounded-xl h-9">Cancel</Button>
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0">
            {icon}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-gray-500 font-medium">{label}</p>
            <div className="flex items-center gap-2 mt-0.5">
              <p className={"text-sm font-semibold truncate " + (value ? "text-gray-900" : "text-gray-400 italic")}>
                {value || placeholder || "Not set"}
              </p>
              {badge}
            </div>
          </div>
          {!readonly && (
            <button
              onClick={onEdit}
              title={"Edit " + label}
              aria-label={"Edit " + label}
              className="text-blue-600 hover:text-blue-700 p-1.5 rounded-lg hover:bg-blue-50 flex-shrink-0"
            >
              <Edit className="w-4 h-4" />
            </button>
          )}
        </div>
      )}
    </div>
  )
}