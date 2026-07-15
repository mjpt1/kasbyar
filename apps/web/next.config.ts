import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  transpilePackages: ['@kesbyar/shared', '@kesbyar/ui'],
  output: 'standalone',
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
};

export default nextConfig;
