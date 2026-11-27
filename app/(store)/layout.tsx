import { Navbar } from "@/theme/layout/Navbar";
import { Footer } from "@/theme/layout/Footer";
import { getSiteConfig } from "@/lib/site-config";

export default async function StoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const siteConfig = await getSiteConfig();

  return (
    <>
      <Navbar config={siteConfig} />
      <main className="min-h-[calc(100vh-200px)]">{children}</main>
      <Footer config={siteConfig} />
    </>
  );
}