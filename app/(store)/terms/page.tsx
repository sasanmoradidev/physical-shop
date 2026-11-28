import type { Metadata } from "next";
import { FileText } from "lucide-react";
import { getSiteConfig } from "@/lib/site-config";
import { InfoPageShell } from "@/components/store/info-page-shell";

export async function generateMetadata(): Promise<Metadata> {
  const config = await getSiteConfig();
  return {
    title: `قوانین و مقررات | ${config.name}`,
    description: `ضوابط و شرایط استفاده از خدمات و خرید آنلاین در ${config.name}`,
  };
}

export default async function TermsPage() {
  const config = await getSiteConfig();

  return (
    <InfoPageShell
      title="قوانین و مقررات"
      subtitle="شرایط و ضوابط استفاده از خدمات و خرید اینترنتی"
      icon={<FileText className="h-6 w-6" />}
      breadcrumbs={[{ label: "قوانین و مقررات" }]}
      config={config}
      activePath="/terms"
    >
      <p>
        تمامی فعالیت‌ها و فرآیندهای خرید در وب‌سایت {config.name} منطبق با
        قوانین جمهوری اسلامی ایران، قانون تجارت الکترونیک و قانون حمایت از حقوق
        مصرف‌کنندگان انجام می‌شود. عضویت در سایت و ثبت هرگونه سفارش به منزله
        آگاهی و پذیرش کامل قوانین و شرایط مندرج در این صفحه است.
      </p>

      <p>
        کلیه قیمت‌های درج‌شده در فروشگاه به تومان و به‌روز هستند و ثبت نهایی
        سفارش پس از تکمیل پرداخت آنلاین یا تایید رسید کارت به کارت توسط کارشناسان
        قطعی می‌شود. کاربر موظف است هنگام ثبت سفارش، مشخصات گیرنده، شماره موبایل،
        کد پستی و نشانی دقیق را به درستی وارد کند؛ مسئولیت هرگونه تاخیر یا برگشت
        مرسوله ناشی از اطلاعات ناقص یا نادرست بر عهده خریدار خواهد بود.
      </p>

      <p>
        فروشگاه تمام تلاش خود را برای تحویل سفارش‌ها در بازه زمانی اعلام‌شده به
        کار می‌گیرد و در صورت بروز شرایط پیش‌بینی‌نشده یا اتمام ناگهانی موجودی یک
        کالا، موضوع به اطلاع خریدار رسیده و مبلغ پرداختی به صورت کامل عودت داده
        می‌شود. همچنین تمامی محتوا، تصاویر، لوگو و طراحی‌های موجود در این
        وب‌سایت متعلق به {config.name} بوده و هرگونه کپی‌برداری یا استفاده تجاری
        بدون کسب مجوز کتبی مجاز نیست.
      </p>
    </InfoPageShell>
  );
}