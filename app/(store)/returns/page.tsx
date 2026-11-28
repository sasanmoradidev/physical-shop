import type { Metadata } from "next";
import { RefreshCw } from "lucide-react";
import { getSiteConfig } from "@/lib/site-config";
import { InfoPageShell } from "@/components/store/info-page-shell";

export async function generateMetadata(): Promise<Metadata> {
  const config = await getSiteConfig();
  return {
    title: `شرایط تعویض و مرجوع | ${config.name}`,
    description: `قوانین ضمانت تعویض سایز و بازگشت کالای پوشاک در ${config.name}`,
  };
}

export default async function ReturnsPage() {
  const config = await getSiteConfig();

  return (
    <InfoPageShell
      title="شرایط تعویض و مرجوع"
      subtitle="خرید آنلاین پوشاک بدون نگرانی از سایز و تن‌خور"
      icon={<RefreshCw className="h-6 w-6" />}
      breadcrumbs={[{ label: "شرایط تعویض و مرجوع" }]}
      config={config}
      activePath="/returns"
    >
      <p>
        در {config.name} می‌دانیم که انتخاب سایز در خرید آنلاین پوشاک ممکن است
        گاهی نیازمند تغییر باشد؛ به همین دلیل تا ۷ روز پس از تحویل سفارش، امکان
        درخواست تعویض سایز یا مرجوع کردن کالا برای شما فراهم است. همچنین در
        صورتی که کالای ارسال‌شده دارای ایراد ظاهری، نقص دوخت یا مغایرت با سفارش
        ثبت‌شده باشد، بدون هیچ هزینه‌ای برای شما تعویض یا مرجوع خواهد شد.
      </p>

      <p>
        برای پذیرش تعویض یا مرجوعی، لازم است پوشاک دقیقاً در وضعیت اولیه خود
        باقی مانده باشد؛ یعنی پوشیده و استفاده نشده باشد، شستشو نشده و بوی عطر یا
        لکه نداشته باشد و تمامی اتیکت‌ها، تگ‌ها و بسته‌بندی اصلی محصول کاملاً
        سالم باشند. بدیهی است به دلیل رعایت اصول بهداشتی، امکان تعویض یا بازگشت
        لباس‌های زیر پس از باز شدن بسته‌بندی وجود ندارد.
      </p>

      <p>
        لطفاً پیش از ارسال کالا حتماً با واحد پشتیبانی ما هماهنگ کنید تا راهنمایی
        لازم و آدرس دقیق برگشت در اختیارتان قرار گیرد. پس از دریافت مرسوله و
        تایید سلامت کالا توسط کارشناسان ما، سایز جایگزین برای شما ارسال شده یا در
        صورت درخواست استرداد، مبلغ فاکتور حداکثر ظرف ۷۲ ساعت کاری به شماره کارت
        اعلامی شما واریز می‌گردد.
      </p>
    </InfoPageShell>
  );
}