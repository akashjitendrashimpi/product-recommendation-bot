export const dynamic = "force-dynamic"
import { getSession } from "@/lib/auth/session"
import { redirect } from "next/navigation"
import { getUserById, userToProfile } from "@/lib/db/users"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Gift, Lock, Bell, Users, IndianRupee, Sparkles, Clock } from "lucide-react"

export default async function ReferralPage() {
  const session = await getSession()
  if (!session) redirect("/auth/login")
  const user = await getUserById(session.userId)
  if (!user) redirect("/auth/login")
  const profile = userToProfile(user)

  return (
    <DashboardLayout user={{ id: user.id, email: user.email }} profile={userToProfile(user)}>
      <div className="max-w-lg mx-auto px-2 py-8 space-y-6">

        {/* Hero */}
        <div className="bg-gradient-to-br from-purple-600 via-purple-700 to-indigo-700 rounded-3xl p-8 text-center relative overflow-hidden shadow-2xl">
          {/* Background decoration */}
          <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full -translate-y-24 translate-x-24 pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full translate-y-16 -translate-x-16 pointer-events-none" />

          <div className="relative">
            {/* Animated lock icon */}
            <div className="w-20 h-20 bg-white/15 rounded-3xl flex items-center justify-center mx-auto mb-5 shadow-lg">
              <Lock className="w-10 h-10 text-white" />
            </div>

            <div className="inline-flex items-center gap-2 bg-white/20 text-white text-xs font-bold px-3 py-1.5 rounded-full mb-4">
              <Clock className="w-3.5 h-3.5" />
              Launching Soon
            </div>

            <h1 className="text-3xl font-black text-white mb-2">Refer & Earn</h1>
            <p className="text-purple-200 text-sm leading-relaxed mb-6">
              We're making this special. The referral system is almost ready — and early users will get the best rewards.
            </p>

            {/* Reward preview */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white/15 rounded-2xl p-4">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <IndianRupee className="w-4 h-4 text-white" />
                  <span className="text-2xl font-black text-white">20</span>
                </div>
                <p className="text-purple-200 text-xs">You earn per referral</p>
              </div>
              <div className="bg-white/15 rounded-2xl p-4">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <IndianRupee className="w-4 h-4 text-white" />
                  <span className="text-2xl font-black text-white">10</span>
                </div>
                <p className="text-purple-200 text-xs">Your friend gets too</p>
              </div>
            </div>
          </div>
        </div>

        {/* Psychology card — scarcity + exclusivity */}
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="font-black text-gray-900 mb-1">Early users get extra rewards 🎁</p>
              <p className="text-sm text-gray-600 leading-relaxed">
                When we launch, the <span className="font-bold text-amber-700">first 500 users</span> who refer friends will get a <span className="font-bold text-amber-700">bonus ₹50</span> added to their account automatically. You're already in.
              </p>
            </div>
          </div>
        </div>

        {/* What to expect */}
        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm space-y-4">
          <h2 className="font-black text-gray-900">What's coming</h2>
          {[
            {
              icon: Users,
              title: "Share your unique link",
              desc: "One personal link that tracks everyone you invite",
              color: "bg-blue-50 text-blue-600",
            },
            {
              icon: IndianRupee,
              title: "Earn ₹20 per friend",
              desc: "Credited instantly when they complete their first task",
              color: "bg-green-50 text-green-600",
            },
            {
              icon: Gift,
              title: "Unlimited referrals",
              desc: "No cap — invite 100 friends, earn ₹2,000",
              color: "bg-purple-50 text-purple-600",
            },
          ].map((item, i) => (
            <div key={i} className="flex items-start gap-3">
              <div className={`w-9 h-9 ${item.color} rounded-xl flex items-center justify-center flex-shrink-0`}>
                <item.icon className="w-4 h-4" />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-900">{item.title}</p>
                <p className="text-xs text-gray-500 mt-0.5">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Notify CTA */}
        <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-100 rounded-2xl p-5 text-center">
          <Bell className="w-8 h-8 text-purple-600 mx-auto mb-3" />
          <p className="font-black text-gray-900 mb-1">Get notified when it launches</p>
          <p className="text-sm text-gray-500 mb-4">
            We'll send you a push notification the moment referrals go live.
          </p>
          <div className="bg-purple-600 text-white text-sm font-bold px-6 py-3 rounded-2xl opacity-60 cursor-not-allowed select-none">
            🔔 You'll be notified automatically
          </div>
          <p className="text-xs text-gray-400 mt-2">Push notifications are already enabled for you</p>
        </div>

      </div>
    </DashboardLayout>
  )
}