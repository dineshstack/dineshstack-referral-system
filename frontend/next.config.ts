import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Enable React 19 strict mode
  reactStrictMode: true,

  // Allow images from external domains (affiliate logos etc.)
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },

  // Proxy /api requests to the Laravel backend in development
  async rewrites() {
    return process.env.NODE_ENV === 'development'
      ? [
          {
            source: '/api/:path*',
            destination: `${process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000'}/api/:path*`,
          },
        ]
      : []
  },
}

export default nextConfig
