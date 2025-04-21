/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // For better performance with three.js
  transpilePackages: ['three'],
  webpack: (config) => {
    // Add fallbacks for browser polyfills
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      path: false,
      os: false,
      buffer: require.resolve('buffer/'),
    };

    return config;
  },
  output: 'export',
  images: {
    unoptimized: true,
  },
  // Use trailing slash for better compatibility with static hosting
  trailingSlash: true,
  // Remove assetPrefix as it causes issues with next/font
};

module.exports = nextConfig; 