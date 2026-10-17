/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    const noCacheHeader = { key: 'Cache-Control', value: 'no-cache, no-store, must-revalidate' };
    const coopHeader = { key: 'Cross-Origin-Opener-Policy', value: 'same-origin-allow-popups' };
    const coepHeader = { key: 'Cross-Origin-Embedder-Policy', value: 'unsafe-none' };

    return [
      {
        source: '/:path*',
        headers: [noCacheHeader, coopHeader, coepHeader]
      },
      {
        source: '/manifest.webmanifest',
        headers: [
          noCacheHeader,
          { key: 'Content-Type', value: 'application/manifest+json; charset=utf-8' }
        ]
      },
      {
        source: '/build-meta.js',
        headers: [noCacheHeader]
      },
      {
        source: '/sw.js',
        headers: [noCacheHeader]
      },
      {
        source: '/version.json',
        headers: [noCacheHeader]
      }
    ];
  }
};

export default nextConfig;
