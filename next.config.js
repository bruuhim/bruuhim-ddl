// next.config.js (NOT next.config.ts)
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ['drive.google.com'], // Add any external image domains you use
  },
  // This will change the app name in development
  env: {
    APP_NAME: 'Bruuhim DDL',
  },
}

module.exports = nextConfig
