/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  async rewrites() {
    return [
      { source: "/robots.txt", destination: "/api/robots.txt" }
    ];
  },
};
module.exports = nextConfig;
