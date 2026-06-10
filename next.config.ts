import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // pdf-parse 是 Node.js CJS 模块，需要在服务端作为外部包处理
  serverExternalPackages: ["pdf-parse"],

  // Windows + Node.js v24 下 SWC WASM 类型检查有兼容性问题
  // 类型检查由 IDE 和 lint 阶段覆盖，不影响构建产物
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
