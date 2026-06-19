import { createAddress } from "../actions";
import { getCurrentUser } from "@/lib/current-user";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function NewAddressPage() {
  const user = await getCurrentUser;
  if (!user) {
    redirect("/login");
  }

  return (
    <div className="container mx-auto px-4 py-10 max-w-2xl">
      {/* دکمه بازگشت بالا */}
      <div className="mb-6">
        <Link
          href="/checkout"
          className="inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-800 transition-colors"
        >
          <svg className="w-4 h-4 rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
          </svg>
          <span>بازگشت به تسویه حساب</span>
        </Link>
      </div>

      <div className="bg-white border border-zinc-100 rounded-3xl shadow-sm p-6 sm:p-8">
        
        {/* سربرگ فرم */}
        <div className="flex items-center gap-3 mb-8 pb-5 border-b border-zinc-100">
          <div className="bg-blue-50 p-2.5 rounded-xl text-blue-600">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <div>
            <h1 className="text-xl font-bold text-zinc-900">افزودن آدرس جدید</h1>
            <p className="text-xs text-zinc-400 mt-1">آدرس دقیق تحویل سفارش را وارد نمایید.</p>
          </div>
        </div>

        {/* بدنه فرم */}
        <form action={createAddress} className="space-y-6">
          
          {/* عنوان آدرس */}
          <div>
            <label className="block text-sm font-semibold text-zinc-700 mb-2">
              عنوان آدرس
            </label>
            <input
              name="title"
              placeholder="مثال: خانه، محل کار"
              required
              className="w-full px-4 py-3 border border-zinc-200 rounded-xl bg-zinc-50/30 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all placeholder:text-zinc-400 text-sm"
            />
          </div>

          {/* گیرنده و موبایل */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-zinc-700 mb-2">
                نام و نام خانوادگی گیرنده
              </label>
              <input
                name="fullName"
                placeholder="نام و نام خانوادگی"
                required
                className="w-full px-4 py-3 border border-zinc-200 rounded-xl bg-zinc-50/30 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all placeholder:text-zinc-400 text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-zinc-700 mb-2">
                شماره موبایل
              </label>
              <input
                name="phone"
                placeholder="مثال: ۰۹۱۲۳۴۵۶۷۸۹"
                type="tel"
                required
                className="w-full px-4 py-3 border border-zinc-200 rounded-xl bg-zinc-50/30 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all placeholder:text-zinc-400 text-sm"
              />
            </div>
          </div>

          {/* استان و شهر */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-zinc-700 mb-2">
                استان
              </label>
              <input
                name="province"
                placeholder="نام استان"
                required
                className="w-full px-4 py-3 border border-zinc-200 rounded-xl bg-zinc-50/30 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all placeholder:text-zinc-400 text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-zinc-700 mb-2">
                شهر
              </label>
              <input
                name="city"
                placeholder="نام شهر"
                required
                className="w-full px-4 py-3 border border-zinc-200 rounded-xl bg-zinc-50/30 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all placeholder:text-zinc-400 text-sm"
              />
            </div>
          </div>

          {/* کد پستی */}
          <div>
            <label className="block text-sm font-semibold text-zinc-700 mb-2">
              کد پستی
            </label>
            <input
              name="postalCode"
              placeholder="مثال: ۱۲۳۴۵۶۷۸۹۰ (بدون خط تیره)"
              required
              className="w-full px-4 py-3 border border-zinc-200 rounded-xl bg-zinc-50/30 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all placeholder:text-zinc-400 text-sm"
            />
          </div>

          {/* جزئیات آدرس */}
          <div>
            <label className="block text-sm font-semibold text-zinc-700 mb-2">
              نشانی پستی (آدرس دقیق)
            </label>
            <textarea
              name="addressLine"
              placeholder="نام خیابان، کوچه، پلاک و واحد"
              required
              rows={3}
              className="w-full px-4 py-3 border border-zinc-200 rounded-xl bg-zinc-50/30 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all placeholder:text-zinc-400 resize-none text-sm leading-relaxed"
            />
          </div>

          {/* دکمه‌های عملیاتی انتهای فرم */}
          <div className="flex items-center justify-end gap-3 pt-6 border-t border-zinc-100">
            <Link
              href="/checkout"
              className="px-5 py-3 border border-zinc-200 hover:bg-zinc-50 text-zinc-600 font-semibold rounded-xl text-sm transition-all"
            >
              انصراف
            </Link>
            
            <button
              type="submit"
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-sm shadow-sm transition-all flex items-center gap-2"
            >
              <span>ذخیره آدرس</span>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}