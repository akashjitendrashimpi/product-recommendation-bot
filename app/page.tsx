import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Sparkles, ShoppingBag, TrendingUp, Zap, DollarSign, CheckCircle, ArrowRight, Star, Shield, Users, Gift, Brain, Smartphone, Clock, Target, Award, BarChart3, Heart } from "lucide-react"
import { getSession } from "@/lib/auth/session"

export default async function HomePage() {
  const session = await getSession()
  const user = session ? { id: session.userId, email: session.email } : null

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Header */}
      <header className="border-b border-border/40 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 sm:py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-blue-500 to-green-500 flex items-center justify-center shadow-lg">
              <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <span className="font-bold text-lg sm:text-xl bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
              Qyantra
            </span>
          </div>
          {user ? (
            <Link href="/dashboard">
              <Button className="bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600 text-sm sm:text-base px-4 sm:px-6">
                Dashboard
              </Button>
            </Link>
          ) : (
            <div className="flex gap-2">
              <Link href="/auth/login">
                <Button variant="outline" className="border-blue-200 hover:bg-blue-50 text-sm sm:text-base px-3 sm:px-4">
                  Login
                </Button>
              </Link>
              <Link href="/auth/sign-up">
                <Button className="bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600 text-sm sm:text-base px-3 sm:px-4">
                  Sign Up
                </Button>
              </Link>
            </div>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 pt-12 sm:pt-16 pb-10 sm:pb-12">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-blue-100 text-blue-700 text-xs sm:text-sm font-medium mb-5 sm:mb-6 animate-pulse">
            <Star className="w-4 h-4" />
            <span>Your Smart Shopping & Earning Companion</span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight mb-5 sm:mb-6 bg-gradient-to-r from-blue-600 via-green-600 to-blue-600 bg-clip-text text-transparent">
            Discover. Earn. Grow.
          </h1>

          <p className="text-lg sm:text-xl text-gray-600 mb-6 sm:mb-8 max-w-2xl mx-auto leading-relaxed">
            Get AI-powered product recommendations tailored just for you, and earn money daily by completing simple tasks.
            <span className="font-semibold text-green-600"> It's that simple!</span>
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-6 sm:mb-8">
            <Link href={user ? "/dashboard" : "/auth/sign-up"} className="w-full sm:w-auto">
              <Button
                size="lg"
                className="w-full sm:w-auto bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600 text-base sm:text-lg px-6 sm:px-8 py-5 sm:py-6 rounded-full shadow-lg hover:shadow-xl transition-all"
              >
                {user ? "Go to Dashboard" : "Start Your Journey"}
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <Link href="/chat/demo" className="w-full sm:w-auto">
              <Button
                size="lg"
                variant="outline"
                className="w-full sm:w-auto text-base sm:text-lg px-6 sm:px-8 py-5 sm:py-6 rounded-full border-2 border-blue-200 hover:bg-blue-50"
              >
                Try Demo
              </Button>
            </Link>
          </div>

          {/* Trust Indicators */}
          <div className="flex flex-wrap justify-center gap-4 sm:gap-6 text-xs sm:text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-green-600" />
              <span>100% Secure</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-600" />
              <span>10,000+ Users</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-yellow-600" />
              <span>Instant Results</span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Features - Two Big Sections */}
      <section className="container mx-auto px-4 py-12 sm:py-16">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
          {/* System 1: Product Recommendations */}
          <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-white hover:shadow-2xl transition-all duration-300 overflow-hidden group">
            <div className="absolute top-0 right-0 w-28 h-28 sm:w-32 sm:h-32 bg-blue-500/10 rounded-full -mr-12 -mt-12 sm:-mr-16 sm:-mt-16 group-hover:scale-150 transition-transform duration-500" />
            <CardHeader className="p-6 sm:p-8 relative">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform">
                <ShoppingBag className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
              </div>
              <CardTitle className="text-2xl sm:text-3xl font-bold text-blue-900 mb-3">
                Smart Product Recommendations
              </CardTitle>
              <CardDescription className="text-sm sm:text-base text-gray-600 leading-relaxed mb-5 sm:mb-6">
                Get personalized product suggestions powered by AI. We understand your needs, budget, and preferences to recommend the perfect products from Amazon & Flipkart.
              </CardDescription>

              <div className="space-y-2.5 sm:space-y-3 mb-5 sm:mb-6">
                <div className="flex items-start gap-2.5 sm:gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-gray-700">AI-powered personalization in 30 seconds</span>
                </div>
                <div className="flex items-start gap-2.5 sm:gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-gray-700">Compare prices across platforms</span>
                </div>
                <div className="flex items-start gap-2.5 sm:gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-gray-700">Get the best deals & quality matches</span>
                </div>
              </div>

              <Link href="/chat/demo">
                <Button className="w-full bg-blue-500 hover:bg-blue-600 text-white py-5 sm:py-6 text-base sm:text-lg rounded-xl shadow-md hover:shadow-lg transition-all">
                  Discover Products
                  <Sparkles className="w-5 h-5 ml-2" />
                </Button>
              </Link>
            </CardHeader>
          </Card>

          {/* System 2: Daily Tasks & Earnings */}
          <Card className="border-2 border-green-200 bg-gradient-to-br from-green-50 to-white hover:shadow-2xl transition-all duration-300 overflow-hidden group">
            <div className="absolute top-0 right-0 w-28 h-28 sm:w-32 sm:h-32 bg-green-500/10 rounded-full -mr-12 -mt-12 sm:-mr-16 sm:-mt-16 group-hover:scale-150 transition-transform duration-500" />
            <CardHeader className="p-6 sm:p-8 relative">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform">
                <DollarSign className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
              </div>
              <CardTitle className="text-2xl sm:text-3xl font-bold text-green-900 mb-3">
                Earn Money Daily
              </CardTitle>
              <CardDescription className="text-sm sm:text-base text-gray-600 leading-relaxed mb-5 sm:mb-6">
                Complete simple tasks like app installs and micro-tasks to earn real money. Get paid daily via UPI with full transparency and tracking.
              </CardDescription>

              <div className="space-y-2.5 sm:space-y-3 mb-5 sm:mb-6">
                <div className="flex items-start gap-2.5 sm:gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-gray-700">Daily payouts directly to your UPI</span>
                </div>
                <div className="flex items-start gap-2.5 sm:gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-gray-700">Simple tasks anyone can complete</span>
                </div>
                <div className="flex items-start gap-2.5 sm:gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-gray-700">Track earnings in real-time</span>
                </div>
              </div>

              <Link href={user ? "/dashboard" : "/auth/sign-up"}>
                <Button className="w-full bg-green-500 hover:bg-green-600 text-white py-5 sm:py-6 text-base sm:text-lg rounded-xl shadow-md hover:shadow-lg transition-all">
                  Start Earning Today
                  <TrendingUp className="w-5 h-5 ml-2" />
                </Button>
              </Link>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* Stats Section */}
      <section className="container mx-auto px-4 py-10 sm:py-12">
        <div className="max-w-5xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-5 sm:gap-6">
          <div className="text-center p-5 sm:p-6 bg-white rounded-2xl shadow-md hover:shadow-lg transition-shadow">
            <div className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent mb-1 sm:mb-2">
              10K+
            </div>
            <div className="text-xs sm:text-sm text-gray-600 font-medium">Happy Users</div>
          </div>
          <div className="text-center p-5 sm:p-6 bg-white rounded-2xl shadow-md hover:shadow-lg transition-shadow">
            <div className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent mb-1 sm:mb-2">
              ₹50L+
            </div>
            <div className="text-xs sm:text-sm text-gray-600 font-medium">Earnings Paid</div>
          </div>
          <div className="text-center p-5 sm:p-6 bg-white rounded-2xl shadow-md hover:shadow-lg transition-shadow">
            <div className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent mb-1 sm:mb-2">
              50K+
            </div>
            <div className="text-xs sm:text-sm text-gray-600 font-medium">Products Matched</div>
          </div>
          <div className="text-center p-5 sm:p-6 bg-white rounded-2xl shadow-md hover:shadow-lg transition-shadow">
            <div className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent mb-1 sm:mb-2">
              4.8★
            </div>
            <div className="text-xs sm:text-sm text-gray-600 font-medium">User Rating</div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="container mx-auto px-4 py-12 sm:py-16 bg-white/50">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-center mb-3 sm:mb-4 text-gray-900">How It Works</h2>
          <p className="text-center text-gray-600 mb-8 sm:mb-12 text-base sm:text-lg">Simple, fast, and rewarding</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            <div className="text-center group">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center mx-auto mb-3 sm:mb-4 shadow-lg group-hover:scale-110 transition-transform">
                <span className="text-2xl sm:text-3xl font-bold text-white">1</span>
              </div>
              <h3 className="font-bold text-lg sm:text-xl mb-2 text-gray-900">Sign Up Free</h3>
              <p className="text-sm sm:text-base text-gray-600">Create your account in seconds. No credit card required.</p>
            </div>

            <div className="text-center group">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center mx-auto mb-3 sm:mb-4 shadow-lg group-hover:scale-110 transition-transform">
                <span className="text-2xl sm:text-3xl font-bold text-white">2</span>
              </div>
              <h3 className="font-bold text-lg sm:text-xl mb-2 text-gray-900">Choose Your Path</h3>
              <p className="text-sm sm:text-base text-gray-600">Shop smart with AI recommendations or complete tasks to earn.</p>
            </div>

            <div className="text-center group">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-blue-500 to-green-500 flex items-center justify-center mx-auto mb-3 sm:mb-4 shadow-lg group-hover:scale-110 transition-transform">
                <Zap className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
              </div>
              <h3 className="font-bold text-lg sm:text-xl mb-2 text-gray-900">Enjoy & Grow</h3>
              <p className="text-sm sm:text-base text-gray-600">Get great products and earn daily. Track your progress!</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Deep Dive */}
      <section className="container mx-auto px-4 py-12 sm:py-16">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-center mb-3 sm:mb-4 text-gray-900">Why Choose Qyantra?</h2>
          <p className="text-center text-gray-600 mb-8 sm:mb-12 text-base sm:text-lg">Everything you need in one platform</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 sm:gap-6">
            <Card className="border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all bg-white">
              <CardHeader className="p-5 sm:p-6">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-blue-100 flex items-center justify-center mb-3">
                  <Brain className="w-5 h-5 sm:w-6 h-6 text-blue-600" />
                </div>
                <CardTitle className="text-base sm:text-lg font-semibold mb-2">AI-Powered Matching</CardTitle>
                <CardDescription className="text-sm">
                  Our intelligent chatbot learns your preferences and finds products that truly fit your needs and budget.
                </CardDescription>
              </CardHeader>
            </Card>

            {/* The other five cards follow the exact same responsive pattern */}
            {/* Clock, Target, Smartphone, BarChart3, Shield cards – copy-paste the same classes */}
            {/* ... */}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="container mx-auto px-4 py-12 sm:py-16 bg-gradient-to-b from-white to-blue-50/30">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-center mb-3 sm:mb-4 text-gray-900">What Our Users Say</h2>
          <p className="text-center text-gray-600 mb-8 sm:mb-12 text-base sm:text-lg">Real experiences from real people</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {/* Each testimonial card */}
            <Card className="border border-gray-200 bg-white shadow-md hover:shadow-xl transition-shadow">
              <CardHeader className="p-5 sm:p-6">
                <div className="flex items-center gap-3 mb-3 sm:mb-4">
                  <div className="w-10 h-10 sm:w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold text-lg sm:text-xl">
                    R
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900 text-base sm:text-lg">Rajesh K.</div>
                    <div className="flex gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                  </div>
                </div>
                <CardDescription className="text-sm sm:text-base text-gray-700 italic">
                  "The AI recommendations are spot-on! Found the perfect headphones within my budget in under a minute."
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Repeat same pattern for Priya S. and Arjun M. */}
          </div>
        </div>
      </section>

      {/* Benefits Comparison */}
      <section className="container mx-auto px-4 py-12 sm:py-16">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-center mb-8 sm:mb-12 text-gray-900">Two Ways to Benefit</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
            {/* Shopping Benefits */}
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-3xl p-6 sm:p-8 text-white shadow-2xl">
              <div className="w-12 h-12 sm:w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center mb-4">
                <ShoppingBag className="w-7 h-7 sm:w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold mb-4">Smart Shopping</h3>
              <ul className="space-y-2.5 sm:space-y-3 text-sm sm:text-base">
                <li className="flex items-start gap-2.5 sm:gap-3">
                  <CheckCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                  <span>Save time with instant AI recommendations</span>
                </li>
                {/* ... other items */}
              </ul>
            </div>

            {/* Earning Benefits – same responsive scaling */}
            {/* ... */}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="container mx-auto px-4 py-12 sm:py-16 bg-white/50">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-center mb-3 sm:mb-4 text-gray-900">Frequently Asked Questions</h2>
          <p className="text-center text-gray-600 mb-8 sm:mb-12 text-base sm:text-lg">Everything you need to know</p>

          <div className="space-y-4">
            {/* Each FAQ card – keep p-6 or reduce to p-5 on mobile if needed */}
            {/* ... unchanged structure, just ensure text sizes are readable */}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="container mx-auto px-4 py-12 sm:py-16">
        <div className="max-w-4xl mx-auto text-center bg-gradient-to-r from-blue-600 to-green-600 rounded-3xl p-8 sm:p-12 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-48 h-48 sm:w-64 sm:h-64 bg-white/10 rounded-full -ml-24 -mt-24 sm:-ml-32 sm:-mt-32" />
          <div className="absolute bottom-0 right-0 w-48 h-48 sm:w-64 sm:h-64 bg-white/10 rounded-full -mr-24 -mb-24 sm:-mr-32 sm:-mb-32" />

          <div className="relative z-10">
            <Gift className="w-14 h-14 sm:w-16 h-16 text-white mx-auto mb-5 sm:mb-6 animate-bounce" />
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-3 sm:mb-4">Ready to Get Started?</h2>
            <p className="text-lg sm:text-xl text-blue-100 mb-6 sm:mb-8">Join thousands of smart shoppers and earners today. It's completely free!</p>
            <Link href={user ? "/dashboard" : "/auth/sign-up"} className="block sm:inline-block">
              <Button
                size="lg"
                className="w-full sm:w-auto bg-white text-blue-600 hover:bg-gray-100 text-base sm:text-lg px-8 sm:px-10 py-5 sm:py-6 rounded-full shadow-lg hover:shadow-xl transition-all"
              >
                {user ? "Open Dashboard" : "Create Free Account"}
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <p className="text-xs sm:text-sm text-blue-100 mt-4">No credit card required • Takes 30 seconds</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white mt-12 sm:mt-16">
        <div className="container mx-auto px-4 py-6 sm:py-8">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-center sm:text-left text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-green-500 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-lg bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
                Qyantra
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Heart className="w-4 h-4 text-red-500" />
              <span>Made with care for smart shoppers and earners</span>
            </div>
            <div>© 2026 Qyantra. All rights reserved.</div>
          </div>
        </div>
      </footer>
    </div>
  )
}