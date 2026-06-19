import Link from "next/link";
import {
  Phone,
  Mail,
  MapPin,
  Truck,
  ShieldCheck,
  Headphones,
  Globe, // 👈 جایگزین Instagram شد
  Send,
} from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-zinc-900 text-zinc-400 border-t border-zinc-800">
      
      {/* بخش ۱: کارت‌های تضمین و مزایای خرید */}
      <div className="container mx-auto px-4 py-8 border-b border-zinc-800">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          
          <div className="flex flex-col items-center space-y-2">
            <div className="p-3 bg-zinc-800 text-zinc-100 rounded-2xl shadow-sm">
              <Truck className="h-5 w-5 text-blue-500" />
            </div>
            <span className="text-xs font-bold text-zinc-100">ارسال سریع مرسولات</span>
            <span className="text-[10px] text-zinc-500">تحویل فوری با بهترین روش‌های ارسال</span>
          </div>

          <div className="flex flex-col items-center space-y-2">
            <div className="p-3 bg-zinc-800 text-zinc-100 rounded-2xl shadow-sm">
              <ShieldCheck className="h-5 w-5 text-blue-500" />
            </div>
            <span className="text-xs font-bold text-zinc-100">ضمانت اصالت کالا</span>
            <span className="text-[10px] text-zinc-500">تضمین ۱۰۰٪ اصالت و کیفیت برتر کالاها</span>
          </div>

          <div className="flex flex-col items-center space-y-2">
            <div className="p-3 bg-zinc-800 text-zinc-100 rounded-2xl shadow-sm">
              <Headphones className="h-5 w-5 text-blue-500" />
            </div>
            <span className="text-xs font-bold text-zinc-100">پشتیبانی ۲۴ ساعته</span>
            <span className="text-[10px] text-zinc-500">پاسخگویی سریع در تمامی روزهای هفته</span>
          </div>

          <div className="flex flex-col items-center space-y-2">
            <div className="p-3 bg-zinc-800 text-zinc-100 rounded-2xl shadow-sm">
              <MapPin className="h-5 w-5 text-blue-500" />
            </div>
            <span className="text-xs font-bold text-zinc-100">امکان خرید حضوری</span>
            <span className="text-[10px] text-zinc-500">پشتیبانی از مراجعات و خریدهای حضوری</span>
          </div>

        </div>
      </div>

      {/* بخش ۲: لینک‌های دسترسی سریع، آدرس‌ها و مجوزها */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* ستون اول: معرفی فروشگاه */}
          <div className="space-y-4">
            <span className="text-base font-extrabold text-zinc-100 block">فروشگاه فیزیکی</span>
            <p className="text-xs leading-relaxed text-zinc-500">
              بهترین مقصد برای خرید مطمئن و سریع انواع محصولات با اصالت. ما همواره تلاش می‌کنیم تا بهترین کالاها را با روش‌های ارسال سریع و پاسخگویی مداوم به دست شما برسانیم.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <a href="#" aria-label="وب‌سایت" className="p-2.5 bg-zinc-800 hover:bg-blue-600 hover:text-white rounded-xl transition text-zinc-400">
                <Globe className="h-4 w-4" />
              </a>
              <a href="#" aria-label="پیام‌رسان" className="p-2.5 bg-zinc-800 hover:bg-blue-600 hover:text-white rounded-xl transition text-zinc-400">
                <Send className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* ستون دوم: دسترسی سریع */}
          <div className="space-y-4">
            <span className="text-xs font-bold text-zinc-100 block">دسترسی سریع</span>
            <ul className="space-y-3 text-xs text-zinc-500">
              <li>
                <Link href="/" className="hover:text-zinc-100 transition">صفحه اصلی</Link>
              </li>
              <li>
                <Link href="/products" className="hover:text-zinc-100 transition">مشاهده محصولات</Link>
              </li>
              <li>
                <Link href="/contactus" className="hover:text-zinc-100 transition">تماس با ما</Link>
              </li>
              <li>
                <Link href="/profile" className="hover:text-zinc-100 transition">پنل کاربری من</Link>
              </li>
            </ul>
          </div>

          {/* ستون سوم: اطلاعات ارتباطی */}
          <div className="space-y-4">
            <span className="text-xs font-bold text-zinc-100 block">ارتباط با ما</span>
            <ul className="space-y-3.5 text-xs text-zinc-500">
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-zinc-600 flex-shrink-0" />
                <span dir="ltr">۰۲۱-۸۸۸۸۸۸۸۸</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-zinc-600 flex-shrink-0" />
                <span>info@example.com</span>
              </li>
              <li className="flex items-start gap-2 leading-relaxed">
                <MapPin className="h-4 w-4 text-zinc-600 flex-shrink-0 mt-0.5" />
                <span>تهران، خیابان ولیعصر، دفتر مرکزی فروشگاه فیزیکی</span>
              </li>
            </ul>
          </div>

          {/* ستون چهارم: نمادهای اعتماد الکترونیکی */}
          <div className="space-y-4">
            <span className="text-xs font-bold text-zinc-100 block">مجوزهای قانونی</span>
            <div className="flex gap-3 bg-zinc-800/50 p-4 rounded-2xl w-fit border border-zinc-800">
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

      {/* بخش ۳: کپی‌رایت انتهای فوتر */}
      <div className="bg-zinc-950/40 py-5 border-t border-zinc-800/40 text-center">
        <p className="text-[10px] text-zinc-600 leading-relaxed px-4">
          © کلیه حقوق این وب‌سایت متعلق به شرکت فروشگاه فیزیکی می‌باشد. هرگونه کپی‌برداری غیرمجاز پیگرد قانونی دارد.
        </p>
      </div>
    </footer>
  );
}