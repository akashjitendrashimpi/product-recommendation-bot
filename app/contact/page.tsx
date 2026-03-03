import Link from "next/link"
import { Sparkles, ArrowLeft, Mail, MessageCircle } from "lucide-react"

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-green-500 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-lg bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">Qyantra</span>
          </Link>
        </div>
      </header>
      <main className="container mx-auto px-4 py-12 max-w-2xl">
        <Link href="/" className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-8 text-sm font-medium">
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Contact Us</h1>
        <p className="text-gray-500 mb-10">We're here to help. Reach out anytime.</p>
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-gray-200 p-6 flex items-start gap-4 shadow-sm">
            <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0">
              <Mail className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 mb-1">Email Support</h3>
              <p className="text-sm text-gray-500 mb-2">For account issues, payout queries, or general questions</p>
              <a href="mailto:support@qyantra.com" className="text-blue-600 font-medium hover:underline">support@qyantra.com</a>
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-gray-200 p-6 flex items-start gap-4 shadow-sm">
            <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center flex-shrink-0">
              <MessageCircle className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 mb-1">Response Time</h3>
              <p className="text-sm text-gray-500">We typically respond within 24 hours on business days.</p>
            </div>
          </div>
          <div className="bg-blue-50 rounded-2xl border border-blue-200 p-6">
            <h3 className="font-bold text-gray-900 mb-2">Payout Issues?</h3>
            <p className="text-sm text-gray-600">If your payout is delayed beyond 24 hours after approval, email us with your registered email and the payout amount. We'll resolve it immediately.</p>
          </div>
        </div>
      </main>
    </div>
  )
}