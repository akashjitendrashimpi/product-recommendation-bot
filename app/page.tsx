import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Sparkles, ShoppingBag, TrendingUp, Zap, DollarSign, CheckCircle, ArrowRight, Star, Shield, Users, Gift, Brain, Smartphone, Clock, Target, Award, BarChart3, Heart, ChevronRight, Play, IndianRupee, BadgeCheck } from "lucide-react"
import { getSession } from "@/lib/auth/session"

export default async function HomePage() {
  const session = await getSession()
  const user = session ? { id: session.userId, email: session.email } : null

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Sticky Header with Progress Bar */}
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
                  Get Started
                </Button>
              </Link>
            </div>
          )}
        </div>
      </header>

      {/* Hero Section - Dual Value Proposition */}
      <section className="container mx-auto px-4 pt-12 sm:pt-20 pb-10 sm:pb-16">
        <div className="max-w-5xl mx-auto text-center">
          {/* Trust Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-blue-100 to-green-100 text-blue-800 text-xs sm:text-sm font-semibold mb-6 shadow-sm border border-blue-200">
            <BadgeCheck className="w-4 h-4 text-green-600" />
            <span>🇮🇳 India's #1 AI Shopping + Earning Platform</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-extrabold tracking-tight mb-6 leading-tight">
            <span className="bg-gradient-to-r from-blue-600 via-green-600 to-blue-600 bg-clip-text text-transparent">
              Shop Smarter.
            </span>
            <br />
            <span className="bg-gradient-to-r from-green-600 via-blue-600 to-green-600 bg-clip-text text-transparent">
              Earn Daily.
            </span>
          </h1>

          {/* Subheadline */}
          <p className="text-lg sm:text-xl md:text-2xl text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
            Get AI-powered deals from Amazon & Flipkart, plus earn real cash completing simple tasks. 
            <span className="font-bold text-green-600"> ₹50+ Lakhs paid out already.</span>
          </p>

          {/* Dual CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-10">
            <Link href={user ? "/dashboard" : "/auth/sign-up"} className="w-full sm:w-auto">
              <Button
                size="lg"
                className="w-full sm:w-auto bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white text-lg px-8 py-6 rounded-full shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 group"
              >
                Start Earning Free
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link href="/chat/demo" className="w-full sm:w-auto">
              <Button
                size="lg"
                variant="outline"
                className="w-full sm:w-auto text-lg px-8 py-6 rounded-full border-2 border-blue-300 hover:bg-blue-50 hover:border-blue-400 group"
              >
                <Play className="w-5 h-5 mr-2 text-blue-600 group-hover:scale-110 transition-transform" />
                Try AI Demo
              </Button>
            </Link>
          </div>

          {/* Trust Indicators - Enhanced */}
          <div className="flex flex-wrap justify-center gap-6 sm:gap-8 text-sm text-gray-600 bg-white/60 backdrop-blur-sm rounded-2xl py-4 px-6 max-w-2xl mx-auto shadow-sm">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-green-600" />
              <span className="font-medium">100% Free</span>
            </div>
            <div className="flex items-center gap-2">
              <IndianRupee className="w-5 h-5 text-green-600" />
              <span className="font-medium">Daily UPI Payout</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-600" />
              <span className="font-medium">10,000+ Happy Users</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-yellow-600" />
              <span className="font-medium">30-Second Setup</span>
            </div>
          </div>
        </div>
      </section>

      {/* Live Stats Ticker */}
      <section className="container mx-auto px-4 pb-12 sm:pb-16">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          <div className="text-center p-6 bg-white rounded-2xl shadow-lg border border-blue-100 hover:shadow-xl transition-all hover:-translate-y-1">
            <div className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent mb-1">
              ₹50L+
            </div>
            <div className="text-sm text-gray-600 font-medium">Paid to Users</div>
          </div>
          <div className="text-center p-6 bg-white rounded-2xl shadow-lg border border-green-100 hover:shadow-xl transition-all hover:-translate-y-1">
            <div className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent mb-1">
              10K+
            </div>
            <div className="text-sm text-gray-600 font-medium">Active Members</div>
          </div>
          <div className="text-center p-6 bg-white rounded-2xl shadow-lg border border-blue-100 hover:shadow-xl transition-all hover:-translate-y-1">
            <div className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent mb-1">
              50K+
            </div>
            <div className="text-sm text-gray-600 font-medium">Products Matched</div>
          </div>
          <div className="text-center p-6 bg-white rounded-2xl shadow-lg border border-green-100 hover:shadow-xl transition-all hover:-translate-y-1">
            <div className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent mb-1">
              4.8★
            </div>
            <div className="text-sm text-gray-600 font-medium">App Store Rating</div>
          </div>
        </div>
      </section>

      {/* How It Works - Simplified 3 Steps */}
      <section className="container mx-auto px-4 py-12 sm:py-16 bg-white/50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10 sm:mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">How Qyantra Works</h2>
            <p className="text-gray-600 text-lg">From signup to payout in 3 simple steps</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Connection Line (Desktop) */}
            <div className="hidden md:block absolute top-24 left-1/4 right-1/4 h-1 bg-gradient-to-r from-blue-200 via-green-200 to-blue-200 -z-10" />

            {[
              {
                step: "1",
                title: "Create Free Account",
                desc: "Sign up with your phone number in 30 seconds. No documents needed.",
                color: "blue",
                icon: Smartphone
              },
              {
                step: "2",
                title: "Choose Your Path",
                desc: "Use AI to find deals or complete simple tasks like app installs & surveys.",
                color: "green",
                icon: Target
              },
              {
                step: "3",
                title: "Withdraw Instantly",
                desc: "Get paid directly to your UPI ID. Minimum payout just ₹50.",
                color: "blue",
                icon: IndianRupee
              }
            ].map((item, index) => (
              <div key={index} className="text-center group">
                <div className={`w-20 h-20 rounded-full bg-gradient-to-br from-${item.color}-500 to-${item.color}-600 flex items-center justify-center mx-auto mb-4 shadow-xl group-hover:scale-110 transition-transform duration-300 relative`}>
                  <span className="text-3xl font-bold text-white">{item.step}</span>
                  <div className="absolute inset-0 rounded-full bg-white opacity-0 group-hover:opacity-20 transition-opacity" />
                </div>
                <h3 className="font-bold text-xl mb-2 text-gray-900">{item.title}</h3>
                <p className="text-gray-600 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Main Features - Enhanced Dual Cards */}
      <section className="container mx-auto px-4 py-12 sm:py-16">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10 sm:mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">Two Ways to Benefit</h2>
            <p className="text-gray-600 text-lg">Use one or both—it's completely free</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
            {/* System 1: AI Shopping */}
            <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50/80 to-white hover:shadow-2xl transition-all duration-500 overflow-hidden group relative">
              <div className="absolute top-0 right-0 w-40 h-40 bg-blue-500/10 rounded-full -mr-20 -mt-20 group-hover:scale-150 transition-transform duration-700" />
              
              <CardHeader className="p-6 sm:p-8 relative">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <ShoppingBag className="w-7 h-7 text-white" />
                  </div>
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded-full uppercase tracking-wide">
                    Save Money
                  </span>
                </div>

                <CardTitle className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
                  AI Shopping Assistant
                </CardTitle>
                
                <CardDescription className="text-base text-gray-600 leading-relaxed mb-6">
                  Tell our AI what you need, get personalized recommendations from Amazon & Flipkart in seconds. 
                  <span className="block mt-2 font-semibold text-blue-600">"Found me a ₹15,000 laptop with specs I wanted" - Rahul M.</span>
                </CardDescription>

                <div className="space-y-3 mb-6">
                  {[
                    "AI understands your budget & needs in 30 seconds",
                    "Compares prices across Amazon, Flipkart & more",
                    "Finds hidden deals & coupon codes automatically"
                  ].map((item, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-gray-700">{item}</span>
                    </div>
                  ))}
                </div>

                <Link href="/chat/demo">
                  <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-6 text-base rounded-xl shadow-lg hover:shadow-xl transition-all group/btn">
                    Try AI Demo Free
                    <Sparkles className="w-5 h-5 ml-2 group-hover/btn:rotate-12 transition-transform" />
                  </Button>
                </Link>
              </CardHeader>
            </Card>

            {/* System 2: Earn Money */}
            <Card className="border-2 border-green-200 bg-gradient-to-br from-green-50/80 to-white hover:shadow-2xl transition-all duration-500 overflow-hidden group relative">
              <div className="absolute top-0 right-0 w-40 h-40 bg-green-500/10 rounded-full -mr-20 -mt-20 group-hover:scale-150 transition-transform duration-700" />
              
              <CardHeader className="p-6 sm:p-8 relative">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <IndianRupee className="w-7 h-7 text-white" />
                  </div>
                  <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full uppercase tracking-wide">
                    Earn Money
                  </span>
                </div>

                <CardTitle className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
                  Daily Cash Tasks
                </CardTitle>
                
                <CardDescription className="text-base text-gray-600 leading-relaxed mb-6">
                  Complete simple micro-tasks like trying new apps, taking surveys, or referring friends. 
                  <span className="block mt-2 font-semibold text-green-600">"Earned ₹450 yesterday while commuting" - Priya S.</span>
                </CardDescription>

                <div className="space-y-3 mb-6">
                  {[
                    "Daily payouts directly to your UPI (Paytm, GPay, PhonePe)",
                    "Tasks take 2-5 mins: Install apps, share feedback, refer",
                    "Earn ₹50-₹500 daily depending on time spent"
                  ].map((item, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-gray-700">{item}</span>
                    </div>
                  ))}
                </div>

                <Link href={user ? "/dashboard" : "/auth/sign-up"}>
                  <Button className="w-full bg-green-600 hover:bg-green-700 text-white py-6 text-base rounded-xl shadow-lg hover:shadow-xl transition-all group/btn">
                    Start Earning Now
                    <TrendingUp className="w-5 h-5 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Why Qyantra - Feature Grid */}
      <section className="container mx-auto px-4 py-12 sm:py-16">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10 sm:mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">Why Choose Qyantra?</h2>
            <p className="text-gray-600 text-lg">Everything you need, nothing you don't</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 sm:gap-6">
            {[
              {
                icon: Brain,
                title: "AI-Powered Matching",
                desc: "Our chatbot learns your preferences to find products that actually fit your needs.",
                color: "blue"
              },
              {
                icon: Clock,
                title: "24-Hour Payouts",
                desc: "Withdraw your earnings anytime. Money hits your UPI within 24 hours, guaranteed.",
                color: "green"
              },
              {
                icon: Shield,
                title: "100% Safe & Free",
                desc: "No investment required. We never ask for money. Your data is encrypted & secure.",
                color: "blue"
              },
              {
                icon: Smartphone,
                title: "Mobile-First Design",
                desc: "Works perfectly on your phone. Complete tasks on the go, anywhere, anytime.",
                color: "green"
              },
              {
                icon: BarChart3,
                title: "Real-Time Tracking",
                desc: "Watch your earnings grow live. Detailed analytics for tasks completed & savings made.",
                color: "blue"
              },
              {
                icon: Award,
                title: "Trusted by Brands",
                desc: "Official partner with Flipkart, Amazon, Jio, and 50+ other major companies.",
                color: "green"
              }
            ].map((feature, index) => (
              <Card key={index} className="border border-gray-200 hover:border-blue-300 hover:shadow-xl transition-all duration-300 bg-white group">
                <CardHeader className="p-6">
                  <div className={`w-12 h-12 rounded-xl bg-${feature.color}-100 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <feature.icon className={`w-6 h-6 text-${feature.color}-600`} />
                  </div>
                  <CardTitle className="text-lg font-bold mb-2 text-gray-900">{feature.title}</CardTitle>
                  <CardDescription className="text-sm text-gray-600 leading-relaxed">
                    {feature.desc}
                  </CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof - Testimonials */}
      <section className="container mx-auto px-4 py-12 sm:py-16 bg-gradient-to-b from-white to-blue-50/30">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10 sm:mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">Loved by 10,000+ Indians</h2>
            <p className="text-gray-600 text-lg">Real people, real earnings, real savings</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {[
              {
                name: "Rajesh K.",
                role: "College Student",
                content: "The AI recommendations are spot-on! Found the perfect headphones within my budget in under a minute. Saved ₹800!",
                rating: 5,
                color: "blue"
              },
              {
                name: "Priya S.",
                role: "Working Professional",
                content: "I earn ₹300-₹400 daily during my commute. The tasks are simple and payout is instant to my GPay. Highly recommend!",
                rating: 5,
                color: "green"
              },
              {
                name: "Arjun M.",
                role: "Small Business Owner",
                content: "Use Qyantra for both shopping and earning. Bought a laptop with AI help and earned ₹2000 back completing tasks. Win-win!",
                rating: 5,
                color: "blue"
              }
            ].map((testimonial, index) => (
              <Card key={index} className="border border-gray-200 bg-white shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
                <CardHeader className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`w-12 h-12 rounded-full bg-gradient-to-br from-${testimonial.color}-400 to-${testimonial.color}-600 flex items-center justify-center text-white font-bold text-xl`}>
                      {testimonial.name[0]}
                    </div>
                    <div>
                      <div className="font-bold text-gray-900">{testimonial.name}</div>
                      <div className="text-xs text-gray-500">{testimonial.role}</div>
                    </div>
                  </div>
                  <div className="flex gap-1 mb-3">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <CardDescription className="text-sm text-gray-700 italic leading-relaxed">
                    "{testimonial.content}"
                  </CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Trust/Skepticism Buster Section */}
      <section className="container mx-auto px-4 py-12 sm:py-16">
        <div className="max-w-4xl mx-auto bg-gradient-to-br from-orange-50 to-red-50 rounded-3xl p-8 sm:p-12 border border-orange-200 shadow-xl">
          <div className="text-center mb-8">
            <Shield className="w-16 h-16 text-orange-500 mx-auto mb-4" />
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Is This Legit? Absolutely.</h2>
            <p className="text-gray-600">We know there are scams out there. Here's why Qyantra is different:</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: BadgeCheck,
                title: "No Investment Ever",
                desc: "We never ask you to pay. We pay you. Period."
              },
              {
                icon: Clock,
                title: "Instant UPI Payouts",
                desc: "Real money to your real bank account within 24 hours."
              },
              {
                icon: Award,
                title: "Backed by Real Brands",
                desc: "We work with Flipkart, Amazon & Jio. They pay us, we share with you."
              }
            ].map((item, index) => (
              <div key={index} className="text-center p-4 bg-white/80 rounded-xl shadow-sm">
                <item.icon className="w-10 h-10 text-orange-500 mx-auto mb-3" />
                <h3 className="font-bold text-gray-900 mb-1">{item.title}</h3>
                <p className="text-sm text-gray-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="container mx-auto px-4 py-12 sm:py-16 bg-white/50">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">Questions? Answered.</h2>
            <p className="text-gray-600 text-lg">Everything you need to know about getting started</p>
          </div>

          <div className="space-y-4">
            {[
              {
                q: "How much can I realistically earn per day?",
                a: "Most users earn ₹50-₹200 per day spending 30-45 minutes. Power users who refer friends can earn ₹500+ daily. There's no limit!"
              },
              {
                q: "Is there any fee to join or withdraw?",
                a: "Absolutely not. Qyantra is 100% free. We make money from brands who pay us for user feedback and installs, then share that with you."
              },
              {
                q: "How does the AI shopping assistant work?",
                a: "Just chat with our AI like you would with a friend. Tell it 'I need a phone under ₹15,000 with good camera' and get personalized recommendations with best prices in seconds."
              },
              {
                q: "When and how do I get paid?",
                a: "You can withdraw anytime once you hit ₹50. Money is transferred to your UPI ID (Paytm, Google Pay, PhonePe) within 24 hours."
              }
            ].map((faq, index) => (
              <div key={index} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
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
          {/* Animated Background Elements */}
          <div className="absolute top-0 left-0 w-64 h-64 bg-white/10 rounded-full -ml-32 -mt-32 animate-pulse" />
          <div className="absolute bottom-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mb-32 animate-pulse delay-1000" />
          
          <div className="relative z-10">
            <Gift className="w-16 h-16 text-white mx-auto mb-6 animate-bounce" />
            <h2 className="text-3xl sm:text-5xl font-bold text-white mb-4">Ready to Start?</h2>
            <p className="text-lg sm:text-xl text-blue-100 mb-8 max-w-xl mx-auto">
              Join 10,000+ Indians who are already shopping smarter and earning daily. 
              Takes 30 seconds to get started.
            </p>
            
            <Link href={user ? "/dashboard" : "/auth/sign-up"} className="block sm:inline-block">
              <Button
                size="lg"
                className="w-full sm:w-auto bg-white text-blue-600 hover:bg-gray-100 text-lg px-10 py-7 rounded-full shadow-2xl hover:shadow-3xl transition-all hover:-translate-y-1 font-bold"
              >
                {user ? "Open My Dashboard" : "Create Free Account"}
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            
            <p className="text-sm text-blue-200 mt-6 flex items-center justify-center gap-2">
              <Shield className="w-4 h-4" />
              No credit card required • Cancel anytime • 100% Free
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white mt-12 sm:mt-16">
        <div className="container mx-auto px-4 py-8 sm:py-12">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-green-500 flex items-center justify-center shadow-lg">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <span className="font-bold text-xl bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
                Qyantra
              </span>
            </div>
            
            <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-600">
              <Link href="/about" className="hover:text-blue-600 transition-colors">About Us</Link>
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
            © 2026 Qyantra. All rights reserved. Helping Indians shop smarter and earn better.
          </div>
        </div>
      </footer>
    </div>
  )
}