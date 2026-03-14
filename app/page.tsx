export const dynamic = "force-dynamic"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Sparkles, ShoppingBag, TrendingUp, Zap, DollarSign, CheckCircle,
  ArrowRight, Star, Shield, Users, Gift, Brain, Smartphone, Clock,
  Target, Award, BarChart3, Heart, IndianRupee, BadgeCheck
} from "lucide-react"
import { getSession } from "@/lib/auth/session"

export default async function HomePage() {
  const session = await getSession()
  const user = session ? { id: session.userId, email: session.email } : null

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">

      {/* Header */}
      <header className="border-b border-border/40 bg-white/90 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 sm:py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-blue-600 to-green-500 flex items-center justify-center shadow-lg">
              <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <span className="font-bold text-lg sm:text-xl bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
              Qyantra
            </span>
          </div>
          {user ? (
            <Link href="/dashboard">
              <Button className="bg-gradient-to-r from-blue-600 to-green-500 hover:from-blue-700 hover:to-green-600 text-sm sm:text-base px-4 sm:px-6 shadow-lg">
                Dashboard
              </Button>
            </Link>
          ) : (
            <div className="flex gap-2">
              <Link href="/auth/login">
                <Button variant="ghost" className="text-gray-600 hover:text-blue-600 text-sm sm:text-base px-3 sm:px-4">
                  Login
                </Button>
              </Link>
              <Link href="/auth/sign-up">
                <Button className="bg-gradient-to-r from-blue-600 to-green-500 hover:from-blue-700 hover:to-green-600 text-sm sm:text-base px-4 sm:px-6 shadow-lg hover:shadow-xl transition-all">
                  Get Started Free
                </Button>
              </Link>
            </div>
          )}
        </div>
      </header>

      {/* Hero */}
      <section className="container mx-auto px-4 pt-12 sm:pt-20 pb-10 sm:pb-16">
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-blue-100 to-green-100 text-blue-800 text-xs sm:text-sm font-semibold mb-6 shadow-sm border border-blue-200">
            <BadgeCheck className="w-4 h-4 text-green-600" />
            <span>🇮🇳 Made for India — Free to Join, Free to Use</span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-7xl font-extrabold tracking-tight mb-6 leading-tight">
            <span className="bg-gradient-to-r from-blue-600 via-green-600 to-blue-600 bg-clip-text text-transparent">
              Shop Smarter.
            </span>
            <br />
            <span className="bg-gradient-to-r from-green-600 via-blue-600 to-green-600 bg-clip-text text-transparent">
              Earn Daily.
            </span>
          </h1>

          <p className="text-lg sm:text-xl md:text-2xl text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
            Get AI-powered product recommendations from Amazon & Flipkart, plus earn real cash by completing simple tasks.
            <span className="font-bold text-green-600"> Minimum payout just ₹50.</span>
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-10">
            <Link href={user ? "/dashboard" : "/auth/sign-up"} className="w-full sm:w-auto">
              <Button size="lg" className="w-full sm:w-auto bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white text-lg px-8 py-6 rounded-full shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 group">
                Start Earning Free
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link href="/chat/demo" className="w-full sm:w-auto">
              <Button size="lg" variant="outline" className="w-full sm:w-auto text-lg px-8 py-6 rounded-full border-2 border-blue-300 hover:bg-blue-50 hover:border-blue-400">
                <ShoppingBag className="w-5 h-5 mr-2 text-blue-600" />
                Try AI Shopping Demo
              </Button>
            </Link>
          </div>

          {/* Trust Bar */}
          <div className="flex flex-wrap justify-center gap-6 sm:gap-8 text-sm text-gray-600 bg-white/60 backdrop-blur-sm rounded-2xl py-4 px-6 max-w-2xl mx-auto shadow-sm">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-green-600" />
              <span className="font-medium">100% Free</span>
            </div>
            <div className="flex items-center gap-2">
              <IndianRupee className="w-5 h-5 text-green-600" />
              <span className="font-medium">UPI Payout</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-yellow-600" />
              <span className="font-medium">30-Second Setup</span>
            </div>
            <div className="flex items-center gap-2">
              <BadgeCheck className="w-5 h-5 text-blue-600" />
              <span className="font-medium">No Investment</span>
            </div>
          </div>
        </div>
      </section>

      {/* Why people hesitate — address objections early */}
      <section className="container mx-auto px-4 pb-12">
        <div className="max-w-4xl mx-auto bg-gradient-to-br from-orange-50 to-red-50 rounded-3xl p-8 sm:p-10 border border-orange-200 shadow-lg">
          <div className="text-center mb-6">
            <Shield className="w-12 h-12 text-orange-500 mx-auto mb-3" />
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Worried It's a Scam?</h2>
            <p className="text-gray-600">We get it. Here's the honest truth about how Qyantra works:</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              { icon: BadgeCheck, title: "Zero Investment", desc: "We never ask you to pay anything. Ever. We pay you for your time." },
              { icon: IndianRupee, title: "Real UPI Payouts", desc: "Earnings go directly to your Paytm, GPay, or PhonePe. Real money." },
              { icon: Shield, title: "How We Earn", desc: "App companies pay us when users try their apps. We share that with you." },
            ].map((item, i) => (
              <div key={i} className="text-center p-4 bg-white/80 rounded-xl shadow-sm">
                <item.icon className="w-10 h-10 text-orange-500 mx-auto mb-3" />
                <h3 className="font-bold text-gray-900 mb-1">{item.title}</h3>
                <p className="text-sm text-gray-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="container mx-auto px-4 py-12 sm:py-16 bg-white/50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">How It Works</h2>
            <p className="text-gray-600 text-lg">From signup to first payout in 3 steps</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step: "1", title: "Create Free Account", desc: "Sign up with email in 30 seconds. No documents, no fees.", icon: Smartphone },
              { step: "2", title: "Complete Simple Tasks", desc: "Install apps, try products, complete surveys. Each task pays ₹10–₹500.", icon: Target },
              { step: "3", title: "Withdraw to UPI", desc: "Once you reach ₹50, request payout. Processed within 24 hours.", icon: IndianRupee },
            ].map((item, i) => (
              <div key={i} className="text-center group">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center mx-auto mb-4 shadow-xl group-hover:scale-110 transition-transform duration-300">
                  <span className="text-3xl font-bold text-white">{item.step}</span>
                </div>
                <h3 className="font-bold text-xl mb-2 text-gray-900">{item.title}</h3>
                <p className="text-gray-600 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Two Value Props */}
      <section className="container mx-auto px-4 py-12 sm:py-16">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">Two Ways to Benefit</h2>
            <p className="text-gray-600 text-lg">Use one or both — completely free</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
            {/* AI Shopping */}
            <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50/80 to-white hover:shadow-2xl transition-all duration-500 overflow-hidden group relative">
              <div className="absolute top-0 right-0 w-40 h-40 bg-blue-500/10 rounded-full -mr-20 -mt-20 group-hover:scale-150 transition-transform duration-700" />
              <CardHeader className="p-6 sm:p-8 relative">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <ShoppingBag className="w-7 h-7 text-white" />
                  </div>
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded-full uppercase tracking-wide">Save Money</span>
                </div>
                <CardTitle className="text-2xl font-bold text-gray-900 mb-3">AI Shopping Assistant</CardTitle>
                <CardDescription className="text-base text-gray-600 leading-relaxed mb-6">
                  Tell our AI what you need — it finds the best deals from Amazon & Flipkart instantly.
                </CardDescription>
                <div className="space-y-3 mb-6">
                  {[
                    "Understands your budget & needs in seconds",
                    "Finds products from Amazon & Flipkart",
                    "Compares options to get you the best deal",
                  ].map((item, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-gray-700">{item}</span>
                    </div>
                  ))}
                </div>
                <Link href="/chat/demo">
                  <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-6 text-base rounded-xl shadow-lg">
                    Try AI Demo Free <Sparkles className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
              </CardHeader>
            </Card>

            {/* Earn Money */}
            <Card className="border-2 border-green-200 bg-gradient-to-br from-green-50/80 to-white hover:shadow-2xl transition-all duration-500 overflow-hidden group relative">
              <div className="absolute top-0 right-0 w-40 h-40 bg-green-500/10 rounded-full -mr-20 -mt-20 group-hover:scale-150 transition-transform duration-700" />
              <CardHeader className="p-6 sm:p-8 relative">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <IndianRupee className="w-7 h-7 text-white" />
                  </div>
                  <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full uppercase tracking-wide">Earn Money</span>
                </div>
                <CardTitle className="text-2xl font-bold text-gray-900 mb-3">Daily Cash Tasks</CardTitle>
                <CardDescription className="text-base text-gray-600 leading-relaxed mb-6">
                  Complete simple tasks like trying new apps and get paid directly to your UPI.
                </CardDescription>
                <div className="space-y-3 mb-6">
                  {[
                    "Tasks take 2–5 minutes to complete",
                    "Earn ₹10–₹500 per task depending on type",
                    "Withdraw anytime once you reach ₹50",
                  ].map((item, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-gray-700">{item}</span>
                    </div>
                  ))}
                </div>
                <Link href={user ? "/dashboard" : "/auth/sign-up"}>
                  <Button className="w-full bg-green-600 hover:bg-green-700 text-white py-6 text-base rounded-xl shadow-lg">
                    Start Earning Now <TrendingUp className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 py-12 sm:py-16">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">Why Choose Qyantra?</h2>
            <p className="text-gray-600 text-lg">Everything you need, nothing you don't</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
            {[
              { icon: Brain, title: "AI-Powered Matching", desc: "Our chatbot finds products that actually fit your needs and budget.", color: "blue" },
              { icon: Clock, title: "Fast Payouts", desc: "Request withdrawal anytime. Processed manually within 24 hours.", color: "green" },
              { icon: Shield, title: "100% Safe & Free", desc: "No investment ever. Your data is encrypted and secure.", color: "blue" },
              { icon: Smartphone, title: "Mobile-First", desc: "Works perfectly on any phone. Complete tasks anywhere, anytime.", color: "green" },
              { icon: BarChart3, title: "Track Earnings", desc: "See your earnings grow in real-time with detailed history.", color: "blue" },
              { icon: Target, title: "Simple Tasks", desc: "No skills needed. If you can install an app, you can earn here.", color: "green" },
            ].map((feature, i) => (
              <Card key={i} className="border border-gray-200 hover:border-blue-300 hover:shadow-xl transition-all duration-300 bg-white group">
                <CardHeader className="p-6">
                  <div className={`w-12 h-12 rounded-xl bg-${feature.color}-100 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <feature.icon className={`w-6 h-6 text-${feature.color}-600`} />
                  </div>
                  <CardTitle className="text-lg font-bold mb-2 text-gray-900">{feature.title}</CardTitle>
                  <CardDescription className="text-sm text-gray-600 leading-relaxed">{feature.desc}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Earnings Calculator — interactive psychology */}
      <section className="container mx-auto px-4 py-12 sm:py-16 bg-white/50">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-3">How Much Can You Earn?</h2>
          <p className="text-gray-600 mb-8">Based on average task payouts</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { time: "15 mins/day", earn: "₹50–₹100", label: "Casual" },
              { time: "30 mins/day", earn: "₹100–₹250", label: "Regular" },
              { time: "1 hour/day", earn: "₹250–₹500", label: "Active" },
            ].map((tier, i) => (
              <div key={i} className={`p-6 rounded-2xl border-2 ${i === 1 ? 'border-green-400 bg-green-50 scale-105 shadow-lg' : 'border-gray-200 bg-white'}`}>
                {i === 1 && <p className="text-xs font-bold text-green-600 mb-2 uppercase tracking-wide">Most Popular</p>}
                <p className="text-sm font-medium text-gray-500 mb-1">{tier.label}</p>
                <p className="text-2xl font-black text-gray-900 mb-1">{tier.earn}</p>
                <p className="text-xs text-gray-500">per day • {tier.time}</p>
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-400 mt-4">*Estimates based on typical task availability. Actual earnings may vary.</p>
        </div>
      </section>

      {/* FAQ */}
      <section className="container mx-auto px-4 py-12 sm:py-16">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">Common Questions</h2>
          </div>
          <div className="space-y-4">
            {[
              { q: "How much can I realistically earn per day?", a: "Most users earn ₹50–₹200 per day spending 30–45 minutes. It depends on available tasks and how many you complete." },
              { q: "Is there any fee to join or withdraw?", a: "Zero fees. Qyantra is 100% free. We earn from app companies who pay us when users try their apps — we share that with you." },
              { q: "How does the AI shopping assistant work?", a: "Just tell it what you need and your budget. It finds matching products from Amazon and Flipkart so you don't have to search manually." },
              { q: "When and how do I get paid?", a: "Once you reach ₹50 you can request a withdrawal. We process it manually and send to your UPI ID within 24 hours." },
              { q: "Do I need to invest anything?", a: "No. Never. We will never ask you to pay or invest money. If anyone claims otherwise, it's a scam — not us." },
            ].map((faq, i) => (
              <div key={i} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                <h3 className="font-bold text-lg text-gray-900 mb-2 flex items-start gap-2">
                  <span className="text-blue-600 mt-1">•</span>
                  {faq.q}
                </h3>
                <p className="text-gray-600 leading-relaxed pl-4">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="container mx-auto px-4 py-12 sm:py-16">
        <div className="max-w-4xl mx-auto text-center bg-gradient-to-r from-blue-600 via-green-600 to-blue-600 rounded-3xl p-8 sm:p-16 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-64 h-64 bg-white/10 rounded-full -ml-32 -mt-32" />
          <div className="absolute bottom-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mb-32" />
          <div className="relative z-10">
            <Gift className="w-16 h-16 text-white mx-auto mb-6" />
            <h2 className="text-3xl sm:text-5xl font-bold text-white mb-4">Ready to Start?</h2>
            <p className="text-lg sm:text-xl text-blue-100 mb-8 max-w-xl mx-auto">
              Sign up free in 30 seconds. No documents, no fees, no hidden charges.
            </p>
            <Link href={user ? "/dashboard" : "/auth/sign-up"} className="block sm:inline-block">
              <Button size="lg" className="w-full sm:w-auto bg-white text-blue-600 hover:bg-gray-100 text-lg px-10 py-7 rounded-full shadow-2xl font-bold">
                {user ? "Open My Dashboard" : "Create Free Account"}
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <p className="text-sm text-blue-200 mt-6 flex items-center justify-center gap-2">
              <Shield className="w-4 h-4" />
              No credit card • No investment • 100% Free
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white mt-8">
        <div className="container mx-auto px-4 py-8 sm:py-12">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-green-500 flex items-center justify-center shadow-lg">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <span className="font-bold text-xl bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">Qyantra</span>
            </div>
            <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-600">
              <Link href="/privacy" className="hover:text-blue-600 transition-colors">Privacy Policy</Link>
              <Link href="/terms" className="hover:text-blue-600 transition-colors">Terms of Service</Link>
              <Link href="/contact" className="hover:text-blue-600 transition-colors">Contact</Link>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Heart className="w-4 h-4 text-red-500 fill-red-500" />
              <span>Made with love in India</span>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-100 text-center text-sm text-gray-400">
            © 2026 Qyantra. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}