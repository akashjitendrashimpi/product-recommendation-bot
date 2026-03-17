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
    default: "Qyantra — Earn Real Money Daily",
    template: "%s | Qyantra",
  },
  description: "Complete simple tasks and earn real cash to your UPI. Try apps, write reviews, complete surveys. Minimum payout just ₹50. 100% free to join.",
  keywords: [
    "earn money online india",
    "earn daily tasks",
    "UPI payout app",
    "earn paytm cash",
    "task earning app india",
    "earn money mobile",
    "Qyantra",
    "free earning app india",
  ],
  authors: [{ name: "Qyantra", url: "https://qyantra.vercel.app" }],
  creator: "Qyantra",
  publisher: "Qyantra",
  metadataBase: new URL("https://qyantra.vercel.app"),
  alternates: {
    canonical: "https://qyantra.vercel.app",
  },
  openGraph: {
    title: "Qyantra — Earn Real Money Daily",
    description: "Complete simple tasks and earn real cash to your UPI. Minimum payout ₹50. Free to join.",
    url: "https://qyantra.vercel.app",
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
    title: "Qyantra — Earn Real Money Daily",
    description: "Complete simple tasks and earn real cash to your UPI. Free to join.",
    images: ["/web-app-manifest-512x512.png"],
    creator: "@qyantra",
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
  formatDetection: {
    telephone: false,
    date: false,
    email: false,
    address: false,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    // Add Google Search Console verification when you get custom domain
    // google: "your-verification-code",
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
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="application-name" content="Qyantra" />
        {/* Security headers via meta tags */}
        <meta httpEquiv="X-Content-Type-Options" content="nosniff" />
        <meta name="referrer" content="strict-origin-when-cross-origin" />
        {/* Preconnect for performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="dns-prefetch" href="https://fonts.googleapis.com" />
      </head>
      <body className="font-sans antialiased">
        {children}
        <Analytics />
      </body>
    </html>
  )
}