import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ['react-big-calendar'],
  reactStrictMode: true,
  compiler: {
    removeConsole: false,
  },
};

export default nextConfig;
