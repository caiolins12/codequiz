// Endereço oficial: é a única origem cadastrada no login do Google. Os outros
// *.vercel.app do projeto (aliases e URL de cada deploy) davam origin_mismatch.
const CANONICAL_HOST = 'brain-versus-brain.vercel.app';

/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      {
        source: '/:path*',
        has: [{ type: 'host', value: '.*\\.vercel\\.app' }],
        missing: [{ type: 'host', value: CANONICAL_HOST.replace(/\./g, '\\.') }],
        destination: `https://${CANONICAL_HOST}/:path*`,
        permanent: false
      }
    ];
  },
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
