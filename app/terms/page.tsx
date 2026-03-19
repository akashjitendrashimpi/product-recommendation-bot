import Link from "next/link"
import type { Metadata } from "next"
import { Sparkles, ArrowLeft, Shield } from "lucide-react"

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "Read Qyantra's Terms of Service. Understand your rights, earning rules, payout policies, and prohibited activities on our rewards platform.",
  alternates: { canonical: "https://www.qyantra.online/terms" },
  robots: { index: true, follow: true },
}

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center shadow-sm">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="font-black text-lg text-gray-900">Qyantra</span>
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-10 sm:py-14">
        <Link href="/" className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-8 text-sm font-semibold">
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>

        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
            <Shield className="w-5 h-5 text-blue-600" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-gray-900">Terms of Service</h1>
        </div>
        <p className="text-gray-500 mb-10 text-sm">Last updated: March 2026</p>

        <div className="space-y-8 text-gray-700 leading-relaxed">

          {/* 1 */}
          <section className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
            <h2 className="text-lg font-black text-gray-900 mb-3">1. Acceptance of Terms</h2>
            <p className="text-sm text-gray-600">
              By accessing or using Qyantra ("Platform", "we", "us", "our"), you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree to these terms, please do not use the platform. These terms apply to all users worldwide.
            </p>
          </section>

          {/* 2 */}
          <section className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
            <h2 className="text-lg font-black text-gray-900 mb-3">2. Eligibility</h2>
            <p className="text-sm text-gray-600 mb-2">
              You must be at least 18 years of age to use Qyantra. By creating an account, you confirm that you meet this requirement. Platform features including UPI payouts are currently available to residents of India only. International users may browse the platform but cannot withdraw earnings until supported payout methods are available in their region.
            </p>
            <p className="text-sm text-gray-600">
              We reserve the right to terminate accounts that do not meet eligibility criteria without prior notice.
            </p>
          </section>

          {/* 3 */}
          <section className="bg-white rounded-2xl p-6 border border-blue-50 shadow-sm">
            <h2 className="text-lg font-black text-gray-900 mb-3">3. Platform Nature — Incentive Traffic Disclosure</h2>
            <p className="text-sm text-gray-600 mb-3">
              Qyantra is an <strong>incentive-based rewards platform</strong>. Users receive monetary compensation in exchange for completing advertiser tasks such as app installations, product trials, reviews, and surveys.
            </p>
            <p className="text-sm text-gray-600">
              This constitutes "incentive traffic" as defined by digital advertising industry standards. All advertisers and CPA/CPI networks whose offers appear on this platform are informed of and consent to the incentivized nature of traffic generated through Qyantra.
            </p>
          </section>

          {/* 4 */}
          <section className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
            <h2 className="text-lg font-black text-gray-900 mb-3">4. Earning Rules</h2>
            <ul className="text-sm text-gray-600 space-y-2">
              <li>• Earnings are credited only for genuine, verifiable task completions.</li>
              <li>• Fraudulent activity, fake installs, VPN usage to manipulate geo-targeting, multiple accounts, or any manipulation of task completion data will result in immediate account termination and forfeiture of all earnings.</li>
              <li>• We reserve the right to verify task completions before crediting earnings.</li>
              <li>• Earnings are not guaranteed and depend entirely on available tasks, your region, and task completion quality.</li>
              <li>• Qyantra reserves the right to reverse credited earnings if fraud is detected after crediting.</li>
            </ul>
          </section>

          {/* 5 */}
          <section className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
            <h2 className="text-lg font-black text-gray-900 mb-3">5. Payouts</h2>
            <ul className="text-sm text-gray-600 space-y-2">
              <li>• Minimum withdrawal amount is subject to change at any time and is displayed in your dashboard at the time of withdrawal.</li>
              <li>• Payouts are processed manually within 24 hours of your withdrawal request.</li>
              <li>• You must have a valid UPI ID set in your profile to receive payments.</li>
              <li>• We reserve the right to hold or reverse payments if fraud or policy violations are suspected.</li>
              <li>• Qyantra is not responsible for UPI transfer delays caused by third-party payment apps.</li>
              <li>• Earnings are paid in Indian Rupees (INR) only. Currency conversion is not supported.</li>
            </ul>
          </section>

          {/* 6 */}
          <section className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
            <h2 className="text-lg font-black text-gray-900 mb-3">6. Prohibited Activities</h2>
            <ul className="text-sm text-gray-600 space-y-2">
              <li>• Creating multiple accounts</li>
              <li>• Using VPNs or proxies to manipulate task availability or geo-targeting</li>
              <li>• Submitting fake or manipulated screenshots as proof</li>
              <li>• Installing and immediately uninstalling apps to claim rewards</li>
              <li>• Any automated or bot-assisted task completion</li>
              <li>• Attempting to refer yourself or the same person multiple times</li>
              <li>• Reverse engineering, scraping, or attempting to exploit the platform</li>
              <li>• Using the platform for money laundering or any illegal financial activity</li>
            </ul>
          </section>

          {/* 7 */}
          <section className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
            <h2 className="text-lg font-black text-gray-900 mb-3">7. Account Termination</h2>
            <p className="text-sm text-gray-600">
              We reserve the right to suspend or permanently terminate accounts that violate these terms, engage in fraudulent activity, abuse the referral system, or harm the platform or its advertisers. Terminated accounts forfeit all pending earnings. You may also delete your account at any time by contacting us.
            </p>
          </section>

          {/* 8 */}
          <section className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
            <h2 className="text-lg font-black text-gray-900 mb-3">8. No Guarantee of Earnings</h2>
            <p className="text-sm text-gray-600">
              Qyantra does not guarantee any specific level of earnings. Task availability, payout amounts, and earning potential may change at any time based on advertiser demand. All earnings estimates provided on our platform are indicative only and do not constitute a promise or contract.
            </p>
          </section>

          {/* 9 */}
          <section className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
            <h2 className="text-lg font-black text-gray-900 mb-3">9. Intellectual Property</h2>
            <p className="text-sm text-gray-600">
              All content on Qyantra including but not limited to logos, text, graphics, and code is the intellectual property of Qyantra and protected under applicable copyright laws. You may not reproduce, distribute, or create derivative works without our written consent.
            </p>
          </section>

          {/* 10 */}
          <section className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
            <h2 className="text-lg font-black text-gray-900 mb-3">10. Privacy</h2>
            <p className="text-sm text-gray-600">
              Your use of the platform is governed by our{" "}
              <Link href="/privacy" className="text-blue-600 hover:underline font-semibold">Privacy Policy</Link>,
              which is incorporated into these Terms by reference. By using Qyantra you consent to the collection and use of your data as described in the Privacy Policy.
            </p>
          </section>

          {/* 11 */}
          <section className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
            <h2 className="text-lg font-black text-gray-900 mb-3">11. Limitation of Liability</h2>
            <p className="text-sm text-gray-600">
              Qyantra is not liable for changes in task availability, payout amounts, advertiser actions, or any indirect, incidental, or consequential damages arising from your use of the platform. Our total liability shall not exceed the amount paid to you in the 30 days preceding any claim. The platform is provided "as is" without warranties of any kind.
            </p>
          </section>

          {/* 12 - NEW */}
          <section className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
            <h2 className="text-lg font-black text-gray-900 mb-3">12. Governing Law & Dispute Resolution</h2>
            <p className="text-sm text-gray-600">
              These Terms are governed by the laws of India. Any disputes arising out of or relating to these Terms shall be subject to the exclusive jurisdiction of the courts of India. For international users, disputes shall be resolved through binding arbitration under Indian Arbitration and Conciliation Act, 1996.
            </p>
          </section>

          {/* 13 - NEW */}
          <section className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
            <h2 className="text-lg font-black text-gray-900 mb-3">13. Grievance Officer <span className="text-xs font-normal text-gray-400">(India IT Act Compliance)</span></h2>
            <p className="text-sm text-gray-600">
              In accordance with the Information Technology Act 2000 and rules made thereunder, the name and contact details of the Grievance Officer are provided below. Users may contact the Grievance Officer for any complaints or concerns.
            </p>
            <div className="mt-3 bg-gray-50 rounded-xl p-4 text-sm text-gray-600 space-y-1">
              <p><strong>Name:</strong> Qyantra Grievance Team</p>
              <p><strong>Email:</strong>{" "}
                <a href="mailto:contact@qyantra.online" className="text-blue-600 hover:underline font-semibold">
                  contact@qyantra.online
                </a>
              </p>
              <p><strong>Response time:</strong> Within 30 days of receipt</p>
            </div>
          </section>

          {/* 14 */}
          <section className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
            <h2 className="text-lg font-black text-gray-900 mb-3">14. Changes to Terms</h2>
            <p className="text-sm text-gray-600">
              We may update these terms at any time. Continued use of the platform after changes constitutes acceptance of the revised terms. We will notify users of significant changes via email or in-app notification. It is your responsibility to review these terms periodically.
            </p>
          </section>

          {/* 15 */}
          <section className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
            <h2 className="text-lg font-black text-gray-900 mb-3">15. Contact</h2>
            <p className="text-sm text-gray-600">
              For questions about these terms, contact us at:{" "}
              <a href="mailto:contact@qyantra.online" className="text-blue-600 hover:underline font-semibold">
                contact@qyantra.online
              </a>
            </p>
          </section>

        </div>
      </main>

      <footer className="border-t border-gray-200 bg-white mt-8 py-6 px-4 text-center text-sm text-gray-400">
        <p>© 2026 Qyantra · <Link href="/privacy" className="hover:text-gray-600">Privacy Policy</Link> · <Link href="/terms" className="hover:text-gray-600">Terms</Link></p>
      </footer>
    </div>
  )
}