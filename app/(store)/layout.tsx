import { Navbar } from "@/theme/layout/Navbar";
import { Footer } from "@/theme/layout/Footer";

export default function StoreLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <main className="min-h-[calc(100vh-200px)]">{children}</main>
      <Footer />
    </>
  );
}