/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
      { protocol: 'https', hostname: 'firebasestorage.googleapis.com' },
    ],
  },
  env: {
    NEXT_PUBLIC_APP_VERSION: '1.0.0',
    NEXT_PUBLIC_APP_NAME: 'AutoKore',
  },
  experimental: { serverComponentsExternalPackages: ['firebase-admin'] },
  compress: true,
  poweredByHeader: false,
  reactStrictMode: true,

  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://connect.facebook.net https://www.google-analytics.com https://apis.google.com https://www.google.com https://www.gstatic.com https://www.recaptcha.net",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com",
              "img-src 'self' data: blob: https://www.facebook.com https://lh3.googleusercontent.com https://firebasestorage.googleapis.com",
              "connect-src 'self' https://*.googleapis.com https://*.google-analytics.com https://*.analytics.google.com https://www.googletagmanager.com https://firestore.googleapis.com https://identitytoolkit.googleapis.com https://securetoken.googleapis.com https://connect.facebook.net https://www.google.com https://www.gstatic.com https://fonts.gstatic.com https://www.facebook.com",
              "frame-src 'self' https://mecanicapro-b1eeb.firebaseapp.com https://www.google.com https://recaptcha.google.com",
            ].join('; '),
          },
        ],
      },
    ]
  },
}
module.exports = nextConfig