import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  transpilePackages: ['@kesbyar/shared', '@kesbyar/ui'],
  output: 'standalone',
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
  headers: async () => [
    {
      source: '/sw.js',
      headers: [
        { key: 'Cache-Control', value: 'public, max-age=0, must-revalidate' },
        { key: 'Service-Worker-Allowed', value: '/' },
      ],
    },
    {
      source: '/manifest.webmanifest',
      headers: [{ key: 'Cache-Control', value: 'public, max-age=3600' }],
    },
  ],
};

export default nextConfig;
