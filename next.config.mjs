// Origin the browser calls for API requests. NEXT_PUBLIC_API_BASE_URL may
// be a relative path ("/api"), in which case requests are same-origin and
// no extra CSP source is needed.
const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || ""
let apiOrigin = ""
try {
  apiOrigin = new URL(apiBase).origin
} catch {
  apiOrigin = ""
}
const apiSources = apiOrigin ? ` ${apiOrigin}` : ""

const contentSecurityPolicy = [
  "default-src 'self'",
  // This static-header policy has no per-request nonce. Inline scripts
  // remain allowed for hydration; nonce-based middleware can tighten this.
  // Network and form restrictions provide only partial exfiltration defense.
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  // Avatars and listing art arrive as absolute URLs on the API origin.
  `img-src 'self' data: blob:${apiSources}`,
  "font-src 'self' data:",
  `connect-src 'self'${apiSources}`,
  // Stream grants return presigned URLs on a host the backend controls,
  // which is not enumerable at build time, so media stays open to https.
  `media-src 'self' blob: https:${apiSources}`,
  // Google Docs embeds on the consent, privacy, and terms pages.
  "frame-src https://docs.google.com",
  "worker-src 'self' blob:",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
].join("; ")

/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  async headers() {
    return [
      {
        source: "/:path*",
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
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
          {
            key: "Content-Security-Policy",
            value: contentSecurityPolicy,
          },
        ],
      },
    ]
  },
}

export default nextConfig
