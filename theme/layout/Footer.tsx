import Link from "next/link";
import {
  Phone,
  Mail,
  MapPin,
  Truck,
  ShieldCheck,
  Headphones,
  Globe,
  Send,
} from "lucide-react";
import type { SiteConfig } from "@/theme/config";

export function Footer({ config }: { config: SiteConfig }) {
  return (
    <footer className="bg-zinc-200 text-zinc-400 border-t border-zinc-300 mt-8">
      <div className="container mx-auto px-4 py-8 border-b border-zinc-300">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div className="flex flex-col items-center space-y-2">
            <div className="p-3 bg-zinc-300 rounded-2xl shadow-sm">
              <Truck className="h-6 w-6 text-brand" />
            </div>
            <span className="text-[12px] font-bold text-zinc-800">ارسال سریع مرسولات</span>
            <span className="text-[12px] text-zinc-900">تحویل فوری با بهترین روش‌های ارسال</span>
          </div>

          <div className="flex flex-col items-center space-y-2">
            <div className="p-3 bg-zinc-300 rounded-2xl shadow-sm">
              <ShieldCheck className="h-6 w-6 text-brand" />
            </div>
            <span className="text-[12px] font-bold text-zinc-800">امکان پرداخت بصورت اقساطی</span>
            <span className="text-[12px] text-zinc-900">پرداختی اقساطی برای خریدهای شما!</span>
          </div>

          <div className="flex flex-col items-center space-y-2">
            <div className="p-3 bg-zinc-300 rounded-2xl shadow-sm">
              <Headphones className="h-6 w-6 text-brand" />
            </div>
            <span className="text-[12px] font-bold text-zinc-800">پشتیبانی ۲۴ ساعته</span>
            <span className="text-[12px] text-zinc-900">پاسخگویی سریع در تمامی روزهای هفته</span>
          </div>

          <div className="flex flex-col items-center space-y-2">
            <div className="p-3 bg-zinc-300 rounded-2xl shadow-sm">
              <MapPin className="h-6 w-6 text-brand" />
            </div>
            <span className="text-[12px] font-bold text-zinc-800">امکان خرید حضوری</span>
            <span className="text-[12px] text-zinc-900">پشتیبانی از مراجعات و خریدهای حضوری</span>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <span className="text-base font-extrabold text-zinc-900 block">{config.name}</span>
            <p className="text-[12px] leading-relaxed text-zinc-500">{config.description}</p>
            <div className="flex items-center gap-3 pt-2">
              <a
                href={config.socials.website}
                aria-label="وب‌سایت"
                className="p-2.5 bg-zinc-300 hover:bg-brand hover:text-brand-foreground rounded-xl transition text-zinc-400"
              >
                <Globe className="h-4 w-4" />
              </a>
              <a
                href={config.socials.telegram}
                aria-label="پیام‌رسان"
                className="p-2.5 bg-zinc-300 hover:bg-brand hover:text-brand-foreground rounded-xl transition text-zinc-400"
              >
                <Send className="h-4 w-4" />
              </a>
            </div>
          </div>

          <div className="space-y-4">
            <span className="text-[12px] font-bold text-zinc-800 block">دسترسی سریع</span>
            <ul className="space-y-3 text-[12px] text-zinc-500">
              {config.navLinks.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="hover:text-zinc-900 transition">
                    {item.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link href="/profile" className="hover:text-zinc-900 transition">
                  پنل کاربری من
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <span className="text-[12px] font-bold text-zinc-800 block">ارتباط با ما</span>
            <ul className="space-y-3.5 text-[12px] text-zinc-500">
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-zinc-600 flex-shrink-0" />
                <span dir="ltr">{config.phoneDisplay}</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-zinc-600 flex-shrink-0" />
                <span>{config.email}</span>
              </li>
              <li className="flex items-start gap-2 leading-relaxed">
                <MapPin className="h-4 w-4 text-zinc-600 flex-shrink-0 mt-0.5" />
                <span>{config.address.full}</span>
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <span className="text-[12px] font-bold text-zinc-800 block">مجوزهای قانونی</span>
            <div className="flex gap-3 bg-zinc-300/50 p-4 rounded-2xl w-fit border border-zinc-300">
              <div className="w-16 h-16 bg-zinc-900 border border-zinc-700/50 rounded-xl flex items-center justify-center text-[9px] text-zinc-600 font-extrabold select-none">
                E-Namad
              </div>
              <div className="w-16 h-16 bg-zinc-900 border border-zinc-700/50 rounded-xl flex items-center justify-center text-[9px] text-zinc-600 font-extrabold select-none">
                Samandehi
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-zinc-950/40 py-5 border-t border-zinc-300/40 text-center">
        <p className="text-[10px] text-zinc-200 leading-relaxed px-4">{config.copyright}</p>
      </div>
    </footer>
  );
}