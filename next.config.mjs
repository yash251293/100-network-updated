/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  allowedDevOrigins: [
    'https://e687-122-176-16-80.ngrok-free.app',
    'http://e687-122-176-16-80.ngrok-free.app',
    'http://100n.hopto.org',
    'https://100n.hopto.org'
  ],
}

export default nextConfig
