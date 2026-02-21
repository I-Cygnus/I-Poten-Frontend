/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',  // Static HTML export
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    unoptimized: true,  // Required for static export
  },
  
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
        ],
      },
    ];
  },
};

export default nextConfig;
