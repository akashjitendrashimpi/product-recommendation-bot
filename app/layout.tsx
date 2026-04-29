import { Analytics } from "@vercel/analytics/next"
import type React from "react"
import type { Metadata, Viewport } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import Script from "next/script"
import "./globals.css"

const geistSans = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
})
const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
})

// ── Constants ─────────────────────────────────────────────────────────────
const ONESIGNAL_APP_ID =
  process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID || "74c8eb14-3255-4156-b7b4-5aa9a9163f5f"

const SITE_URL = "https://www.qyantra.online"
const SITE_NAME = "Qyantra"
const SITE_DESCRIPTION =
  "Qyantra is India's trusted earn-money platform. Complete simple tasks — install apps, write reviews, fill surveys — and get paid directly to Paytm, GPay or PhonePe. 100% free. No investment."

// ── CSP Policy ────────────────────────────────────────────────────────────
// Defined here so it's consistent between meta tag (fallback) and next.config.mjs (primary)
// next.config.mjs HTTP headers take priority over meta tag in browsers
// Meta tag is a fallback for environments where headers aren't applied (CDN edge, etc.)
const CSP_POLICY = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.onesignal.com https://onesignal.com https://api.onesignal.com https://va.vercel-scripts.com https://static.cloudflareinsights.com",
  "style-src 'self' 'unsafe-inline' https://onesignal.com https://cdn.onesignal.com",
  "font-src 'self' data:",
  "img-src 'self' data: blob: https:",
  "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://onesignal.com https://api.onesignal.com https://cdn.onesignal.com https://vitals.vercel-insights.com https://va.vercel-scripts.com https://static.cloudflareinsights.com https://cloudflareinsights.com https://api.anthropic.com",
  "frame-src 'none'",
  
  "worker-src 'self' blob: https://cdn.onesignal.com",
  "manifest-src 'self'",
  "media-src 'self' blob:",
  "form-action 'self'",
  "base-uri 'self'",
  "upgrade-insecure-requests",
].join("; ")

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#2563eb" },
    { media: "(prefers-color-scheme: dark)", color: "#1d4ed8" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
}

