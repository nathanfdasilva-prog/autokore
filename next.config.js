/** @type {import('next').NextConfig} */
const nextConfig = {
  // Para Firebase Hosting: output: 'export', distDir: 'out'
  // Para Vercel: remova output e distDir
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
      { protocol: 'https', hostname: 'firebasestorage.googleapis.com' },
    ],
  },
  async headers() {
    return [{
      source: '/(.*)',
      headers: [
        { key: 'X-Frame-Options',        value: 'DENY' },
        { key: 'X-Content-Type-Options', value: 'nosniff' },
        { key: 'Referrer-Policy',        value: 'strict-origin-when-cross-origin' },
        { key: 'Permissions-Policy',     value: 'camera=(), microphone=(), geolocation=()' },
      ],
    }]
  },
  env: {
    NEXT_PUBLIC_APP_VERSION: '1.0.0',
    NEXT_PUBLIC_APP_NAME:    'AutoKore',
  },
  experimental: { serverComponentsExternalPackages: ['firebase-admin'] },
  compress:        true,
  poweredByHeader: false,
  reactStrictMode: true,
}
module.exports = nextConfig
