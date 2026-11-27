import type { Metadata, Viewport } from "next";
import "@fontsource/vazirmatn";
import "./globals.css";
import { getSiteConfig } from "@/lib/site-config";
import { Toaster } from "sonner";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export async function generateMetadata(): Promise<Metadata> {
  const siteConfig = await getSiteConfig();

  return {
    metadataBase: new URL(
      process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
    ),
    title: siteConfig.title,
    description: siteConfig.description,
    keywords: siteConfig.keywords,
    openGraph: {
      title: siteConfig.title,
      description: siteConfig.description,
      url: "/",
      siteName: siteConfig.name,
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
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fa" dir="rtl" className="font-vazirmatn">
      <body>
        {children}
        <Toaster dir="rtl" position="top-center" richColors closeButton />
      </body>
    </html>
  );
}