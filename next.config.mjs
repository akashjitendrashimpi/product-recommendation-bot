/** @type {import('next').NextConfig} */
const nextConfig = {

  // ── TypeScript ─────────────────────────────────────────────────────────────
  typescript: {
    ignoreBuildErrors: true,
  },

  // ── Images ────────────────────────────────────────────────────────────────
  images: {
    unoptimized: true,
  },

  // ── Compression ───────────────────────────────────────────────────────────
  compress: true,

  // ── Experimental ──────────────────────────────────────────────────────────
  experimental: {
  optimizePackageImports: [
    "lucide-react",
    "@radix-ui/react-icons",
    "recharts",
    "date-fns",
  ],
  optimizeCss: true,
},

  // ── Headers ───────────────────────────────────────────────────────────────
  async headers() {
    return [

      // ── Homepage — short cache for fast repeat visits ──────────────────
      {
        source: "/",
        headers: [
          {
            key: "Cache-Control",
            value: "public, s-maxage=3600, stale-while-revalidate=86400",
          },
        ],
      },

      // ── Global security headers ────────────────────────────────────────
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
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.onesignal.com https://onesignal.com https://api.onesignal.com https://va.vercel-scripts.com https://static.cloudflareinsights.com https://challenges.cloudflare.com",
             "style-src 'self' 'unsafe-inline' https://onesignal.com https://cdn.onesignal.com",
              "font-src 'self' data:",
              "img-src 'self' data: blob: https:",
              "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://onesignal.com https://api.onesignal.com https://cdn.onesignal.com https://vitals.vercel-insights.com https://va.vercel-scripts.com https://static.cloudflareinsights.com https://cloudflareinsights.com https://api.anthropic.com https://challenges.cloudflare.com",
              "frame-src 'none'",
              "frame-ancestors 'none'",
              "worker-src 'self' blob: https://cdn.onesignal.com",
              "manifest-src 'self'",
              "media-src 'self' blob:",
              "form-action 'self'",
              "base-uri 'self'",
              "upgrade-insecure-requests",
            ].join("; "),
          },
        ],
      },

      // ── Static assets — aggressive caching ────────────────────────────
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

      // ── Fonts — aggressive caching ─────────────────────────────────────
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

     

      // ── API routes — never cache, strict CORS ─────────────────────────
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
            value: "Content-Type, Authorization, X-Requested-With",
          },
          {
            key: "Access-Control-Max-Age",
            value: "86400",
          },
        ],
      },

      // ── Auth routes — never cache, no indexing ─────────────────────────
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

      // ── Dashboard — never cache, no indexing ──────────────────────────
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

      // ── Admin — never cache, no indexing, extra strict ────────────────
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

      // ── Service workers — no cache, correct scope ──────────────────────
      {
        source: "/(sw\\.js|OneSignalSDKWorker\\.js|OneSignalSDK\\.sw\\.js)",
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
          {
            key: "Access-Control-Allow-Origin",
            value: "*",
          },
        ],
      },

      // ── Sitemap ────────────────────────────────────────────────────────
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

      // ── robots.txt ─────────────────────────────────────────────────────
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

      // ── Web manifest ───────────────────────────────────────────────────
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

  // ── Redirects ─────────────────────────────────────────────────────────────
  async redirects() {
    return [
      // Force www — except service worker files
      {
        source: "/((?!sw\\.js|OneSignalSDKWorker\\.js|OneSignalSDK\\.sw\\.js).*)",
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