export const metadata: Metadata = {
  title: {
    default: `${SITE_NAME} — Earn Real Money Daily with UPI Payout`,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
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
  authors: [{ name: SITE_NAME, url: SITE_URL }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  metadataBase: new URL(SITE_URL),
  // ── Alternates — canonical + Hindi future ──────────────────────────────
  alternates: {
    canonical: SITE_URL,
    languages: {
      "en-IN": SITE_URL,
      // "hi-IN": `${SITE_URL}/hi`,  ← uncomment when Hindi version is ready
    },
  },
  openGraph: {
    title: `${SITE_NAME} — Earn Real Money Daily with UPI Payout`,
    description:
      "Complete simple tasks and earn real cash to your UPI. Install apps, write reviews, take surveys. 100% free to join. No investment ever.",
    url: SITE_URL,
    siteName: SITE_NAME,
    locale: "en_IN",
    // alternateLocale: ["hi_IN"],  ← uncomment when Hindi version is ready
    type: "website",
    images: [
      {
        url: "/web-app-manifest-512x512.png",
        width: 512,
        height: 512,
        alt: `${SITE_NAME} — Earn Real Money Daily`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} — Earn Real Money Daily with UPI Payout`,
    description: "Complete simple tasks and earn real cash to your UPI. Free to join. No investment.",
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
    title: SITE_NAME,
    // ── PWA shortcuts in metadata ────────────────────────────────────────
    // Mirrors site.webmanifest shortcuts for iOS Safari PWA
    startupImage: [
      { url: "/apple-touch-icon.png" },
    ],
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
    google: "RvM0Lp4ki__Szzp-slBslAZCC_ZNxvHDAFF-8Rp8FMA",
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
        {/* ── PWA ── */}
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="application-name" content={SITE_NAME} />
        <meta name="apple-mobile-web-app-title" content={SITE_NAME} />

        {/* ── PWA Shortcuts — Android home screen quick actions ── */}
        {/* These are defined in site.webmanifest for Android */}
        {/* iOS Safari reads them from meta tags below */}
        <meta name="msapplication-TileColor" content="#2563eb" />
        <meta name="msapplication-config" content="/browserconfig.xml" />

        {/* ── Security ── */}
        <meta name="referrer" content="strict-origin-when-cross-origin" />

        {/* ── CSP Meta Tag — fallback when HTTP headers aren't applied ──
            Primary CSP is set in next.config.mjs as HTTP header (takes priority).
            This meta tag is a fallback for:
            - CDN edge nodes that strip custom headers
            - Iframe embeds (blocked by frame-ancestors anyway)
            - Old browser compatibility
            NOTE: meta CSP does NOT support frame-ancestors — that only works as HTTP header.
            NOTE: 'unsafe-inline' is required for Tailwind CSS + Next.js inline scripts.
            For stronger protection, migrate to CSP nonces (Next.js 13.4+ supports this).
        ── */}
        <meta httpEquiv="Content-Security-Policy" content={CSP_POLICY} />

        {/* ── Geo targeting India ── */}
        <meta name="geo.region" content="IN" />
        <meta name="geo.placename" content="India" />
        <meta name="language" content="English" />
        <meta name="target" content="all" />
        <meta name="audience" content="all" />
        <meta name="coverage" content="Worldwide" />
        <meta name="distribution" content="Global" />

        {/* ── Performance — priority hints for above-fold resources ──
            fetchpriority="high" tells browser to load these before other resources.
            Only use on resources needed for LCP (Largest Contentful Paint).
        ── */}
        {/* Supabase — used immediately on page load for auth */}
        <link
          rel="preconnect"
          href="https://supabase.co"
          crossOrigin="anonymous"
        />
        {/* OneSignal — loaded after page but preconnect speeds it up */}
        <link
          rel="preconnect"
          href="https://cdn.onesignal.com"
          crossOrigin="anonymous"
        />
        <link
          rel="preconnect"
          href="https://api.onesignal.com"
          crossOrigin="anonymous"
        />
        {/* DNS prefetch for non-critical third parties */}
        <link rel="dns-prefetch" href="https://onesignal.com" />
        <link rel="dns-prefetch" href="https://static.cloudflareinsights.com" />
        <link rel="dns-prefetch" href="https://va.vercel-scripts.com" />
        <link rel="dns-prefetch" href="https://vitals.vercel-insights.com" />

        {/* ── JSON-LD: BreadcrumbList — helps Google understand site structure ── */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "BreadcrumbList",
              itemListElement: [
                {
                  "@type": "ListItem",
                  position: 1,
                  name: "Home",
                  item: SITE_URL,
                },
                {
                  "@type": "ListItem",
                  position: 2,
                  name: "Tasks",
                  item: `${SITE_URL}/dashboard/tasks`,
                },
                {
                  "@type": "ListItem",
                  position: 3,
                  name: "Earnings",
                  item: `${SITE_URL}/dashboard/earnings`,
                },
              ],
            }),
          }}
        />

        {/* ── JSON-LD: Organization ── */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: SITE_NAME,
              url: SITE_URL,
              logo: {
                "@type": "ImageObject",
                url: `${SITE_URL}/web-app-manifest-512x512.png`,
                width: 512,
                height: 512,
              },
              contactPoint: {
                "@type": "ContactPoint",
                email: "contact@qyantra.online",
                contactType: "customer support",
                availableLanguage: ["English", "Hindi"],
              },
              sameAs: ["https://qyantra.vercel.app"],
            }),
          }}
        />

        {/* ── JSON-LD: WebApplication ── */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              name: SITE_NAME,
              url: SITE_URL,
              description: SITE_DESCRIPTION,
              applicationCategory: "FinanceApplication",
              operatingSystem: "Web, Android, iOS",
              inLanguage: ["en-IN", "hi-IN"],
              isAccessibleForFree: true,
              offers: {
                "@type": "Offer",
                price: "0",
                priceCurrency: "INR",
                description: "Free to join. Earn by completing simple tasks daily.",
              },
              publisher: {
                "@type": "Organization",
                name: SITE_NAME,
                url: SITE_URL,
              },
              // ── PWA shortcuts in JSON-LD ──
              potentialAction: [
                {
                  "@type": "ViewAction",
                  name: "Browse Tasks",
                  target: `${SITE_URL}/dashboard/tasks`,
                },
                {
                  "@type": "ViewAction",
                  name: "Check Earnings",
                  target: `${SITE_URL}/dashboard/earnings`,
                },
              ],
            }),
          }}
        />

        {/* ── JSON-LD: WebSite with SearchAction ── */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              name: SITE_NAME,
              url: SITE_URL,
              description: "Earn real money daily by completing simple tasks. UPI payouts. Free to join.",
              inLanguage: "en-IN",
              potentialAction: {
                "@type": "SearchAction",
                target: {
                  "@type": "EntryPoint",
                  urlTemplate: `${SITE_URL}/tasks?q={search_term_string}`,
                },
                "query-input": "required name=search_term_string",
              },
            }),
          }}
        />

        {/* ── JSON-LD: FAQPage ── */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "FAQPage",
              mainEntity: [
                {
                  "@type": "Question",
                  name: "Is Qyantra really free? No hidden charges?",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: "100% free. We will never ask you to pay, invest, or buy anything. We earn from advertisers when users complete tasks and share that revenue with you.",
                  },
                },
                {
                  "@type": "Question",
                  name: "How much can I earn per day on Qyantra?",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: "Typical users earn ₹50–₹250 per day spending 20–40 minutes. Earnings depend on task availability and are not guaranteed.",
                  },
                },
                {
                  "@type": "Question",
                  name: "How do I get paid on Qyantra?",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: "Once your balance reaches the minimum withdrawal amount shown in your dashboard, you can request a withdrawal to your UPI ID (Paytm, GPay, PhonePe). Processed within 24 hours.",
                  },
                },
                {
                  "@type": "Question",
                  name: "What tasks can I complete on Qyantra?",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: "Install apps, write reviews, sign up on platforms, complete surveys, and try products. Tasks take 2–10 minutes and require no special skills.",
                  },
                },
                {
                  "@type": "Question",
                  name: "Which UPI apps are supported for payout?",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: "All major UPI apps are supported — Paytm, Google Pay, PhonePe, BHIM, and any standard UPI ID.",
                  },
                },
                {
                  "@type": "Question",
                  name: "Is my personal data safe on Qyantra?",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: "Yes. We use industry-standard encryption. Your password is hashed and never stored in plain text. We never sell your personal data.",
                  },
                },
              ],
            }),
          }}
        />
      </head>

      <body className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased text-gray-900 bg-white`}>
        {children}

        <Analytics />

        {/* ── OneSignal SDK — lazyOnload, never blocks render ── */}
        <Script
          src="https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.page.js"
          strategy="lazyOnload"
          defer
        />

        {/* ── OneSignal Init ── */}
        <Script
          id="onesignal-init"
          strategy="lazyOnload"
          dangerouslySetInnerHTML={{
            __html: `
              window.OneSignalDeferred = window.OneSignalDeferred || [];
              OneSignalDeferred.push(async function(OneSignal) {
                if (window.location.hostname !== 'www.qyantra.online') return;
                try {
                  await OneSignal.init({
                    appId: "${ONESIGNAL_APP_ID}",
                    safari_web_id: "web.onesignal.auto.49d2239d-a04e-422a-89e0-14dbda97fb4d",
                    notifyButton: { enable: false },
                    autoResubscribe: true,
                    allowLocalhostAsSecureOrigin: true,
                    serviceWorkerParam: { scope: "/" },
                    serviceWorkerPath: "OneSignalSDKWorker.js",
                    promptOptions: {
                      slidedown: { enabled: false }
                    },
                  });
                } catch (err) {
                  console.warn("OneSignal init failed:", err);
                }
              });
            `,
          }}
        />
      </body>
    </html>
  )
}