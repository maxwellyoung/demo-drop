/** @type {import('next').NextConfig} */

const withPWA = require("next-pwa")({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development",
});

const nextConfig = {
  // Clean config for Next.js 14 App Router
  // Server Actions are enabled by default
  // File uploads are handled natively by the App Router
  reactStrictMode: true,
};

module.exports = withPWA(nextConfig);
