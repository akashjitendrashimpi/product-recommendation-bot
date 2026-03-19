import Link from "next/link"
import type { Metadata } from "next"
import { Sparkles, ArrowLeft, Lock } from "lucide-react"

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Learn how Qyantra collects, uses, and protects your personal data. We are committed to your privacy and data security.",
  alternates: { canonical: "https://www.qyantra.online/privacy" },
  robots: { index: true, follow: true },
}

export default function PrivacyPage() {
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
            <Lock className="w-5 h-5 text-blue-600" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-gray-900">Privacy Policy</h1>
        </div>
        <p className="text-gray-500 mb-10 text-sm">Last updated: March 2026</p>

        <div className="space-y-8 text-gray-700 leading-relaxed">

          {/* 1 */}
          <section className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
            <h2 className="text-lg font-black text-gray-900 mb-3">1. Information We Collect</h2>
            <p className="text-sm text-gray-600 mb-3">
              We collect the following information when you create an account or use the platform:
            </p>
            <ul className="text-sm text-gray-600 space-y-2">
              <li>• <strong>Account data:</strong> Email address, display name, and phone number</li>
              <li>• <strong>Payment data:</strong> UPI ID for processing payouts</li>
              <li>• <strong>Activity data:</strong> Tasks completed, earnings accumulated, withdrawal history</li>
              <li>• <strong>Technical data:</strong> IP address, browser type, device type, and usage logs</li>
              <li>• <strong>Referral data:</strong> Referral links used and friends referred</li>
            </ul>
          </section>

          {/* 2 */}
          <section className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
            <h2 className="text-lg font-black text-gray-900 mb-3">2. How We Use Your Information</h2>
            <ul className="text-sm text-gray-600 space-y-2">
              <li>• To operate the platform and provide our services</li>
              <li>• To process your payout requests via UPI</li>
              <li>• To verify task completions and prevent fraud</li>
              <li>• To send important account notifications and updates</li>
              <li>• To improve platform performance and user experience</li>
              <li>• To comply with legal obligations and resolve disputes</li>
              <li>• To share anonymized, aggregated data with advertisers for campaign reporting</li>
            </ul>
            <p className="text-sm text-gray-600 mt-3">
              <strong>We do not sell your personal data to third parties.</strong>
            </p>
          </section>

          {/* 3 */}
          <section className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
            <h2 className="text-lg font-black text-gray-900 mb-3">3. Legal Basis for Processing <span className="text-xs font-normal text-gray-400">(GDPR — EU Users)</span></h2>
            <p className="text-sm text-gray-600 mb-2">
              For users in the European Union, we process your data under the following legal bases:
            </p>
            <ul className="text-sm text-gray-600 space-y-2">
              <li>• <strong>Contract:</strong> Processing necessary to provide our services and process payouts</li>
              <li>• <strong>Legitimate interests:</strong> Fraud prevention, platform security, and service improvement</li>
              <li>• <strong>Legal obligation:</strong> Compliance with applicable laws and regulations</li>
              <li>• <strong>Consent:</strong> For marketing communications (you may withdraw consent at any time)</li>
            </ul>
          </section>

          {/* 4 */}
          <section className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
            <h2 className="text-lg font-black text-gray-900 mb-3">4. UPI & Payment Data</h2>
            <p className="text-sm text-gray-600">
              Your UPI ID is stored securely and used solely for processing payouts you request. We do not store any banking passwords, PINs, or sensitive financial credentials. UPI transactions are processed through standard UPI infrastructure and are subject to the policies of your respective UPI app provider (Paytm, GPay, PhonePe, etc.).
            </p>
          </section>

          {/* 5 */}
          <section className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
            <h2 className="text-lg font-black text-gray-900 mb-3">5. Data Sharing & Third Parties</h2>
            <p className="text-sm text-gray-600 mb-3">
              We share your data only in the following limited circumstances:
            </p>
            <ul className="text-sm text-gray-600 space-y-2">
              <li>• <strong>Advertisers & CPA/CPI networks:</strong> Anonymized task completion data only (no personal details)</li>
              <li>• <strong>Payment processors:</strong> UPI ID shared only for processing your requested payout</li>
              <li>• <strong>Legal authorities:</strong> If required by law, court order, or to protect our legal rights</li>
              <li>• <strong>Business transfer:</strong> In the event of a merger or acquisition, your data may be transferred with prior notice</li>
            </ul>
            <p className="text-sm text-gray-600 mt-3">
              We never share your email, phone number, or personal identity with advertisers.
            </p>
          </section>

          {/* 6 */}
          <section className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
            <h2 className="text-lg font-black text-gray-900 mb-3">6. Data Retention</h2>
            <p className="text-sm text-gray-600">
              We retain your personal data for as long as your account is active or as needed to provide services. If you delete your account, we will delete your personal data within <strong>30 days</strong>, except where we are required to retain it by law (e.g., financial records for up to 7 years as required by Indian tax law). Anonymized aggregated data may be retained indefinitely.
            </p>
          </section>

          {/* 7 */}
          <section className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
            <h2 className="text-lg font-black text-gray-900 mb-3">7. Data Security</h2>
            <ul className="text-sm text-gray-600 space-y-2">
              <li>• Passwords are hashed using industry-standard algorithms and never stored in plain text</li>
              <li>• All data is transmitted over encrypted HTTPS connections</li>
              <li>• Platform is protected by Cloudflare DDoS protection and WAF</li>
              <li>• Access to user data is strictly limited to authorized personnel only</li>
              <li>• Regular security audits are conducted to identify and fix vulnerabilities</li>
            </ul>
          </section>

          {/* 8 */}
          <section className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
            <h2 className="text-lg font-black text-gray-900 mb-3">8. Cookies & Tracking</h2>
            <p className="text-sm text-gray-600 mb-3">We use the following types of cookies:</p>
            <ul className="text-sm text-gray-600 space-y-2">
              <li>• <strong>Essential cookies:</strong> Required for authentication and keeping you logged in</li>
              <li>• <strong>Analytics cookies:</strong> Vercel Analytics to understand platform usage (anonymized)</li>
            </ul>
            <p className="text-sm text-gray-600 mt-3">
              We do not use advertising or tracking cookies. We do not use third-party ad trackers.
            </p>
          </section>

          {/* 9 */}
          <section className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
            <h2 className="text-lg font-black text-gray-900 mb-3">9. Your Rights</h2>
            <p className="text-sm text-gray-600 mb-3">Depending on your location, you have the following rights:</p>
            <ul className="text-sm text-gray-600 space-y-2">
              <li>• <strong>Access:</strong> Request a copy of the personal data we hold about you</li>
              <li>• <strong>Correction:</strong> Request correction of inaccurate or incomplete data</li>
              <li>• <strong>Deletion:</strong> Request deletion of your account and personal data</li>
              <li>• <strong>Portability:</strong> Request your data in a structured, machine-readable format (GDPR)</li>
              <li>• <strong>Objection:</strong> Object to processing of your data for certain purposes</li>
              <li>• <strong>Withdraw consent:</strong> Withdraw consent for marketing communications at any time</li>
            </ul>
            <p className="text-sm text-gray-600 mt-3">
              To exercise any of these rights, contact us at{" "}
              <a href="mailto:contact@qyantra.online" className="text-blue-600 hover:underline font-semibold">
                contact@qyantra.online
              </a>. We will respond within 30 days.
            </p>
          </section>

          {/* 10 */}
          <section className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
            <h2 className="text-lg font-black text-gray-900 mb-3">10. Children's Privacy</h2>
            <p className="text-sm text-gray-600">
              Qyantra is not intended for users under the age of 18. We do not knowingly collect personal data from minors. If we become aware that a minor has provided us with personal data, we will delete it immediately. If you believe a minor has created an account, please contact us.
            </p>
          </section>

          {/* 11 */}
          <section className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
            <h2 className="text-lg font-black text-gray-900 mb-3">11. International Data Transfers</h2>
            <p className="text-sm text-gray-600">
              Qyantra is operated from India. If you are accessing our platform from outside India, your data will be transferred to and processed in India. By using our platform, you consent to this transfer. We ensure appropriate safeguards are in place for international transfers in compliance with applicable data protection laws including GDPR.
            </p>
          </section>

          {/* 12 */}
          <section className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
            <h2 className="text-lg font-black text-gray-900 mb-3">12. California Privacy Rights <span className="text-xs font-normal text-gray-400">(CCPA — US Users)</span></h2>
            <p className="text-sm text-gray-600 mb-2">
              California residents have the following additional rights under CCPA:
            </p>
            <ul className="text-sm text-gray-600 space-y-2">
              <li>• Right to know what personal information is collected and how it is used</li>
              <li>• Right to delete personal information</li>
              <li>• Right to opt out of the sale of personal information</li>
              <li>• Right to non-discrimination for exercising your privacy rights</li>
            </ul>
            <p className="text-sm text-gray-600 mt-3">
              <strong>We do not sell personal information.</strong> To exercise your rights, contact us at{" "}
              <a href="mailto:contact@qyantra.online" className="text-blue-600 hover:underline font-semibold">
                contact@qyantra.online
              </a>.
            </p>
          </section>

          {/* 13 */}
          <section className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
            <h2 className="text-lg font-black text-gray-900 mb-3">13. India — DPDP Act 2023 Compliance</h2>
            <p className="text-sm text-gray-600">
              Qyantra complies with India's Digital Personal Data Protection Act 2023. As a Data Fiduciary, we ensure your data is processed lawfully, for stated purposes only, with appropriate security safeguards. You have the right to nominate a representative to exercise your data rights. For grievances under DPDP Act, contact our Grievance Officer below.
            </p>
          </section>

          {/* 14 */}
          <section className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
            <h2 className="text-lg font-black text-gray-900 mb-3">14. Changes to This Policy</h2>
            <p className="text-sm text-gray-600">
              We may update this Privacy Policy from time to time. We will notify you of significant changes via email or in-app notification. Continued use of the platform after changes constitutes acceptance of the updated policy. We encourage you to review this policy periodically.
            </p>
          </section>

          {/* 15 */}
          <section className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
            <h2 className="text-lg font-black text-gray-900 mb-3">15. Grievance Officer <span className="text-xs font-normal text-gray-400">(India IT Act Compliance)</span></h2>
            <p className="text-sm text-gray-600 mb-3">
              In accordance with the Information Technology Act 2000 and the DPDP Act 2023, users may contact our Grievance Officer for any privacy-related complaints:
            </p>
            <div className="bg-gray-50 rounded-xl p-4 text-sm text-gray-600 space-y-1">
              <p><strong>Name:</strong> Qyantra Grievance Team</p>
              <p><strong>Email:</strong>{" "}
                <a href="mailto:contact@qyantra.online" className="text-blue-600 hover:underline font-semibold">
                  contact@qyantra.online
                </a>
              </p>
              <p><strong>Response time:</strong> Within 30 days of receipt</p>
            </div>
          </section>

          {/* 16 */}
          <section className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
            <h2 className="text-lg font-black text-gray-900 mb-3">16. Contact</h2>
            <p className="text-sm text-gray-600">
              For any privacy concerns or questions, contact us at:{" "}
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