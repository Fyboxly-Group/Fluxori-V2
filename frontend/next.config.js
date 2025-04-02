/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  experimental: {
    optimizeCss: true,
    scrollRestoration: true,
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  // Optimize image loading
  images: {
    domains: ['placehold.co'],
    formats: ['image/avif', 'image/webp'],
  },
  // Configure webpack for bundle analysis and optimization
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // Bundle analyzer - only in analyze mode
    if (process.env.ANALYZE === 'true') {
      const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
      config.plugins.push(
        new BundleAnalyzerPlugin({
          analyzerMode: 'server',
          analyzerPort: isServer ? 8888 : 8889,
          openAnalyzer: true,
        })
      );
    }

    // Optimize GSAP - exclude premium plugins from client bundles
    if (!isServer) {
      config.externals = [...(config.externals || []), 
        { 
          gsap: 'gsap',
        }
      ];
    }

    // Optimize CSS - purge unused styles in production
    if (!dev && !isServer) {
      config.optimization.splitChunks.cacheGroups = {
        ...config.optimization.splitChunks.cacheGroups,
        // Create a separate chunk for GSAP animations
        gsap: {
          test: /[\\/]node_modules[\\/](gsap)[\\/]/,
          name: 'gsap',
          priority: 10,
          enforce: true,
        },
        // Create a separate chunk for Mantine components
        mantine: {
          test: /[\\/]node_modules[\\/](@mantine)[\\/]/,
          name: 'mantine',
          priority: 10,
          enforce: true,
        },
        // Create a separate chunk for React Query
        reactQuery: {
          test: /[\\/]node_modules[\\/](@tanstack\/react-query)[\\/]/,
          name: 'react-query',
          priority: 10,
          enforce: true,
        },
      };
    }

    return config;
  },
};

module.exports = nextConfig;