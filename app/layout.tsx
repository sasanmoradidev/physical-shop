import type { Viewport } from "next";
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