import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['@prisma/client', 'prisma'],
  },
  // Empty turbopack config to silence Next.js 16 warning
  turbopack: {},
};

export default nextConfig;
