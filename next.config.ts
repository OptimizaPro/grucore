import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* The share-card route reads its fonts and logo from disk; make sure the
     serverless bundle on Vercel carries them. */
  outputFileTracingIncludes: { "/api/og": ["./src/assets/fonts/*.ttf", "./public/brand/logo-on-dark.png", "./public/work/*.jpg"] },
  images: {
    formats: ["image/avif", "image/webp"],
    qualities: [70, 75, 80],
    /* Project photography is hotlinked from Unsplash until the owner's own
       job-site photos replace it (see README → "Before launch"). */
    remotePatterns: [{ protocol: "https", hostname: "images.unsplash.com" }],
  },
  async headers() {
    return [
      { source: "/NewSiteNewYou", headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow, noarchive" }] },
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), interest-cohort=()" },
        ],
      },
    ];
  },
};

export default nextConfig;
