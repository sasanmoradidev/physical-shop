import type { Metadata } from "next";
import Link from "next/link";
import { Store, ShieldCheck, ArrowLeft } from "lucide-react";
import { getSiteConfig } from "@/lib/site-config";
import { InfoPageShell } from "@/components/store/info-page-shell";

export async function generateMetadata(): Promise<Metadata> {
  const config = await getSiteConfig();
  return {
    title: `درباره ما | ${config.name}`,
    description: `آشنایی با داستان، ارزش‌ها و خدمات فروشگاه ${config.name}`,
  };
}

export default async function AboutPage() {
  const config = await getSiteConfig();

  return (
    <InfoPageShell
      title={`درباره ${config.name}`}
      subtitle="داستان ما، تعهد به کیفیت دوخت و تجربه خریدی مطمئن"
      icon={<Store className="h-6 w-6" />}
      breadcrumbs={[{ label: "درباره ما" }]}
      config={config}
      activePath="/about"
    >
      <p>
        فروشگاه {config.name} با هدف ارائه پوشاک باکیفیت، خوش‌دوخت و همگام با
        استایل روز شکل گرفته است. ما باور داریم انتخاب لباس مناسب تنها یک خرید
        ساده نیست، بلکه بخشی از اعتمادبه‌نفس و راحتی روزمره شماست؛ به همین دلیل
        تمام محصولات پیش از عرضه از نظر جنس پارچه، کیفیت دوخت و استاندارد سایزبندی
        با دقت بررسی و انتخاب می‌شوند.
      </p>

      <p>
        تلاش ما در {config.name} این است که تجربه خرید آنلاین پوشاک را به همان
        اندازه که خرید حضوری دلپذیر است، ساده، شفاف و مطمئن کنیم. از نمایش دقیق
        تصاویر و مشخصات هر محصول گرفته تا بسته‌بندی شکیل، ارسال سریع به سراسر
        کشور و امکان مشاوره پیش از خرید، همه چیز با تمرکز بر آرامش خاطر شما
        طراحی شده است.
      </p>

      <p>
        اعتماد شما بزرگ‌ترین سرمایه ماست و همواره خود را متعهد به پاسخگویی
        شفاف، قیمت‌گذاری منصفانه و پشتیبانی واقعی پس از فروش می‌دانیم. برای
        آشنایی با نحوه حفاظت از اطلاعات شخصی شما در فروشگاه، می‌توانید بخش حریم
        خصوصی کاربران را نیز مطالعه فرمایید.
      </p>

      {/* لینک برجسته به زیرصفحه حریم خصوصی کاربران */}
      <div className="pt-4">
        <Link
          href="/about/privacy"
          className="group flex items-center justify-between gap-4 p-5 rounded-2xl bg-zinc-50 hover:bg-brand-soft/60 border border-zinc-200/70 hover:border-brand/30 transition"
        >
          <div className="flex items-center gap-3.5">
            <div className="p-2.5 rounded-xl bg-white border border-zinc-200/80 text-brand shadow-2xs">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div className="space-y-0.5">
              <span className="text-sm font-extrabold text-zinc-900 block">
                حریم خصوصی کاربران
              </span>
              <span className="text-xs text-zinc-500 block">
                مطالعه سیاست‌های ما در نگهداری و حفاظت از اطلاعات شخصی شما
              </span>
            </div>
          </div>
          <ArrowLeft className="h-4 w-4 text-zinc-400 group-hover:text-brand group-hover:-translate-x-1 transition" />
        </Link>
      </div>
    </InfoPageShell>
  );
}