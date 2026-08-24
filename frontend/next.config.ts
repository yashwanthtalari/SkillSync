import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Only use standalone output for Docker containerization; Vercel requires standard output for serverless functions
  ...(process.env.BUILD_STANDALONE === "true" ? { output: "standalone" } : {}),
  reactStrictMode: true,
};

export default nextConfig;
