/** @type {import('next').NextConfig} */
import { withPlausibleProxy } from 'next-plausible'

const nextConfig = {
  reactStrictMode: true,
  webpack: (config) => {
    config.resolve.fallback = { fs: false, net: false, tls: false }
    config.externals.push('pino-pretty', 'lokijs', 'encoding')
    return config
  },
}

export default withPlausibleProxy()(nextConfig)
