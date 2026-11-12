import type { Metadata, Viewport } from "next";
import "@fontsource/vazirmatn";
import "./globals.css";

// ۱. ایمپورت کامپوننت Toaster از کتابخانه سونر
import { Toaster } from "sonner";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false, // جلوگیری از زوم شدن سایت در موبایل [3]
};

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"),
  title: {
    template: "%s | فروشگاه فیزیکی",
    default: "فروشگاه فیزیکی | خرید مطمئن و سریع انواع کالا",
  },
  description: "بهترین مقصد برای خرید مطمئن و سریع انواع محصولات با اصالت. ما همواره تلاش می‌کنیم تا بهترین کالاها را با روش‌های ارسال سریع به دست شما برسانیم.",
  keywords: ["فروشگاه آنلاین", "خرید اینترنتی", "کالای دیجیتال", "تخفیف ویژه", "خرید اقساطی"],
  openGraph: {
    title: "فروشگاه فیزیکی",
    description: "تجربه یک خرید امن، سریع و لذت‌بخش.",
    url: "/",
    siteName: "فروشگاه فیزیکی",
    locale: "fa_IR",
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fa" dir="rtl" className="font-vazirmatn">
      <body>
        {children}
        
        {/* 👇 ۲. قرار دادن کانتینر توست با پشتیبانی بومی از راست‌چین و رنگ‌های غنی */}
        <Toaster dir="rtl" position="top-center" richColors closeButton />
      </body>
    </html>
  );
}