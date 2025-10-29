import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['@prisma/client', 'prisma'],
  },
  // Empty turbopack config to silence Next.js 16 warning
  turbopack: {},
};

export default nextConfig;
// Auto-deploy test Wed Oct 29 15:37:08 EDT 2025
