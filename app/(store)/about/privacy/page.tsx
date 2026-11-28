import type { Metadata } from "next";
import { ShieldCheck } from "lucide-react";
import { getSiteConfig } from "@/lib/site-config";
import { InfoPageShell } from "@/components/store/info-page-shell";

export async function generateMetadata(): Promise<Metadata> {
  const config = await getSiteConfig();
  return {
    title: `حریم خصوصی کاربران | ${config.name}`,
    description: `سیاست‌های حفظ حریم خصوصی و امنیت اطلاعات مشتریان در ${config.name}`,
  };
}

export default async function PrivacyPage() {
  const config = await getSiteConfig();

  return (
    <InfoPageShell
      title="حریم خصوصی کاربران"
      subtitle="تعهد ما به امانت‌داری و حفاظت از داده‌های شخصی مشتریان"
      icon={<ShieldCheck className="h-6 w-6" />}
      breadcrumbs={[
        { label: "درباره ما", href: "/about" },
        { label: "حریم خصوصی کاربران" },
      ]}
      config={config}
      activePath="/about/privacy"
    >
      <p>
        فروشگاه {config.name} به حریم خصوصی کاربران خود احترام می‌گذارد و حفاظت
        از اطلاعات شخصی شما را از اولویت‌های اصلی خود می‌داند. اطلاعاتی که هنگام
        ثبت‌نام یا ثبت سفارش در اختیار ما قرار می‌دهید—از جمله نام و نام
        خانوادگی، شماره تماس، نشانی پستی و سوابق خرید—تنها با هدف پردازش دقیق
        سفارش، ارسال مرسوله و ارائه خدمات پشتیبانی مورد استفاده قرار می‌گیرد.
      </p>

      <p>
        ما از استانداردهای امنیتی به‌روز برای نگهداری اطلاعات حساب کاربری،
        نشست‌های ورود و مدارک پرداخت استفاده می‌کنیم و متعهد هستیم اطلاعات شخصی
        شما را تحت هیچ شرایطی به اشخاص یا مجموعه‌های ثالث نفروشیم و در اختیار
        دیگران قرار ندهیم، مگر در مواردی که به موجب حکم قانونی از سوی مراجع
        ذی‌صلاح درخواست شود.
      </p>

      <p>
        شما همواره می‌توانید از طریق پنل کاربری خود اطلاعات هویتی و آدرس‌های
        ثبت‌شده را مشاهده و ویرایش کنید. همچنین مسئولیت حفظ محرمانگی رمز عبور و
        کدهای تایید پیامکی بر عهده کاربر است و در صورت وجود هرگونه پرسش یا
        درخواست درباره اطلاعات حساب کاربری، تیم پشتیبانی {config.name} پاسخگوی
        شما خواهد بود.
      </p>
    </InfoPageShell>
  );
}