import Link from "next/link"
import { Sparkles, ArrowLeft } from "lucide-react"

export default function TermsPage() {
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
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Terms of Service</h1>
        <p className="text-gray-500 mb-10">Last updated: March 2026</p>
        <div className="space-y-8 text-gray-700 leading-relaxed">
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">1. Acceptance</h2>
            <p>By using Qyantra, you agree to these terms. If you do not agree, please do not use the platform.</p>
          </section>
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">2. Eligibility</h2>
            <p>You must be at least 18 years old and a resident of India to use Qyantra.</p>
          </section>
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">3. Earning Rules</h2>
            <p>Earnings are credited only for genuine task completions. Fraudulent activity, fake installs, or manipulation of any kind will result in immediate account termination and forfeiture of earnings.</p>
          </section>
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">4. Payouts</h2>
            <p>Minimum payout is ₹50. Payouts are processed manually within 24 hours of approval. We reserve the right to verify task completions before approving payouts.</p>
          </section>
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">5. Account Termination</h2>
            <p>We reserve the right to terminate accounts that violate these terms, engage in fraud, or abuse the platform.</p>
          </section>
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">6. Limitation of Liability</h2>
            <p>Qyantra is not responsible for changes in task availability or payout amounts. Earnings are not guaranteed and depend on available tasks.</p>
          </section>
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">7. Contact</h2>
            <p>Questions? Contact us at <a href="mailto:support@qyantra.com" className="text-blue-600 hover:underline">support@qyantra.com</a></p>
          </section>
        </div>
      </main>
    </div>
  )
}