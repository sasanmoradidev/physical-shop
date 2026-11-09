import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 👇 قرار دادن فقط آی‌پی به تنهایی (بدون پورت)
  allowedDevOrigins: ["192.168.1.103", "10.85.15.87, 10.95.98.82"],
    images: {
        formats: ["image/avif", "image/webp"],
        deviceSizes: [375, 640, 750, 828, 1080, 1200, 1600, 1920],
        imageSizes: [64, 96, 128, 256, 384],
        minimumCacheTTL: 86400,
    },
};

export default nextConfig;