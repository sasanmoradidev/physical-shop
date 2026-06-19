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
        {children}
      </body>
    </html>
  );
}