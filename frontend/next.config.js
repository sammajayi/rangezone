/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  serverExternalPackages: ["pino", "thread-stream"],

  turbopack: {} // 👈 add this to silence the error
};

module.exports = nextConfig;