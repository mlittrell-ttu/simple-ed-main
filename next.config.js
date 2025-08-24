/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/flash-card/:path*',
        destination: '/api/proxy/flash-card/:path*',
      },
      {
        source: '/random-selection/:path*',
        destination: '/api/proxy/random-selection/:path*',
      },
    ]
  },
}

module.exports = nextConfig