import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";

export default function StoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Navbar />
      <main className="min-h-[calc(100vh-200px)]">
        {children}
      </main>
      <Footer />
    </>
  );
}