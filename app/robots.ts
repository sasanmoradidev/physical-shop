import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      // جلوگیری از ایندکس شدن پنل ادمین و صفحات شخصی کاربران
      disallow: ['/admin/', '/profile/', '/api/', '/payment/'],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}