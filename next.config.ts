import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
    ],
  },
  httpAgentOptions: {
    keepAlive: true,
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '4.5mb',
    },
    serverMinification: false,
  },
};

export default nextConfig;
