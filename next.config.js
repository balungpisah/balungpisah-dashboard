/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'core.balungpisah.id',
        pathname: '**',
      },
    ],
  },
};

module.exports = nextConfig;
