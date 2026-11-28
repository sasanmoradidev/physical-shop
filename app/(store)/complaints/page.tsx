import type { Metadata } from "next";
import { MessageCircle } from "lucide-react";
import { getSiteConfig } from "@/lib/site-config";
import { InfoPageShell } from "@/components/store/info-page-shell";

export async function generateMetadata(): Promise<Metadata> {
  const config = await getSiteConfig();
  return {
    title: `پیگیری شکایات | ${config.name}`,
    description: `نحوه ثبت و پیگیری شکایات و انتقادات مشتریان در ${config.name}`,
  };
}

export default async function ComplaintsPage() {
  const config = await getSiteConfig();

  return (
    <InfoPageShell
      title="پیگیری شکایات"
      subtitle="رسیدگی شفاف، منصفانه و سریع به هرگونه انتقاد یا نارضایتی"
      icon={<MessageCircle className="h-6 w-6" />}
      breadcrumbs={[{ label: "پیگیری شکایات" }]}
      config={config}
      activePath="/complaints"
    >
      <p>
        رضایت کامل شما از کیفیت کالا، بسته‌بندی و روند ارسال مهم‌ترین معیار
        ارزیابی عملکرد ما در {config.name} است. چنانچه در هر مرحله از خرید،
        تحویل سفارش یا کیفیت محصول دریافتی با مشکلی مواجه شدید یا انتقادی نسبت به
        خدمات ما داشتید، شنیدن صدای شما برای ما ارزشمند است و پیگیری آن را وظیفه
        قطعی خود می‌دانیم.
      </p>

      <p>
        برای ثبت و پیگیری شکایت کافی است شماره سفارش خود به همراه شرح کوتاهی از
        موضوع (و در صورت نیاز تصویر محصول یا بسته‌بندی) را از طریق تماس با شماره
        پشتیبانی، ارسال ایمیل به نشانی رسمی فروشگاه یا فرم صفحه «تماس با ما» برای
        واحد امور مشتریان ارسال کنید تا پرونده پیگیری شما بلافاصله ثبت شود.
      </p>

      <p>
        تمامی شکایات ثبت‌شده به صورت مستقیم توسط واحد رسیدگی و مدیریت بررسی
        می‌شوند و نتیجه پیگیری حداکثر ظرف ۴۸ ساعت کاری از طریق تماس تلفنی یا
        پیام به شما اطلاع داده خواهد شد. هدف ما در تمام مراحل، رفع سریع مشکل و
        جلب رضایت کامل شما به منصفانه‌ترین شکل ممکن است.
      </p>
    </InfoPageShell>
  );
}