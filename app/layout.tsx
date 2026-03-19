import { Analytics } from "@vercel/analytics/next"
import type React from "react"
import type { Metadata, Viewport } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import "./globals.css"

const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })

export const viewport: Viewport = {
  themeColor: "#2563eb",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
}

export const metadata: Metadata = {
  title: {
    default: "Qyantra — Earn Real Money Daily with UPI Payout",
    template: "%s | Qyantra",
  },
  description:
    "Qyantra is India's trusted earn-money platform. Complete simple tasks — install apps, write reviews, fill surveys — and get paid directly to Paytm, GPay or PhonePe. Minimum payout ₹50. 100% free. No investment.",
  keywords: [
    "earn money online india",
    "earning for students",
    "free earning websites for students",
    "earning websites through tasks",
    "earning websites",
    "earning for students online",
    "earn money daily india",
    "best earning app india 2026",
    "real money earning app india",
    "earn paytm cash daily",
    "earn google pay money",
    "earn phonepe cash",
    "UPI payout earning app",
    "task earning app india",
    "earn money completing tasks india",
    "earn money by installing apps india",
    "earn money writing reviews india",
    "earn money surveys india",
    "free earning app no investment india",
    "trusted earning app india 2026",
    "earn money online without investment india",
    "micro task earning platform india",
    "daily payout earning app india",
    "earn money smartphone india",
    "Qyantra",
    "qyantra earning",
    "qyantra app",
  ],
  authors: [{ name: "Qyantra", url: "https://www.qyantra.online" }],
  creator: "Qyantra",
  publisher: "Qyantra",
  metadataBase: new URL("https://www.qyantra.online"),
  alternates: {
    canonical: "https://www.qyantra.online",
  },
  openGraph: {
    title: "Qyantra — Earn Real Money Daily with UPI Payout",
    description:
      "Complete simple tasks and earn real cash to your UPI. Install apps, write reviews, take surveys. Minimum payout ₹50. 100% free to join. No investment ever.",
    url: "https://www.qyantra.online",
    siteName: "Qyantra",
    locale: "en_IN",
    type: "website",
    images: [
      {
        url: "/web-app-manifest-512x512.png",
        width: 512,
        height: 512,
        alt: "Qyantra — Earn Real Money Daily",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Qyantra — Earn Real Money Daily with UPI Payout",
    description:
      "Complete simple tasks and earn real cash to your UPI. Free to join. No investment.",
    images: ["/web-app-manifest-512x512.png"],
    creator: "@qyantra",
    site: "@qyantra",
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon-96x96.png", sizes: "96x96", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
    shortcut: "/favicon.ico",
  },
  manifest: "/site.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Qyantra",
  },
  category: "finance",
  classification: "Rewards & Earning Platform",
  formatDetection: {
    telephone: false,
    date: false,
    email: false,
    address: false,
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    // google: "your-google-search-console-code",
    // yandex: "your-yandex-code",
    // bing: "your-bing-code",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en-IN">
      <head>
        {/* PWA */}
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="application-name" content="Qyantra" />
        <meta name="apple-mobile-web-app-title" content="Qyantra" />

        {/* Security — only referrer works as meta, rest handled by next.config.mjs headers */}
        <meta name="referrer" content="strict-origin-when-cross-origin" />

        {/* Geo targeting India */}
        <meta name="geo.region" content="IN" />
        <meta name="geo.placename" content="India" />
        <meta name="language" content="English" />

        {/* Performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://fonts.googleapis.com" />
        <link rel="dns-prefetch" href="https://www.googletagmanager.com" />

        {/* JSON-LD Structured Data — WebApplication schema for Google rich results */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              "name": "Qyantra",
              "url": "https://www.qyantra.online",
              "description": "India's trusted platform to earn real money by completing simple tasks. UPI payouts to Paytm, GPay, PhonePe. Free to join. No investment.",
              "applicationCategory": "FinanceApplication",
              "operatingSystem": "Web, Android, iOS",
              "inLanguage": "en-IN",
              "isAccessibleForFree": true,
              "offers": {
                "@type": "Offer",
                "price": "0",
                "priceCurrency": "INR",
                "description": "Free to join. Earn ₹50–₹500 per day by completing simple tasks."
              },
              "publisher": {
                "@type": "Organization",
                "name": "Qyantra",
                "url": "https://www.qyantra.online",
                "logo": {
                  "@type": "ImageObject",
                  "url": "https://www.qyantra.online/web-app-manifest-512x512.png"
                },
                "contactPoint": {
                  "@type": "ContactPoint",
                  "email": "support@qyantra.online",
                  "contactType": "customer support"
                }
              },
              "sameAs": [
                "https://qyantra.vercel.app"
              ]
            })
          }}
        />

        {/* JSON-LD — FAQ schema for Google FAQ rich results */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "FAQPage",
              "mainEntity": [
                {
                  "@type": "Question",
                  "name": "Is Qyantra really free? No hidden charges?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "100% free. We will never ask you to pay, invest, or buy anything. We earn from advertisers when users complete tasks and share that revenue with you."
                  }
                },
                {
                  "@type": "Question",
                  "name": "How much can I earn per day on Qyantra?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Typical users earn ₹50–₹250 per day spending 20–40 minutes. Earnings depend on task availability and are not guaranteed."
                  }
                },
                {
                  "@type": "Question",
                  "name": "How do I get paid on Qyantra?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Once your balance reaches ₹50, you can request a withdrawal to your UPI ID (Paytm, GPay, PhonePe). Processed within 24 hours."
                  }
                },
                {
                  "@type": "Question",
                  "name": "What tasks can I complete on Qyantra?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Install apps, write reviews, sign up on platforms, complete surveys, and try products. Tasks take 2–10 minutes and require no special skills."
                  }
                }
              ]
            })
          }}
        />
      </head>
      <body className="font-sans antialiased">
        {children}
        <Analytics />
      </body>
    </html>
  )
}