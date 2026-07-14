import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Standalone output kaldırıldı — space-z.ai serverless deployment ile uyumsuz

  // TypeScript hatalarını build sırasında yoksay (skills/ klasörü harici tutuluyor)
  typescript: {
    ignoreBuildErrors: true,
  },

  // Not: Next.js 16'da eslint config artık next.config.ts'de değil
  // Eski eslint.ignoreDuringBuilds kaldırıldı — build lint için ayrı komut kullan

  reactStrictMode: false,

  // Cross-origin requests — space-z.ai preview için gerekli
  allowedDevOrigins: [
    'https://*.space-z.ai',
    'https://preview-chat-*.space-z.ai',
    'https://yukiai.space-z.ai',
  ],
};

export default nextConfig;
