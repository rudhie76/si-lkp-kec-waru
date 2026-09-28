/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'export',
  basePath: '/si-lkp-kec-waru',
  assetPrefix: '/si-lkp-kec-waru',
  images: {
    unoptimized: true,
  }
}

module.exports = nextConfig
