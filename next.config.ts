import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // pdf-parse 是 Node.js CJS 模块，需要在服务端作为外部包处理
  serverExternalPackages: ["pdf-parse"],
};

export default nextConfig;
