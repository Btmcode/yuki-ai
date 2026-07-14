import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Standalone output — space-z.ai deployment platformu bunu bekliyor
  // .next/standalone/server.js production server olarak çalışır
  output: "standalone",

  // TypeScript hatalarını build sırasında yoksay (skills/ klasörü harici tutuluyor)
  typescript: {
    ignoreBuildErrors: true,
  },

  reactStrictMode: false,

  // Cross-origin requests — space-z.ai preview için gerekli
  allowedDevOrigins: [
    'https://*.space-z.ai',
    'https://preview-chat-*.space-z.ai',
    'https://yukiai.space-z.ai',
  ],
};

export default nextConfig;
