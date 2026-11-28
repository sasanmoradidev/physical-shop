"use client";

import Link from "next/link";
import Image from "next/image";
import {
  Phone,
  Mail,
  MapPin,
  Truck,
  Shirt,
  RefreshCw,
  MessageCircle,
  Globe,
  Send,
  ChevronUp,
  BadgeCheck,
  ShieldCheck,
} from "lucide-react";
import type { SiteConfig } from "@/theme/config";

export function Footer({ config }: { config: SiteConfig }) {
  function scrollToTop() {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  const perks = [
    {
      icon: Shirt,
      title: "تضمین کیفیت و دوخت",
      subtitle: "انتخاب دقیق پارچه و تن‌خور",
    },
    {
      icon: RefreshCw,
      title: "ضمانت تعویض سایز",
      subtitle: "تا ۷ روز بدون دغدغه",
    },
    {
      icon: Truck,
      title: "ارسال سریع به سراسر ایران",
      subtitle: "بسته‌بندی شکیل و ایمن",
    },
    {
      icon: MessageCircle,
      title: "مشاوره انتخاب سایز",
      subtitle: "پاسخگویی سریع پیش از خرید",
    },
  ];

  const accountLinks = [
    { label: "سبد خرید من", href: "/cart" },
    { label: "پیگیری سفارش‌ها", href: "/profile/orders" },
    { label: "آدرس‌های من", href: "/profile/addresses" },
    { label: "حساب کاربری", href: "/profile" },
  ];

  return (
    <footer className="mt-10 bg-white border-t border-zinc-200/70 text-zinc-600">
      <div className="container mx-auto px-4">
        {/* ۱. نوار مدال‌های دایره‌ای مزایای پوشاک (باز و تمیز بدون کارت اضافه) */}
        {/* <div className="grid grid-cols-2 md:grid-cols-4 gap-8 py-12 border-b border-zinc-100">
          {perks.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.title}
                className="group flex flex-col items-center text-center gap-3"
              >
                <div className="h-14 w-14 rounded-full bg-zinc-50 border border-zinc-200/70 flex items-center justify-center text-zinc-700 shadow-2xs group-hover:border-brand/30 group-hover:bg-brand-soft group-hover:text-brand group-hover:-translate-y-1 transition-all duration-300">
                  <Icon className="h-6 w-6 stroke-[1.75]" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-xs sm:text-sm font-bold text-zinc-800">
                    {item.title}
                  </h3>
                  <p className="text-[11px] text-zinc-400">{item.subtitle}</p>
                </div>
              </div>
            );
          })}
        </div> */}

        {/* ۲. کادر نرم ارتباط سریع، لوگو و شبکه‌های اجتماعی */}
        <div className="my-10 rounded-1xl bg-zinc-50/80 border border-zinc-100 px-6 py-6 sm:px-8 sm:py-7 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex flex-col sm:flex-row sm:items-center gap-5">
            <Link href="/" className="shrink-0 w-fit">
              <Image
                src={config.logo}
                alt={config.name}
                width={150}
                height={46}
                className="h-10 w-auto object-contain"
              />
            </Link>

            <div className="hidden sm:block h-8 w-px bg-zinc-200" />

            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs">
              <a
                href={`tel:${config.phone}`}
                className="inline-flex items-center gap-2 text-zinc-700 hover:text-brand transition"
              >
                <Phone className="h-4 w-4 text-zinc-400" />
                <span dir="ltr" className="font-bold text-sm text-zinc-900">
                  {config.phoneDisplay}
                </span>
              </a>

              <a
                href={`mailto:${config.email}`}
                className="inline-flex items-center gap-2 text-zinc-500 hover:text-brand transition"
              >
                <Mail className="h-4 w-4 text-zinc-400" />
                <span className="font-medium">{config.email}</span>
              </a>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <a
              href={config.socials.website}
              target={config.socials.website.startsWith("http") ? "_blank" : undefined}
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-white border border-zinc-200 text-xs font-bold text-zinc-700 hover:border-rose-300 hover:text-rose-600 hover:bg-rose-50/40 transition shadow-2xs"
            >
              <Globe className="h-4 w-4" />
              <span>اینستاگرام / وب‌سایت</span>
            </a>

            <a
              href={config.socials.telegram}
              target={config.socials.telegram.startsWith("http") ? "_blank" : undefined}
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-white border border-zinc-200 text-xs font-bold text-zinc-700 hover:border-sky-300 hover:text-sky-600 hover:bg-sky-50/40 transition shadow-2xs"
            >
              <Send className="h-4 w-4" />
              <span>تلگرام</span>
            </a>

            <button
              type="button"
              onClick={scrollToTop}
              aria-label="بازگشت به بالا"
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-bold transition cursor-pointer shadow-2xs"
            >
              <span>بالای صفحه</span>
              <ChevronUp className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* ۳. بدنه لینک‌ها، معرفی فروشگاه و نمادهای اعتماد */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 pb-12">
          <div className="lg:col-span-5 space-y-4">
            <h2 className="text-sm font-extrabold text-zinc-900">
              درباره {config.name}
            </h2>
            <p className="text-xs leading-7 text-zinc-500 text-justify max-w-xl">
              {config.description}
            </p>
            <div className="flex items-start gap-2 text-xs text-zinc-500 pt-1">
              <MapPin className="h-4 w-4 text-zinc-400 shrink-0 mt-0.5" />
              <span className="leading-relaxed">{config.address.full}</span>
            </div>
          </div>

          <div className="lg:col-span-2 space-y-4">
            <h3 className="text-sm font-extrabold text-zinc-900">
              دسترسی سریع
            </h3>
            <ul className="space-y-3 text-xs text-zinc-500">
              {config.navLinks.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="hover:text-brand transition"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-2 space-y-4">
            <h3 className="text-sm font-extrabold text-zinc-900">
              خدمات مشتریان
            </h3>
            <ul className="space-y-3 text-xs text-zinc-500">
              {accountLinks.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="hover:text-brand transition"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-3 space-y-4">
            <h3 className="text-sm font-extrabold text-zinc-900">
              مجوزهای قانونی
            </h3>
            <div className="flex items-center gap-3">
              <div className="w-24 h-24 rounded-2xl bg-white border border-zinc-200/80 shadow-2xs flex flex-col items-center justify-center gap-1.5 select-none hover:border-zinc-300 transition">
                <BadgeCheck className="h-7 w-7 text-brand/80" />
                <span className="text-[10px] font-bold text-zinc-700">اینماد</span>
                <span className="text-[8px] font-mono text-zinc-400">E-Namad</span>
              </div>

              <div className="w-24 h-24 rounded-2xl bg-white border border-zinc-200/80 shadow-2xs flex flex-col items-center justify-center gap-1.5 select-none hover:border-zinc-300 transition">
                <ShieldCheck className="h-7 w-7 text-emerald-600/80" />
                <span className="text-[10px] font-bold text-zinc-700">ساماندهی</span>
                <span className="text-[8px] font-mono text-zinc-400">Samandehi</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ۴. خط کپی‌رایت پایین */}
      <div className="border-t border-zinc-100">
        <div className="container mx-auto px-4 py-5 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-zinc-400">
          <p className="text-center sm:text-right leading-relaxed">
            {config.copyright}
          </p>
          <span className="text-[11px] font-semibold text-zinc-500 shrink-0">
            {config.name}
          </span>
        </div>
      </div>
    </footer>
  );
}