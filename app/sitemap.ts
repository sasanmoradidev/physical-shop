import { MetadataRoute } from 'next';
import { prisma } from "@/lib/prisma";

// export const dynamic = "force-dynamic";// برای کش نبودن صفحه اصلی
export const revalidate = 3600;// برای کش نبودن صفحه اصلی

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  // واکشی تمام محصولات فعال برای معرفی به گوگل
  const products = await prisma.product.findMany({
    where: { isActive: true },
    select: { slug: true, updatedAt: true },
  });

  const productUrls = products.map((product) => ({
    url: `${baseUrl}/products/${product.slug}`,
    lastModified: product.updatedAt,
    changeFrequency: 'daily' as const,
    priority: 0.8, // اولویت محصولات بالاست
  }));

  // مسیرهای اصلی و استاتیک سایت
  const staticRoutes = [
    "",
    "/products",
    "/contactus",
    "/about",
    "/about/privacy",
    "/complaints",
    "/returns",
    "/terms",
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: "daily" as const,
    priority: route === "" ? 1 : 0.8,
  }));

  return [...staticRoutes, ...productUrls];
}