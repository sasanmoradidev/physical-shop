import ThemeHomePage from "@/theme/home/HomePage";

// export const dynamic = "force-dynamic";// برای کش نبودن صفحه اصلی
export const revalidate = 60;// برای کش نبودن صفحه اصلی

export default function HomePage() {
  return <ThemeHomePage />;
}