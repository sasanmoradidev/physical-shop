import Link from "next/link";

// ایمپورت کامپوننت شکیل دکمه پروژه
import { Button } from "@/components/ui/button";

// ایمپورت آیکون‌های استاندارد از خانواده Lucide
import { Compass, ArrowLeft, Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center space-y-8 animate-fade-in relative">
        
        {/* ۱. افکت بصری درخشندگی ملایم در پشت آیکون قطب‌نما */}
        <div className="relative flex justify-center">
          {/* هاله نور پس‌زمینه */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-44 h-44 bg-blue-500/10 blur-3xl rounded-full" />
          
          {/* باکس تیره نگهدارنده قطب‌نما با افکت پالس ملایم */}
          <div className="relative p-6 bg-zinc-900 border border-zinc-800/80 rounded-3xl text-blue-500 shadow-2xl flex items-center justify-center animate-pulse">
            <Compass className="h-16 w-16" />
          </div>
        </div>

        {/* ۲. بخش متون راهنمای خطا */}
        <div className="space-y-3.5">
          <span className="inline-flex items-center text-[10px] font-extrabold text-blue-500 bg-blue-500/10 border border-blue-500/20 px-3 py-1.5 rounded-full uppercase tracking-wider">
            خطای ۴۰۴ - صفحه یافت نشد
          </span>
          
          <h1 className="text-3xl font-black text-white tracking-tight pt-2">
            مسیر را گم کرده‌اید؟
          </h1>
          
          <p className="text-xs text-zinc-500 leading-relaxed max-w-sm mx-auto">
            صفحه‌ای که به دنبال آن هستید وجود ندارد. احتمالاً این آدرس حذف شده، نام آن تغییر یافته یا نشانی آن را به اشتباه وارد کرده‌اید.
          </p>
        </div>

        {/* ۳. دکمه‌های ناوبری شکیل و متوازن */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
          {/* دکمه اصلی: بازگشت به خانه */}
          <Button asChild className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs h-11 px-6 shadow-md shadow-blue-600/10">
            <Link href="/" className="flex items-center gap-2">
              <Home className="h-4 w-4" />
              <span>بازگشت به خانه</span>
            </Link>
          </Button>

          {/* دکمه فرعی: گشت‌وگذار در محصولات */}
          <Button variant="outline" asChild className="rounded-xl border-zinc-800 text-zinc-400 hover:text-white font-bold text-xs h-11 px-6 bg-zinc-900/40 hover:bg-zinc-900 transition">
            <Link href="/products" className="flex items-center gap-2">
              <span>مشاهده محصولات</span>
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
        </div>

      </div>
    </div>
  );
}