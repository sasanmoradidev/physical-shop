import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import "@fontsource/vazirmatn";
import "./globals.css";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fa" dir="rtl" className="font-vazirmatn">
      <body>
        <Navbar />
        {children}
        <Footer />
      </body>
    </html>
  );
}