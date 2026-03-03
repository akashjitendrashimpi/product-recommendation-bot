import Link from "next/link"
import { Sparkles, ArrowLeft } from "lucide-react"

export default function PrivacyPage() {
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
      <main className="container mx-auto px-4 py-12 max-w-3xl">
        <Link href="/" className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-8 text-sm font-medium">
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Privacy Policy</h1>
        <p className="text-gray-500 mb-10">Last updated: March 2026</p>
        <div className="space-y-8 text-gray-700 leading-relaxed">
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">1. Information We Collect</h2>
            <p>We collect information you provide when creating an account: your email address, display name, phone number, and UPI ID. We also collect data about tasks you complete and earnings you accumulate.</p>
          </section>
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">2. How We Use Your Information</h2>
            <p>We use your information to operate the platform, process your payouts, and improve our services. We do not sell your personal data to third parties.</p>
          </section>
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">3. UPI & Payment Data</h2>
            <p>Your UPI ID is stored securely and used only for processing payouts you request. We do not store any banking passwords or sensitive financial credentials.</p>
          </section>
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">4. Data Security</h2>
            <p>We use industry-standard encryption to protect your data. Your password is hashed and never stored in plain text.</p>
          </section>
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">5. Cookies</h2>
            <p>We use cookies only for authentication purposes (keeping you logged in). We do not use tracking or advertising cookies.</p>
          </section>
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">6. Your Rights</h2>
            <p>You can request deletion of your account and all associated data at any time by contacting us.</p>
          </section>
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">7. Contact</h2>
            <p>For privacy concerns, contact us at <a href="mailto:support@qyantra.com" className="text-blue-600 hover:underline">support@qyantra.com</a></p>
          </section>
        </div>
      </main>
    </div>
  )
}