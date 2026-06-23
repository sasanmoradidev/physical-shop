import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 👇 قرار دادن فقط آی‌پی به تنهایی (بدون پورت)
  allowedDevOrigins: ["192.168.1.102", "10.85.15.87"],
};

export default nextConfig;