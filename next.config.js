/**
 * Next.js configuration for AWS Amplify SSR deployment.
 * Enables standalone build output and sets the correct runtime.
 */
import { resolve } from 'path';

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Output as a standalone server bundle (required for Amplify SSR)
  output: 'standalone',
  // Enable React strict mode (optional but recommended)
  reactStrictMode: true,
  // Keep the default image domains empty; you can add your S3 domain if needed.
  images: {
    remotePatterns: [],
  },
  // Optional: customize the build directory for Amplify.
  distDir: '.next',
  // Ensure TypeScript paths resolve correctly.
  webpack(config) {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': resolve('./src'),
    };
    return config;
  },
};

export default nextConfig;
