import Link from "next/link";
import { Home, ChevronLeft, Phone, Mail, ArrowLeft } from "lucide-react";
import type { SiteConfig } from "@/theme/config";

type BreadcrumbItem = {
  label: string;
  href?: string;
};

type Props = {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  breadcrumbs: BreadcrumbItem[];
  config: SiteConfig;
  activePath: string;
  children: React.ReactNode;
};

const QUICK_LINKS = [
  { label: "درباره ما", href: "/about" },
  { label: "حریم خصوصی کاربران", href: "/about/privacy" },
  { label: "شرایط تعویض و مرجوع", href: "/returns" },
  { label: "پیگیری شکایات", href: "/complaints" },
  { label: "قوانین و مقررات", href: "/terms" },
];

export function InfoPageShell({
  title,
  subtitle,
  icon,
  breadcrumbs,
  config,
  activePath,
  children,
}: Props) {
  return (
    <div className="container mx-auto px-4 py-10 animate-fade-in">
      {/* مسیر راهنما (Breadcrumb) */}
      <nav className="flex flex-wrap items-center gap-1.5 text-xs text-zinc-500 mb-8 font-medium bg-zinc-50 w-fit px-3.5 py-2 rounded-xl border border-zinc-100">
        <Link href="/" className="hover:text-brand transition inline-flex items-center gap-1">
          <Home className="w-3.5 h-3.5" />
          <span>خانه</span>
        </Link>

        {breadcrumbs.map((crumb, idx) => (
          <span key={idx} className="inline-flex items-center gap-1.5">
            <ChevronLeft className="w-3.5 h-3.5 text-zinc-300" />
            {crumb.href ? (
              <Link href={crumb.href} className="hover:text-brand transition">
                {crumb.label}
              </Link>
            ) : (
              <span className="text-zinc-800 font-bold">{crumb.label}</span>
            )}
          </span>
        ))}
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* محتوای اصلی */}
        <article className="lg:col-span-8 bg-white border border-zinc-100 rounded-3xl shadow-sm p-6 sm:p-10 space-y-8">
          <header className="flex items-start gap-4 pb-6 border-b border-zinc-100">
            <div className="p-3 rounded-2xl bg-brand-soft text-brand shrink-0">
              {icon}
            </div>
            <div className="space-y-1.5">
              <h1 className="text-2xl sm:text-3xl font-black text-zinc-900 tracking-tight">
                {title}
              </h1>
              <p className="text-xs text-zinc-500 leading-relaxed">{subtitle}</p>
            </div>
          </header>

          <div className="space-y-6 text-sm leading-8 text-zinc-600 text-justify">
            {children}
          </div>
        </article>

        {/* ستون کناری: دسترسی بین صفحات راهنما و تماس سریع */}
        <aside className="lg:col-span-4 space-y-5 lg:sticky lg:top-28">
          <div className="bg-white border border-zinc-100 rounded-3xl shadow-sm p-6 space-y-4">
            <h2 className="text-sm font-extrabold text-zinc-900">
              راهنما و اطلاعات فروشگاه
            </h2>
            <ul className="space-y-1.5">
              {QUICK_LINKS.map((item) => {
                const isActive = activePath === item.href;
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition ${
                        isActive
                          ? "bg-brand-soft text-brand"
                          : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900"
                      }`}
                    >
                      <span>{item.label}</span>
                      <ChevronLeft className="h-3.5 w-3.5 opacity-60" />
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="bg-zinc-50 border border-zinc-100 rounded-3xl p-6 space-y-4">
            <h2 className="text-sm font-extrabold text-zinc-900">
              نیاز به راهنمایی دارید؟
            </h2>
            <p className="text-xs text-zinc-500 leading-relaxed">
              تیم پشتیبانی {config.name} آماده پاسخگویی به پرسش‌های شما در تمام مراحل خرید است.
            </p>
            <div className="space-y-2.5 text-xs">
              <a
                href={`tel:${config.phone}`}
                className="flex items-center gap-2.5 text-zinc-800 hover:text-brand font-bold transition"
              >
                <Phone className="h-4 w-4 text-zinc-400" />
                <span dir="ltr">{config.phoneDisplay}</span>
              </a>
              <a
                href={`mailto:${config.email}`}
                className="flex items-center gap-2.5 text-zinc-600 hover:text-brand font-medium transition"
              >
                <Mail className="h-4 w-4 text-zinc-400" />
                <span className="break-all">{config.email}</span>
              </a>
            </div>
            <Link
              href="/contactus"
              className="mt-2 w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-brand hover:bg-brand-hover text-brand-foreground text-xs font-bold transition"
            >
              <span>رفتن به صفحه تماس با ما</span>
              <ArrowLeft className="h-3.5 w-3.5" />
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}