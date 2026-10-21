/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // ensure native node modules like node:sqlite / node:crypto can be used in app route handlers
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }
    return config;
  },
};

export default nextConfig;
