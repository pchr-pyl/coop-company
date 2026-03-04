import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Silence Leaflet SSR issues (it needs `window`); the component itself
  // already uses next/dynamic with ssr:false, but this ensures any remaining
  // server-side Leaflet imports don't crash the build.
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals = [
        ...(config.externals as string[]),
        'leaflet',
        'react-leaflet',
      ];
    }
    return config;
  },
};

export default nextConfig;
