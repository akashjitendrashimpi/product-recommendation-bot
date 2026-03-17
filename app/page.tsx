export const dynamic = "force-dynamic"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  Sparkles, ShoppingBag, TrendingUp, Zap, CheckCircle,
  ArrowRight, Shield, Users, Gift, Brain, Smartphone, Clock,
  Target, BarChart3, IndianRupee, BadgeCheck, Star,
  Download, CreditCard, Search, MessageCircle, ChevronDown
} from "lucide-react"
import { getSession } from "@/lib/auth/session"

export default async function HomePage() {
  const session = await getSession()
  const user = session ? { id: session.userId, email: session.email } : null

  return (
    <div className="min-h-screen bg-white">

      {/* ── Header ── */}
      <header className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-md border-b border-gray-100 z-50">
        <div className="max-w-6xl mx-auto px-4 h-14 sm:h-16 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center shadow-sm">
              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            <span className="font-black text-lg sm:text-xl text-gray-900">Qyantra</span>
          </Link>

          {/* Nav links — desktop only */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-600">
            <a href="#how-it-works" className="hover:text-blue-600 transition-colors">How it works</a>
            <a href="#tasks" className="hover:text-blue-600 transition-colors">Tasks</a>
            <a href="#earnings" className="hover:text-blue-600 transition-colors">Earnings</a>
            <a href="#faq" className="hover:text-blue-600 transition-colors">FAQ</a>
          </nav>

          {/* CTA */}
          {user ? (
            <Link href="/dashboard">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 sm:px-5 h-9 sm:h-10 rounded-xl shadow-sm">
                My Dashboard
              </Button>
            </Link>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/auth/login" className="hidden sm:block text-sm font-semibold text-gray-600 hover:text-blue-600 transition-colors px-3">
                Login
              </Link>
              <Link href="/auth/sign-up">
                <Button className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 sm:px-5 h-9 sm:h-10 rounded-xl shadow-sm">
                  Sign Up Free
                </Button>
              </Link>
            </div>
          )}
        </div>
      </header>

      {/* ── HERO ── */}
      <section className="pt-20 sm:pt-24 pb-12 sm:pb-20 px-4 bg-gradient-to-b from-blue-50/50 to-white">
        <div className="max-w-4xl mx-auto text-center">

          {/* Trust pill */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-100 text-blue-700 text-xs sm:text-sm font-semibold mb-6 sm:mb-8">
            <BadgeCheck className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
            <span>🇮🇳 Made in India · Trusted by 1,200+ users · ₹45,000+ paid out</span>
          </div>

          {/* Headline — emotion first, specific */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-gray-900 leading-tight tracking-tight mb-4 sm:mb-6">
            Earn Real Money
            <span className="block text-blue-600">Completing Simple Tasks</span>
          </h1>

          {/* Subheadline — clear, honest */}
          <p className="text-lg sm:text-xl text-gray-500 mb-6 sm:mb-8 max-w-xl mx-auto leading-relaxed">
            Try apps, write reviews, complete surveys.
            Get paid directly to your <span className="font-bold text-gray-700">Paytm, GPay or PhonePe.</span>
          </p>

          {/* Single primary CTA */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-6 sm:mb-8">
            <Link href={user ? "/dashboard" : "/auth/sign-up"} className="w-full sm:w-auto">
              <Button size="lg" className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white text-base sm:text-lg px-8 sm:px-10 py-5 sm:py-6 rounded-2xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200 font-bold">
                Start Earning Free
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <p className="text-xs text-gray-400 sm:hidden">No investment · Instant UPI payout</p>
          </div>

          {/* Trust signals row */}
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-gray-500">
            {[
              { icon: Shield, text: "100% Free" },
              { icon: IndianRupee, text: "UPI Payout" },
              { icon: Zap, text: "30-sec Signup" },
              { icon: BadgeCheck, text: "No Investment" },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-1.5">
                <item.icon className="w-4 h-4 text-green-500" />
                <span className="font-medium">{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SOCIAL PROOF TICKER ── */}
      <section className="py-4 bg-blue-600 overflow-hidden">
        <div className="flex gap-8 animate-marquee whitespace-nowrap">
          {[
            "✅ Rahul earned ₹120 today",
            "✅ Priya withdrew ₹200 to GPay",
            "✅ Amit completed 3 tasks · ₹75",
            "✅ Sneha got ₹250 in 2 days",
            "✅ Vikram withdrew ₹500 this week",
            "✅ Divya earned ₹90 from 2 tasks",
            "✅ Rahul earned ₹120 today",
            "✅ Priya withdrew ₹200 to GPay",
            "✅ Amit completed 3 tasks · ₹75",
          ].map((text, i) => (
            <span key={i} className="text-white/90 text-sm font-medium">{text}</span>
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how-it-works" className="py-14 sm:py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10 sm:mb-14">
            <p className="text-blue-600 text-sm font-bold uppercase tracking-widest mb-2">Simple Process</p>
            <h2 className="text-3xl sm:text-4xl font-black text-gray-900">Start earning in 3 steps</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 relative">
            {/* Connector line — desktop only */}
            <div className="hidden md:block absolute top-10 left-1/4 right-1/4 h-0.5 bg-blue-100 z-0" />

            {[
              {
                step: "1",
                icon: Smartphone,
                title: "Create Free Account",
                desc: "Sign up with email in 30 seconds. No documents, no fees, no investment ever.",
                color: "bg-blue-600",
              },
              {
                step: "2",
                icon: Target,
                title: "Complete Tasks",
                desc: "Install apps, try products, write reviews. Each task takes 2–5 minutes.",
                color: "bg-blue-600",
              },
              {
                step: "3",
                icon: IndianRupee,
                title: "Withdraw to UPI",
                desc: "Hit ₹50 minimum and withdraw to Paytm, GPay, or PhonePe within 24 hours.",
                color: "bg-green-500",
              },
            ].map((item, i) => (
              <div key={i} className="relative z-10 text-center group">
                <div className={`w-20 h-20 ${item.color} rounded-3xl flex items-center justify-center mx-auto mb-5 shadow-lg group-hover:scale-105 transition-transform duration-300`}>
                  <item.icon className="w-9 h-9 text-white" />
                </div>
                <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-6 h-6 bg-gray-900 text-white text-xs font-black rounded-full flex items-center justify-center">
                  {item.step}
                </div>
                <h3 className="text-lg font-black text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed max-w-xs mx-auto">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TASK TYPES ── */}
      <section id="tasks" className="py-14 sm:py-20 px-4 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10 sm:mb-14">
            <p className="text-blue-600 text-sm font-bold uppercase tracking-widest mb-2">What You'll Do</p>
            <h2 className="text-3xl sm:text-4xl font-black text-gray-900">Simple tasks anyone can do</h2>
            <p className="text-gray-500 mt-3 max-w-lg mx-auto">No skills needed. If you have a smartphone, you can earn.</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 sm:gap-4">
            {[
              { icon: Download, label: "Install Apps", pay: "₹25–₹200", color: "bg-blue-50 border-blue-100 text-blue-700" },
              { icon: Star, label: "Write Reviews", pay: "₹20–₹100", color: "bg-yellow-50 border-yellow-100 text-yellow-700" },
              { icon: MessageCircle, label: "Sign Up", pay: "₹15–₹150", color: "bg-green-50 border-green-100 text-green-700" },
              { icon: BarChart3, label: "Surveys", pay: "₹10–₹50", color: "bg-purple-50 border-purple-100 text-purple-700" },
              { icon: ShoppingBag, label: "Try Products", pay: "₹50–₹500", color: "bg-pink-50 border-pink-100 text-pink-700" },
            ].map((task, i) => (
              <div key={i} className={`${task.color} border rounded-2xl p-4 text-center hover:shadow-md transition-all`}>
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center mx-auto mb-3 shadow-sm">
                  <task.icon className={`w-5 h-5 ${task.color.split(' ')[2]}`} />
                </div>
                <p className="text-sm font-bold text-gray-900 mb-1">{task.label}</p>
                <p className="text-xs font-semibold">{task.pay}</p>
              </div>
            ))}
          </div>

          {/* CPA compliance note — small, visible */}
          <p className="text-center text-xs text-gray-400 mt-6">
            Tasks are provided by verified app developers and advertisers. Users earn rewards for genuine task completion.
          </p>
        </div>
      </section>

      {/* ── EARNINGS CALCULATOR ── */}
      <section id="earnings" className="py-14 sm:py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10 sm:mb-14">
            <p className="text-blue-600 text-sm font-bold uppercase tracking-widest mb-2">Realistic Earnings</p>
            <h2 className="text-3xl sm:text-4xl font-black text-gray-900">How much can you earn?</h2>
            <p className="text-gray-500 mt-3">Based on real task payouts — honest estimates, no false promises.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-6">
            {[
              { label: "Casual", time: "15 min/day", earn: "₹30–₹100", tasks: "1–2 tasks", highlight: false },
              { label: "Regular", time: "30 min/day", earn: "₹100–₹250", tasks: "3–5 tasks", highlight: true },
              { label: "Active", time: "1 hour/day", earn: "₹250–₹500", tasks: "6–10 tasks", highlight: false },
            ].map((tier, i) => (
              <div key={i} className={`rounded-2xl p-6 text-center border-2 transition-all ${
                tier.highlight
                  ? 'border-blue-500 bg-blue-50 shadow-lg scale-105'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}>
                {tier.highlight && (
                  <p className="text-xs font-black text-blue-600 uppercase tracking-widest mb-3">Most Users</p>
                )}
                <p className="text-sm font-semibold text-gray-500 mb-1">{tier.label}</p>
                <p className="text-3xl font-black text-gray-900 mb-1">{tier.earn}</p>
                <p className="text-xs text-gray-500">{tier.tasks} · {tier.time}</p>
              </div>
            ))}
          </div>
          <p className="text-center text-xs text-gray-400">
            *Estimates based on typical task availability. Actual earnings depend on tasks completed and availability in your region.
          </p>
        </div>
      </section>

      {/* ── ANTI-SCAM — keep this, it's gold for India ── */}
      <section className="py-14 sm:py-20 px-4 bg-orange-50">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <div className="w-14 h-14 bg-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Shield className="w-7 h-7 text-orange-600" />
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-gray-900 mb-3">Is this legit?</h2>
            <p className="text-gray-600 max-w-lg mx-auto">We understand the skepticism. Here's the complete truth about how Qyantra works:</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
            {[
              {
                icon: BadgeCheck,
                title: "Zero Investment",
                desc: "We will NEVER ask you to pay money. Not even ₹1. We pay you for your time and actions.",
                color: "text-green-600",
              },
              {
                icon: IndianRupee,
                title: "How We Earn",
                desc: "App companies pay us when real users try their apps. We share a portion of that with you. That's it.",
                color: "text-blue-600",
              },
              {
                icon: CreditCard,
                title: "Real UPI Payouts",
                desc: "Money goes directly to your Paytm, GPay, or PhonePe. No gift cards, no points — real cash.",
                color: "text-orange-600",
              },
            ].map((item, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 shadow-sm border border-orange-100">
                <item.icon className={`w-8 h-8 ${item.color} mb-4`} />
                <h3 className="font-black text-gray-900 text-lg mb-2">{item.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section className="py-14 sm:py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10 sm:mb-14">
            <p className="text-blue-600 text-sm font-bold uppercase tracking-widest mb-2">Why Qyantra</p>
            <h2 className="text-3xl sm:text-4xl font-black text-gray-900">Built for Indian users</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-5">
            {[
              { icon: Zap, title: "Instant Earnings", desc: "No-proof tasks credit to your balance immediately. No waiting.", color: "bg-yellow-50 text-yellow-600" },
              { icon: Shield, title: "Secure Platform", desc: "Your data is encrypted. Passwords are hashed. We never share your info.", color: "bg-blue-50 text-blue-600" },
              { icon: Smartphone, title: "Mobile First", desc: "Works on any Android or iPhone. Complete tasks from anywhere.", color: "bg-green-50 text-green-600" },
              { icon: Clock, title: "Fast Payouts", desc: "Request withdrawal anytime. Processed within 24 hours to your UPI.", color: "bg-purple-50 text-purple-600" },
              { icon: Users, title: "Refer & Earn", desc: "Earn ₹20 for every friend you invite. They get ₹10 too.", color: "bg-pink-50 text-pink-600" },
              { icon: BarChart3, title: "Track Everything", desc: "See your earnings, task history, and payout status in real time.", color: "bg-orange-50 text-orange-600" },
            ].map((feature, i) => (
              <div key={i} className="bg-white border border-gray-100 rounded-2xl p-5 hover:shadow-md hover:border-gray-200 transition-all group">
                <div className={`w-10 h-10 ${feature.color} rounded-xl flex items-center justify-center mb-4`}>
                  <feature.icon className="w-5 h-5" />
                </div>
                <h3 className="font-black text-gray-900 mb-1.5">{feature.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── REFERRAL TEASER ── */}
      <section className="py-12 sm:py-16 px-4 bg-gradient-to-r from-purple-50 to-blue-50">
        <div className="max-w-3xl mx-auto text-center">
          <div className="w-14 h-14 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Gift className="w-7 h-7 text-purple-600" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-gray-900 mb-3">Invite friends, earn more</h2>
          <p className="text-gray-600 mb-6 max-w-sm mx-auto">
            Share your referral link. Earn <span className="font-bold text-purple-600">₹20</span> for every friend who joins. They get <span className="font-bold text-blue-600">₹10</span> bonus too.
          </p>
          <Link href={user ? "/dashboard/referral" : "/auth/sign-up"}>
            <Button className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-5 rounded-2xl font-bold shadow-lg">
              Start Referring →
            </Button>
          </Link>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section id="faq" className="py-14 sm:py-20 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-10">
            <p className="text-blue-600 text-sm font-bold uppercase tracking-widest mb-2">Got Questions?</p>
            <h2 className="text-3xl sm:text-4xl font-black text-gray-900">Frequently asked</h2>
          </div>

          <div className="space-y-3">
            {[
              {
                q: "Is Qyantra really free? No hidden charges?",
                a: "100% free. We will never ask you to pay, invest, or buy anything. Ever. We earn from advertisers when users complete tasks — we share that with you."
              },
              {
                q: "How much can I realistically earn per day?",
                a: "Most users earn ₹50–₹250 per day spending 20–40 minutes. It depends on available tasks. We never promise fixed earnings — it varies based on task availability."
              },
              {
                q: "When do I receive my money?",
                a: "Once your balance hits ₹50, you can request a withdrawal. We process it manually and send to your UPI ID within 24 hours."
              },
              {
                q: "Which UPI apps are supported?",
                a: "All major UPI apps — Paytm, Google Pay, PhonePe, BHIM, and any @ybl, @upi, @paytm ID."
              },
              {
                q: "What kind of tasks will I be asked to do?",
                a: "Install apps, write reviews, sign up on platforms, complete surveys, or try products. Tasks take 2–10 minutes each. No skills required."
              },
              {
                q: "Is my personal data safe?",
                a: "Yes. We use industry-standard encryption. Your password is hashed and never stored in plain text. We never sell your data to third parties."
              },
            ].map((faq, i) => (
              <details key={i} className="group bg-white border border-gray-200 rounded-2xl overflow-hidden hover:border-blue-200 transition-colors">
                <summary className="flex items-center justify-between p-5 cursor-pointer list-none">
                  <span className="font-bold text-gray-900 pr-4">{faq.q}</span>
                  <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0 group-open:rotate-180 transition-transform duration-200" />
                </summary>
                <div className="px-5 pb-5 pt-0">
                  <p className="text-gray-600 leading-relaxed text-sm">{faq.a}</p>
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section className="py-14 sm:py-20 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-3xl p-8 sm:p-14 text-center relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-32 translate-x-32" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-24 -translate-x-24" />
            <div className="relative">
              <p className="text-blue-200 text-sm font-bold uppercase tracking-widest mb-3">Ready to start?</p>
              <h2 className="text-3xl sm:text-4xl font-black text-white mb-4">
                Create your free account
              </h2>
              <p className="text-blue-200 mb-8 max-w-sm mx-auto">
                30-second signup. No documents. No fees. Start earning today.
              </p>
              <Link href={user ? "/dashboard" : "/auth/sign-up"}>
                <Button size="lg" className="bg-white text-blue-700 hover:bg-blue-50 text-base sm:text-lg px-10 py-5 sm:py-6 rounded-2xl font-black shadow-xl hover:-translate-y-0.5 transition-all">
                  {user ? "Open Dashboard" : "Get Started Free"}
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <p className="text-blue-300 text-xs mt-5 flex items-center justify-center gap-3">
                <span>✓ No credit card</span>
                <span>✓ No investment</span>
                <span>✓ 100% free</span>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="bg-gray-900 text-gray-400 py-10 sm:py-14 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between gap-8 mb-8">
            {/* Brand */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <span className="font-black text-white text-lg">Qyantra</span>
              </div>
              <p className="text-sm leading-relaxed max-w-xs">
                An incentive-based rewards platform where users earn for completing advertiser tasks.
              </p>
              <p className="text-xs mt-2 text-gray-500">
                📧 <a href="mailto:contactqyantra@gmail.com" className="hover:text-gray-300 transition-colors">contactqyantra@gmail.com</a>
              </p>
            </div>

            {/* Links */}
            <div className="grid grid-cols-2 gap-6 sm:gap-10 text-sm">
              <div>
                <p className="text-white font-bold mb-3 text-xs uppercase tracking-widest">Platform</p>
                <ul className="space-y-2">
                  <li><a href="#how-it-works" className="hover:text-white transition-colors">How it works</a></li>
                  <li><a href="#tasks" className="hover:text-white transition-colors">Tasks</a></li>
                  <li><a href="#earnings" className="hover:text-white transition-colors">Earnings</a></li>
                  <li><a href="#faq" className="hover:text-white transition-colors">FAQ</a></li>
                </ul>
              </div>
              <div>
                <p className="text-white font-bold mb-3 text-xs uppercase tracking-widest">Legal</p>
                <ul className="space-y-2">
                  <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
                  <li><Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
                  <li><Link href="/contact" className="hover:text-white transition-colors">Contact Us</Link></li>
                </ul>
              </div>
            </div>
          </div>

          {/* Bottom bar — compliance lives here */}
          <div className="border-t border-gray-800 pt-6 space-y-2">
            <p className="text-xs text-gray-500 leading-relaxed">
              Qyantra is an incentive-based rewards platform. Users are compensated for completing genuine advertiser tasks including app installations, product trials, and surveys. Task availability and earning potential vary by region and time. All earnings estimates are indicative only — actual earnings depend on tasks completed.
            </p>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
              <p className="text-xs text-gray-600">© 2026 Qyantra. All rights reserved. Made with ❤️ in India.</p>
              {/* Age compliance — small, in footer, legally covered */}
              <p className="text-xs text-gray-600">Platform for users 18 years and above.</p>
            </div>
          </div>
        </div>
      </footer>

      
    </div>
  )
}