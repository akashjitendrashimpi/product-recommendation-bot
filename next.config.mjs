/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },

  images: {
    unoptimized: true,
  },

  // ── Compression ────────────────────────────────────────────────────────────
  compress: true,

  // ── Headers ────────────────────────────────────────────────────────────────
  async headers() {
    return [

      // ── Global security headers ──────────────────────────────────────────
      {
        source: "/(.*)",
        headers: [

          // Prevent clickjacking
          {
            key: "X-Frame-Options",
            value: "DENY",
          },

          // Prevent MIME sniffing
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },

          // XSS protection (legacy browsers)
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },

          // Referrer policy
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },

          // Disable unused browser features
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

          // Force HTTPS for 2 years + subdomains
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },

          // Cross-origin protections
          {
            key: "Cross-Origin-Opener-Policy",
            value: "same-origin",
          },
          {
            key: "Cross-Origin-Resource-Policy",
            value: "same-site",
          },

          // DNS prefetch control
          {
            key: "X-DNS-Prefetch-Control",
            value: "on",
          },

          // Content Security Policy
          {
            key: "Content-Security-Policy",
            value: [
              // Default: only self
              "default-src 'self'",

              // Scripts: self + Next.js inline + OneSignal + Vercel Analytics + Cloudflare
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.onesignal.com https://onesignal.com https://api.onesignal.com https://va.vercel-scripts.com https://static.cloudflareinsights.com",

              // Styles: self + inline (Tailwind) + Google Fonts
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",

              // Fonts: self + data + Google Fonts
              "font-src 'self' data: https://fonts.gstatic.com",

              // Images: self + data URIs + blob + any HTTPS
              "img-src 'self' data: blob: https:",

              // Connections: self + Supabase + OneSignal + Vercel + Cloudflare + Anthropic
              "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://onesignal.com https://api.onesignal.com https://cdn.onesignal.com https://vitals.vercel-insights.com https://va.vercel-scripts.com https://static.cloudflareinsights.com https://cloudflareinsights.com https://api.anthropic.com",

              // Frames: block all
              "frame-src 'none'",

              // Frame ancestors: block embedding
              "frame-ancestors 'none'",

              // Workers: self + blob + OneSignal CDN
              "worker-src 'self' blob: https://cdn.onesignal.com",

              // Manifests
              "manifest-src 'self'",

              // Media: self + blob (for audio/video)
              "media-src 'self' blob:",

              // Forms: only submit to self
              "form-action 'self'",

              // Base URI: only self
              "base-uri 'self'",

              // Block mixed content
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

      // ── Fonts — aggressive caching ───────────────────────────────────────
      {
        source: "/(.*)\\.(woff|woff2|ttf|otf|eot)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
          {
            // Allow fonts from both www and non-www
            key: "Access-Control-Allow-Origin",
            value: "*",
          },
        ],
      },

      // ── JS & CSS — long cache ────────────────────────────────────────────
      {
        source: "/_next/static/(.*)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },

      // ── API routes — never cache, strict CORS ────────────────────────────
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

      // ── Auth routes — never cache, no indexing ───────────────────────────
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

      // ── Dashboard — never cache, no indexing ─────────────────────────────
      // FIX: /dashboard(.*) without slash covers root /dashboard page too
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

      // ── Admin — never cache, no indexing, extra strict ───────────────────
      // FIX: /admin(.*) without slash covers root /admin page too
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

      // ── Service workers — no cache, correct scope ────────────────────────
      // FIX: must NOT be redirected — serve directly without www redirect
      // Chrome throws SecurityError if service worker is behind a redirect
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
            // Allow SW to be loaded from both www and non-www
            key: "Access-Control-Allow-Origin",
            value: "*",
          },
        ],
      },

      // ── Sitemap — short cache ────────────────────────────────────────────
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

  // ── Redirects ──────────────────────────────────────────────────────────────
  async redirects() {
    return [

      // ── Force www — EXCEPT service worker files ──────────────────────────
      // FIX: Service workers behind a redirect cause SecurityError in Chrome
      // The negative lookahead excludes SW files from the www redirect
      {
        source: "/((?!sw\\.js|OneSignalSDKWorker\\.js|OneSignalSDK\\.sw\\.js).*)",
        has: [{ type: "host", value: "qyantra.online" }],
        destination: "https://www.qyantra.online/:path*",
        permanent: true,
      },

      // ── Remove trailing slashes ──────────────────────────────────────────
      {
        source: "/:path+/",
        destination: "/:path+",
        permanent: true,
      },
    ]
  },
}

export default nextConfig