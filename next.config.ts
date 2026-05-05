import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    const baseHeaders = [
      {
        source: '/sw.js',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=0, must-revalidate',
          },
          {
            key: 'Service-Worker-Allowed',
            value: '/',
          },
        ],
      },
    ];

    if (process.env.NODE_ENV === 'production') {
      baseHeaders.push(
        {
          source: '/_next/static/:path*',
          headers: [
            {
              key: 'Cache-Control',
              value: 'public, max-age=0, must-revalidate',
            },
          ],
        },
        {
          source: '/(.*)',
          headers: [
            {
              key: 'Cache-Control',
              value: 'public, max-age=3600',
            },
          ],
        }
      );
    }

    return baseHeaders;
  },
};

export default nextConfig;
