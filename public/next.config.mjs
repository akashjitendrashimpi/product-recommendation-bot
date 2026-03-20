/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },

  images: {
    unoptimized: true,
  },

  compress: true,

  async headers() {
    return [

      // ── Global security headers ──────────────────────────────────────────
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: [
              "camera=()",
              "microphone=()",
              "geolocation=()",
              "payment=()",
              "usb=()",
              "bluetooth=()",
              "accelerometer=()",
              "gyroscope=()",
              "magnetometer=()",
              "ambient-light-sensor=()",
              "autoplay=()",
              "encrypted-media=()",
              "picture-in-picture=()",
              "screen-wake-lock=()",
              "web-share=(self)",
            ].join(", "),
          },
          {
  key: "Content-Security-Policy",
  value: [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.onesignal.com https://onesignal.com https://va.vercel-scripts.com https://static.cloudflareinsights.com https://api.onesignal.com",
    "connect-src 'self' https://api.onesignal.com https://onesignal.com https://*.supabase.co wss://*.supabase.co https://static.cloudflareinsights.com https://cloudflareinsights.com",
    "img-src 'self' data: blob: https://*.supabase.co https://www.qyantra.online",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "frame-src 'self' https://onesignal.com",
    "worker-src 'self' blob:",
  ].join("; "),
},
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          {
            key: "Cross-Origin-Opener-Policy",
            value: "same-origin",
          },
          {
            key: "Cross-Origin-Resource-Policy",
            value: "same-site",
          },
          {
            key: "X-DNS-Prefetch-Control",
            value: "on",
          },
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",

              // Scripts: Next.js inline + OneSignal + Vercel Analytics
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.onesignal.com https://onesignal.com https://va.vercel-scripts.com",

              // Styles: inline (Tailwind) + Google Fonts
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",

              // Fonts
              "font-src 'self' data: https://fonts.gstatic.com",

              // Images: any HTTPS + data + blob
              "img-src 'self' data: blob: https:",

              // Connections: Supabase + OneSignal + Vercel + Anthropic API
              "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://onesignal.com https://api.onesignal.com https://cdn.onesignal.com https://vitals.vercel-insights.com https://va.vercel-scripts.com https://api.anthropic.com",

              // Frames: block all
              "frame-src 'none'",
              "frame-ancestors 'none'",

              // Workers: self + blob + OneSignal CDN
              "worker-src 'self' blob: https://cdn.onesignal.com",

              // Manifests + Media + Forms
              "manifest-src 'self'",
              "media-src 'self'",
              "form-action 'self'",
              "base-uri 'self'",

              "upgrade-insecure-requests",
            ].join("; "),
          },
        ],
      },

      // ── Static assets — aggressive caching ──────────────────────────────
      {
        source: "/(.*)\\.(ico|png|svg|jpg|jpeg|webp|gif|avif)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
          {
            key: "Cross-Origin-Resource-Policy",
            value: "same-site",
          },
        ],
      },

      // ── Fonts ────────────────────────────────────────────────────────────
      {
        source: "/(.*)\\.(woff|woff2|ttf|otf|eot)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
          {
            key: "Access-Control-Allow-Origin",
            value: "*",
          },
        ],
      },

      // ── Next.js static chunks ────────────────────────────────────────────
      {
        source: "/_next/static/(.*)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },

      // ── API routes — never cache ─────────────────────────────────────────
      {
        source: "/api/(.*)",
        headers: [
          {
            key: "Cache-Control",
            value: "no-store, no-cache, must-revalidate, proxy-revalidate",
          },
          {
            key: "Pragma",
            value: "no-cache",
          },
          {
            key: "Expires",
            value: "0",
          },
          {
            key: "Access-Control-Allow-Origin",
            value: "https://www.qyantra.online",
          },
          {
            key: "Access-Control-Allow-Methods",
            value: "GET, POST, PATCH, DELETE, OPTIONS",
          },
          {
            key: "Access-Control-Allow-Headers",
            value: "Content-Type, Authorization",
          },
          {
            key: "Access-Control-Max-Age",
            value: "86400",
          },
        ],
      },

      // ── Auth routes ──────────────────────────────────────────────────────
      {
        source: "/auth/(.*)",
        headers: [
          {
            key: "Cache-Control",
            value: "no-store, no-cache, must-revalidate",
          },
          {
            key: "Pragma",
            value: "no-cache",
          },
          {
            key: "X-Robots-Tag",
            value: "noindex, nofollow",
          },
        ],
      },

      // ── Dashboard ────────────────────────────────────────────────────────
      {
        source: "/dashboard(.*)",
        headers: [
          {
            key: "Cache-Control",
            value: "no-store, no-cache, must-revalidate",
          },
          {
            key: "X-Robots-Tag",
            value: "noindex, nofollow",
          },
        ],
      },

      // ── Admin ────────────────────────────────────────────────────────────
      {
        source: "/admin(.*)",
        headers: [
          {
            key: "Cache-Control",
            value: "no-store, no-cache, must-revalidate",
          },
          {
            key: "X-Robots-Tag",
            value: "noindex, nofollow",
          },
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
        ],
      },

      // ── Main service worker ──────────────────────────────────────────────
      {
        source: "/sw.js",
        headers: [
          {
            key: "Cache-Control",
            value: "no-store, no-cache, must-revalidate",
          },
          {
            key: "Service-Worker-Allowed",
            value: "/",
          },
          {
            key: "Content-Type",
            value: "application/javascript; charset=utf-8",
          },
        ],
      },

      // ── OneSignal service worker ─────────────────────────────────────────
      // FIX: OneSignal SW must be served from root with correct headers
      {
        source: "/OneSignalSDKWorker.js",
        headers: [
          {
            key: "Cache-Control",
            value: "no-store, no-cache, must-revalidate",
          },
          {
            key: "Service-Worker-Allowed",
            value: "/",
          },
          {
            key: "Content-Type",
            value: "application/javascript; charset=utf-8",
          },
        ],
      },
     
      // ── Sitemap ──────────────────────────────────────────────────────────
      {
        source: "/sitemap.xml",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=86400, stale-while-revalidate=3600",
          },
          {
            key: "Content-Type",
            value: "application/xml; charset=utf-8",
          },
          {
            key: "X-Robots-Tag",
            value: "noindex",
          },
        ],
      },

      // ── robots.txt ───────────────────────────────────────────────────────
      {
        source: "/robots.txt",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=86400",
          },
          {
            key: "Content-Type",
            value: "text/plain; charset=utf-8",
          },
        ],
      },

      // ── Web manifest ─────────────────────────────────────────────────────
      {
        source: "/site.webmanifest",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=86400",
          },
          {
            key: "Content-Type",
            value: "application/manifest+json",
          },
        ],
      },
    ]
  },

  async redirects() {
    return [
      // Force www
      {
        source: "/(.*)",
        has: [{ type: "host", value: "qyantra.online" }],
        destination: "https://www.qyantra.online/:path*",
        permanent: true,
      },
      // Remove trailing slashes
      {
        source: "/:path+/",
        destination: "/:path+",
        permanent: true,
      },
    ]
  },
}

export default nextConfig
