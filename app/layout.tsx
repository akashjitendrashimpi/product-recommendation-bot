import { Analytics } from "@vercel/analytics/next"
import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import "./globals.css"

const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: {
    default: "Qyantra — Earn Daily, Shop Smarter",
    template: "%s | Qyantra",
  },
  description: "Get AI-powered product recommendations from Amazon & Flipkart, plus earn real cash by completing simple tasks. Minimum payout just ₹50.",
  keywords: ["earn money online", "earn daily", "tasks app", "UPI payout", "AI shopping", "Qyantra"],
  authors: [{ name: "Qyantra" }],
  creator: "Qyantra",
  metadataBase: new URL("https://qyantra.vercel.app"),
  openGraph: {
    title: "Qyantra — Earn Daily, Shop Smarter",
    description: "Earn real cash by completing simple tasks. Minimum payout just ₹50. Free to join.",
    url: "https://qyantra.vercel.app",
    siteName: "Qyantra",
    locale: "en_IN",
    type: "website",
    images: [
      {
        url: "/icon-512x512.png",
        width: 512,
        height: 512,
        alt: "Qyantra Logo",
      },
    ],
  },
  twitter: {
    card: "summary",
    title: "Qyantra — Earn Daily, Shop Smarter",
    description: "Earn real cash by completing simple tasks. Free to join.",
    images: ["/icon-512x512.png"],
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
    other: [
      { rel: "mask-icon", url: "/favicon-32x32.png" },
    ],
  },
  manifest: "/site.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Qyantra",
  },
  formatDetection: {
    telephone: false,
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        {/* Theme color for browser chrome — matches Qyantra blue */}
        <meta name="theme-color" content="#2563eb" />
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body className="font-sans antialiased">
        {children}
        <Analytics />
      </body>
    </html>
  )
}