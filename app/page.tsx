import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  Sparkles, Zap, ArrowRight, Shield, Users, Gift,
  Smartphone, Clock, Target, BarChart3, IndianRupee,
  BadgeCheck, Star, Download, CreditCard, MessageCircle,
  ChevronDown, CheckCircle
} from "lucide-react"
import { HeaderCTA } from "@/components/landing/header-cta"
import { BlogSection } from "@/components/landing/blog-section"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">

      {/* Skip to main content — screen readers & keyboard users */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-blue-600 text-white px-4 py-2 rounded-xl z-[200] font-semibold text-sm"
      >
        Skip to main content
      </a>

      {/* ── Header ── */}
      <header role="banner" className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-md border-b border-gray-100 z-50">
        <div className="max-w-6xl mx-auto px-4 h-14 sm:h-16 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2" aria-label="Qyantra home">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center shadow-sm" aria-hidden="true">
              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            <span className="font-black text-lg sm:text-xl text-gray-900">Qyantra</span>
          </Link>

          {/* Nav — desktop only */}
          <nav aria-label="Main navigation" className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-700">
            <a href="#how-it-works" className="hover:text-blue-600 transition-colors">How it works</a>
            <Link href="/blog" className="hover:text-blue-600 transition-colors">Blog</Link>
            <a href="#tasks" className="hover:text-blue-600 transition-colors">Tasks</a>
            <a href="#earnings" className="hover:text-blue-600 transition-colors">Earnings</a>
            <a href="#faq" className="hover:text-blue-600 transition-colors">FAQ</a>
          </nav>

          {/* CTA */}
          <HeaderCTA />
        </div>
      </header>

      {/* ── MAIN CONTENT ── */}
      <main id="main-content" tabIndex={-1}>

        {/* ── HERO ── */}
        <section
          aria-labelledby="hero-heading"
          className="pt-24 sm:pt-28 md:pt-32 pb-12 sm:pb-20 px-4 bg-gradient-to-b from-blue-50/60 to-white"
        >
          <div className="max-w-4xl mx-auto text-center">

            {/* Trust pill */}
            <div className="animate-fade-up-1 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-100 text-blue-700 text-xs sm:text-sm font-semibold mb-6 sm:mb-8">
              <BadgeCheck className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" aria-hidden="true" />
              <span>🇮🇳 Made in India · Free to Join · UPI Payouts</span>
            </div>

            {/* Headline */}
            <h1 id="hero-heading" className="animate-fade-up-2 text-4xl sm:text-5xl md:text-6xl font-black text-gray-900 leading-tight tracking-tight mb-4 sm:mb-6">
              Earn Real Money
              <span className="block text-blue-600">Completing Simple Tasks</span>
            </h1>

            {/* Subheadline */}
            <p className="animate-fade-up-3 text-lg sm:text-xl text-gray-600 mb-8 max-w-xl mx-auto leading-relaxed">
              Try apps, write reviews, complete surveys.
              Get paid directly to your{" "}
              <span className="font-bold text-gray-800">Paytm, GPay or PhonePe.</span>
            </p>

            {/* Single CTA */}
            <div className="animate-fade-up-4 flex flex-col sm:flex-row items-center justify-center gap-3 mb-8">
              <Link href="/auth/sign-up" className="w-full sm:w-auto">
                <Button
                  size="lg"
                  className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white text-base sm:text-lg px-8 sm:px-10 py-5 sm:py-6 rounded-2xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200 font-bold"
                >
                  Start Earning Free
                  <ArrowRight className="w-5 h-5 ml-2" aria-hidden="true" />
                </Button>
              </Link>
            </div>

            {/* Trust signals */}
            <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm text-gray-600" role="list" aria-label="Platform features">
              {[
                { icon: Shield, text: "100% Free" },
                { icon: IndianRupee, text: "UPI Payout" },
                { icon: Zap, text: "30-sec Signup" },
                { icon: BadgeCheck, text: "No Investment" },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-1.5" role="listitem">
                  <item.icon className="w-4 h-4 text-green-600" aria-hidden="true" />
                  <span className="font-semibold">{item.text}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── HOW IT WORKS ── */}
        <section id="how-it-works" aria-labelledby="how-it-works-heading" className="py-14 sm:py-20 px-4 bg-gray-50">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-10 sm:mb-14">
              <p className="text-blue-600 text-sm font-bold uppercase tracking-widest mb-2">Simple Process</p>
              <h2 id="how-it-works-heading" className="text-3xl sm:text-4xl font-black text-gray-900">Start earning in 3 steps</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
              {[
                {
                  step: "1",
                  icon: Smartphone,
                  title: "Create Free Account",
                  desc: "Sign up with your email in 30 seconds. No documents, no fees, no investment ever.",
                  color: "bg-blue-600",
                },
                {
                  step: "2",
                  icon: Target,
                  title: "Complete Tasks",
                  desc: "Install apps, try products, write reviews. Each task takes 2–10 minutes.",
                  color: "bg-blue-600",
                },
                {
                  step: "3",
                  icon: IndianRupee,
                  title: "Withdraw to UPI",
                  desc: "Once you reach ₹50, request payout to Paytm, GPay, or PhonePe within 24 hours.",
                  color: "bg-green-600",
                },
              ].map((item, i) => (
                <div key={i} className="bg-white rounded-3xl p-6 sm:p-8 text-center shadow-sm border border-gray-100 hover:shadow-md transition-shadow group">
                  <div className={`w-16 h-16 ${item.color} rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-md group-hover:scale-105 transition-transform duration-300 relative`} aria-hidden="true">
                    <item.icon className="w-8 h-8 text-white" />
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-gray-900 text-white text-xs font-black rounded-full flex items-center justify-center">
                      {item.step}
                    </div>
                  </div>
                  <h3 className="text-lg font-black text-gray-900 mb-2">{item.title}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── TASK TYPES ── */}
        <section id="tasks" aria-labelledby="tasks-heading" className="py-14 sm:py-20 px-4">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-10 sm:mb-14">
              <p className="text-blue-600 text-sm font-bold uppercase tracking-widest mb-2">What You'll Do</p>
              <h2 id="tasks-heading" className="text-3xl sm:text-4xl font-black text-gray-900">Simple tasks, anyone can do</h2>
              <p className="text-gray-600 mt-3 max-w-lg mx-auto text-sm sm:text-base">No skills needed. If you have a smartphone, you can earn.</p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 sm:gap-4 mb-6">
              {[
                { icon: Download, label: "Install Apps", pay: "₹25–₹200", bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-100" },
                { icon: Star, label: "Write Reviews", pay: "₹20–₹100", bg: "bg-yellow-50", text: "text-yellow-700", border: "border-yellow-100" },
                { icon: MessageCircle, label: "Sign Up", pay: "₹15–₹150", bg: "bg-green-50", text: "text-green-700", border: "border-green-100" },
                { icon: BarChart3, label: "Surveys", pay: "₹10–₹50", bg: "bg-purple-50", text: "text-purple-700", border: "border-purple-100" },
                { icon: Target, label: "Try Products", pay: "₹50–₹500", bg: "bg-pink-50", text: "text-pink-700", border: "border-pink-100" },
              ].map((task, i) => (
                <div key={i} className={`${task.bg} ${task.border} border rounded-2xl p-4 text-center hover:shadow-sm transition-all`}>
                  <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center mx-auto mb-3 shadow-sm" aria-hidden="true">
                    <task.icon className={`w-5 h-5 ${task.text}`} />
                  </div>
                  <p className="text-sm font-bold text-gray-900 mb-1">{task.label}</p>
                  <p className={`text-xs font-semibold ${task.text}`}>{task.pay}</p>
                </div>
              ))}
            </div>

            <p className="text-center text-xs text-gray-500 max-w-lg mx-auto">
              All tasks are provided by verified app developers and advertisers. Users earn rewards for genuine, verifiable task completions only.
            </p>
          </div>
        </section>

        {/* ── EARNINGS ESTIMATE ── */}
        <section id="earnings" aria-labelledby="earnings-heading" className="py-14 sm:py-20 px-4 bg-gray-50">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-10 sm:mb-14">
              <p className="text-blue-600 text-sm font-bold uppercase tracking-widest mb-2">Honest Estimates</p>
              <h2 id="earnings-heading" className="text-3xl sm:text-4xl font-black text-gray-900">How much can you earn?</h2>
              <p className="text-gray-600 mt-3 text-sm sm:text-base">Based on typical task payouts. No exaggerations, no false promises.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-6">
              {[
                { label: "Casual", time: "15 min/day", earn: "₹30–₹100", tasks: "1–2 tasks/day", highlight: false },
                { label: "Regular", time: "30 min/day", earn: "₹100–₹250", tasks: "3–5 tasks/day", highlight: true },
                { label: "Active", time: "1 hour/day", earn: "₹250–₹500", tasks: "6–10 tasks/day", highlight: false },
              ].map((tier, i) => (
                <div key={i} className={`rounded-2xl p-6 text-center border-2 transition-all ${
                  tier.highlight
                    ? 'border-blue-500 bg-blue-50 shadow-lg sm:scale-105'
                    : 'border-gray-200 bg-white'
                }`}>
                  {tier.highlight && (
                    <p className="text-xs font-black text-blue-600 uppercase tracking-widest mb-3">Most Users</p>
                  )}
                  <p className="text-sm font-semibold text-gray-600 mb-1">{tier.label}</p>
                  <p className="text-3xl font-black text-gray-900 mb-1">{tier.earn}</p>
                  <p className="text-xs text-gray-600">{tier.tasks}</p>
                  <p className="text-xs text-gray-600 mt-1">{tier.time}</p>
                </div>
              ))}
            </div>
            <p className="text-center text-xs text-gray-500">
              *Indicative estimates only. Actual earnings depend on task availability, completion rate, and your region. Earnings are not guaranteed.
            </p>
          </div>
        </section>

        {/* ── IS THIS LEGIT? ── */}
        <section aria-labelledby="legit-heading" className="py-14 sm:py-20 px-4 bg-orange-50">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-10">
              <div className="w-14 h-14 bg-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-4" aria-hidden="true">
                <Shield className="w-7 h-7 text-orange-600" />
              </div>
              <h2 id="legit-heading" className="text-3xl sm:text-4xl font-black text-gray-900 mb-3">Is this legit?</h2>
              <p className="text-gray-700 max-w-lg mx-auto text-sm sm:text-base">We understand the skepticism. Here's the complete, honest truth:</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
              {[
                {
                  icon: BadgeCheck,
                  title: "Zero Investment",
                  desc: "We will NEVER ask you to pay money. Not ₹1. We pay you for completing genuine tasks.",
                  color: "text-green-700",
                  bg: "bg-green-50",
                },
                {
                  icon: IndianRupee,
                  title: "How We Earn",
                  desc: "App companies pay us when real users try their apps. We share a portion with you. Transparent.",
                  color: "text-blue-700",
                  bg: "bg-blue-50",
                },
                {
                  icon: CreditCard,
                  title: "Real UPI Payouts",
                  desc: "Money goes to your Paytm, GPay, or PhonePe. Real cash — not points, not vouchers.",
                  color: "text-orange-700",
                  bg: "bg-orange-100",
                },
              ].map((item, i) => (
                <div key={i} className="bg-white rounded-2xl p-6 shadow-sm border border-orange-100">
                  <div className={`w-10 h-10 ${item.bg} rounded-xl flex items-center justify-center mb-4`} aria-hidden="true">
                    <item.icon className={`w-5 h-5 ${item.color}`} />
                  </div>
                  <h3 className="font-black text-gray-900 text-lg mb-2">{item.title}</h3>
                  <p className="text-gray-700 text-sm leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── FEATURES ── */}
        <section aria-labelledby="features-heading" className="py-14 sm:py-20 px-4">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-10 sm:mb-14">
              <p className="text-blue-600 text-sm font-bold uppercase tracking-widest mb-2">Why Qyantra</p>
              <h2 id="features-heading" className="text-3xl sm:text-4xl font-black text-gray-900">Built for Indian users</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-5">
              {[
                { icon: Zap, title: "Instant Earnings", desc: "Tasks without proof requirements credit to your balance immediately.", color: "bg-yellow-50 text-yellow-700" },
                { icon: Shield, title: "Secure & Private", desc: "Your data is encrypted. Passwords are hashed. We never sell your info.", color: "bg-blue-50 text-blue-700" },
                { icon: Smartphone, title: "Mobile First", desc: "Works on any Android or iPhone. Complete tasks from anywhere.", color: "bg-green-50 text-green-700" },
                { icon: Clock, title: "Fast Payouts", desc: "Request withdrawal anytime. Processed within 24 hours to your UPI.", color: "bg-purple-50 text-purple-700" },
                { icon: Users, title: "Refer & Earn", desc: "Earn ₹20 for every friend who joins. They get ₹10 bonus too.", color: "bg-pink-50 text-pink-700" },
                { icon: BarChart3, title: "Track Everything", desc: "See your balance, task history, and payout status in real time.", color: "bg-orange-50 text-orange-700" },
              ].map((feature, i) => (
                <div key={i} className="bg-white border border-gray-100 rounded-2xl p-5 hover:shadow-md hover:border-gray-200 transition-all">
                  <div className={`w-10 h-10 ${feature.color} rounded-xl flex items-center justify-center mb-4`} aria-hidden="true">
                    <feature.icon className="w-5 h-5" />
                  </div>
                  <h3 className="font-black text-gray-900 mb-1.5">{feature.title}</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
        
        {/* ── BLOG SECTION ── */}
        <BlogSection />

        {/* ── REFERRAL ── */}
        <section aria-labelledby="referral-heading" className="py-12 sm:py-16 px-4 bg-gradient-to-r from-purple-50 to-blue-50">
          <div className="max-w-3xl mx-auto text-center">
            <div className="w-14 h-14 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4" aria-hidden="true">
              <Gift className="w-7 h-7 text-purple-600" />
            </div>
            <h2 id="referral-heading" className="text-2xl sm:text-3xl font-black text-gray-900 mb-3">Invite friends, earn more</h2>
            <p className="text-gray-700 mb-6 max-w-sm mx-auto text-sm sm:text-base">
              Share your referral link. Earn{" "}
              <span className="font-bold text-purple-700">₹20</span> when a friend joins.
              They get <span className="font-bold text-blue-700">₹10</span> signup bonus.
            </p>
            <Link href="/auth/sign-up">
              <Button className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-5 rounded-2xl font-bold shadow-lg hover:-translate-y-0.5 transition-all">
                Join & Start Referring →
              </Button>
            </Link>
          </div>
        </section>

        {/* ── FAQ ── */}
        <section id="faq" aria-labelledby="faq-heading" className="py-14 sm:py-20 px-4">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-10">
              <p className="text-blue-600 text-sm font-bold uppercase tracking-widest mb-2">Got Questions?</p>
              <h2 id="faq-heading" className="text-3xl sm:text-4xl font-black text-gray-900">Frequently asked</h2>
            </div>

            <div className="space-y-3">
              {[
                {
                  q: "Is Qyantra really free? No hidden charges?",
                  a: "100% free. We will never ask you to pay, invest, or buy anything. We earn from advertisers when users complete tasks — we share that revenue with you.",
                },
                {
                  q: "How much can I realistically earn per day?",
                  a: "Earnings vary based on available tasks. Typical users earn ₹50–₹250 per day. We never promise fixed earnings — it depends on task availability in your region.",
                },
                {
                  q: "When and how do I get paid?",
                  a: "Once your balance reaches ₹50, you can request a withdrawal. We process it manually and send to your UPI ID within 24 hours of approval.",
                },
                {
                  q: "Which UPI apps are supported?",
                  a: "All major UPI apps — Paytm, Google Pay, PhonePe, BHIM, and any @ybl, @upi, @paytm, @okicici, @okaxis ID.",
                },
                {
                  q: "What kind of tasks will I need to do?",
                  a: "Install apps, write reviews, sign up on platforms, complete surveys, or try products. Tasks take 2–10 minutes. No special skills required.",
                },
                {
                  q: "Is my personal data safe?",
                  a: "Yes. We use industry-standard encryption. Your password is securely hashed and never stored in plain text. We never share or sell your data to third parties.",
                },
              ].map((faq, i) => (
                <details key={i} className="group bg-white border border-gray-200 rounded-2xl overflow-hidden hover:border-blue-200 transition-colors">
                  <summary className="flex items-center justify-between p-5 cursor-pointer list-none gap-4">
                    <span className="font-bold text-gray-900 text-sm sm:text-base">{faq.q}</span>
                    <ChevronDown className="w-5 h-5 text-gray-500 flex-shrink-0 group-open:rotate-180 transition-transform duration-200" aria-hidden="true" />
                  </summary>
                  <div className="px-5 pb-5">
                    <p className="text-gray-700 leading-relaxed text-sm">{faq.a}</p>
                  </div>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* ── FINAL CTA ── */}
        <section aria-labelledby="cta-heading" className="py-14 sm:py-20 px-4">
          <div className="max-w-3xl mx-auto">
            <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-3xl p-8 sm:p-14 text-center relative overflow-hidden shadow-2xl">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-32 translate-x-32 pointer-events-none" aria-hidden="true" />
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-24 -translate-x-24 pointer-events-none" aria-hidden="true" />
              <div className="relative">
                <p className="text-blue-200 text-xs sm:text-sm font-bold uppercase tracking-widest mb-3">Ready to start?</p>
                <h2 id="cta-heading" className="text-3xl sm:text-4xl font-black text-white mb-4">
                  Create your free account
                </h2>
                <p className="text-blue-200 mb-8 max-w-sm mx-auto text-sm sm:text-base">
                  30-second signup. No documents. No fees. Start earning today.
                </p>
                <Link href="/auth/sign-up">
                  <Button size="lg" className="bg-white text-blue-700 hover:bg-blue-50 text-base sm:text-lg px-10 py-5 sm:py-6 rounded-2xl font-black shadow-xl hover:-translate-y-0.5 transition-all">
                    Get Started Free
                    <ArrowRight className="w-5 h-5 ml-2" aria-hidden="true" />
                  </Button>
                </Link>
                <div className="flex items-center justify-center gap-4 mt-5 text-blue-200 text-xs">
                  <span className="flex items-center gap-1"><CheckCircle className="w-3.5 h-3.5" aria-hidden="true" /> No credit card</span>
                  <span className="flex items-center gap-1"><CheckCircle className="w-3.5 h-3.5" aria-hidden="true" /> No investment</span>
                  <span className="flex items-center gap-1"><CheckCircle className="w-3.5 h-3.5" aria-hidden="true" /> 100% free</span>
                </div>
              </div>
            </div>
          </div>
        </section>

      </main>

      {/* ── FOOTER ── */}
      <footer role="contentinfo" className="bg-gray-900 text-gray-400 py-10 sm:py-14 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between gap-8 mb-8">
            {/* Brand */}
            <div className="max-w-xs">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center" aria-hidden="true">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <span className="font-black text-white text-lg">Qyantra</span>
              </div>
              <p className="text-sm leading-relaxed text-gray-300">
                An incentive-based rewards platform where users earn for completing verified advertiser tasks.
              </p>
              <p className="text-xs mt-3 text-gray-400">
                📧{" "}
                <a
                  href="mailto:contact@qyantra.online"
                  className="hover:text-white transition-colors underline underline-offset-2 text-gray-300"
                >
                  contact@qyantra.online
                </a>
              </p>
            </div>

            {/* Links */}
            <div className="grid grid-cols-2 gap-8 sm:gap-12 text-sm">
              <nav aria-label="Platform links">
                <p className="text-white font-bold mb-3 text-xs uppercase tracking-widest">Platform</p>
                <ul className="space-y-2.5">
                  <li><a href="#how-it-works" className="hover:text-white transition-colors">How it works</a></li>
                  <li><Link href="/blog" className="hover:text-white transition-colors">Blog</Link></li>
                  <li><a href="#tasks" className="hover:text-white transition-colors">Tasks</a></li>
                  <li><a href="#earnings" className="hover:text-white transition-colors">Earnings</a></li>
                  <li><a href="#faq" className="hover:text-white transition-colors">FAQ</a></li>
                </ul>
              </nav>
              <nav aria-label="Legal links">
                <p className="text-white font-bold mb-3 text-xs uppercase tracking-widest">Legal</p>
                <ul className="space-y-2.5">
                  <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
                  <li><Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
                  <li><Link href="/contact" className="hover:text-white transition-colors">Contact Us</Link></li>
                  <li><Link href="/auth/sign-up" className="hover:text-white transition-colors">Sign Up</Link></li>
                </ul>
              </nav>
            </div>
          </div>

          {/* Compliance footer */}
          <div className="border-t border-gray-800 pt-6 space-y-3">
            <p className="text-xs text-gray-300 leading-relaxed">
              <strong className="text-gray-300">Disclosure:</strong> Qyantra is an incentive-based rewards platform. Users receive monetary compensation for completing genuine advertiser tasks including app installations, product trials, reviews, and surveys. This constitutes incentive traffic. Task availability and earning potential vary by region, time, and advertiser demand. All earnings estimates on this page are indicative only — actual earnings are not guaranteed and depend solely on tasks completed by the user.
            </p>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
              <p className="text-xs text-gray-400">© 2026 Qyantra. All rights reserved. Made with ❤️ in India.</p>
              <p className="text-xs text-gray-400">This platform is intended for users 18 years of age and above.</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}