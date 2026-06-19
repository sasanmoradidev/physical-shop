import { updateAddress } from "../../actions";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/current-user";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";

// ایمپورت کامپوننت‌های شکیل پروژه (Shadcn UI)
import { Button } from "@/components/ui/button";

// ایمپورت آیکون‌های شکیل از خانواده Lucide
import { ArrowRight, MapPin, Check } from "lucide-react";

type Props = {
  params: Promise<{
    id: string;
  }>;
  searchParams: Promise<{
    back?: string;
  }>;
};

export default async function EditAddressPage({ params, searchParams }: Props) {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  // ۱. دریافت شناسه‌ها و پارامترها
  const { id } = await params;
  const { back } = await searchParams;
  const isFromCheckout = back === "checkout";

  // ۲. دریافت اطلاعات آدرس از دیتابیس با اعتبارسنجی مالکیت کاربر
  const address = await prisma.address.findUnique({
    where: { id },
  });

  if (!address || address.userId !== user.id) {
    notFound();
  }

  // ۳. مدیریت داینامیک مسیرها بر اساس مبدا ورود کاربر
  const backUrl = isFromCheckout ? "/checkout" : "/profile/addresses";
  const backLabel = isFromCheckout ? "بازگشت به تسویه حساب" : "بازگشت به آدرس‌ها";

  return (
    <div className="animate-fade-in space-y-6">
      
      {/* دکمه بازگشت داینامیک بالا با آیکون راست‌چین استاندارد */}
      <div>
        <Button
          variant="link"
          size="sm"
          asChild
          className="px-0 text-zinc-500 hover:text-zinc-800 flex items-center gap-1.5 text-xs font-semibold transition-colors"
        >
          <Link href={backUrl}>
            <ArrowRight className="h-4 w-4" />
            <span>{backLabel}</span>
          </Link>
        </Button>
      </div>

      <div className="bg-white border border-zinc-100 rounded-3xl shadow-sm p-6 sm:p-8">
        
        {/* سربرگ فرم */}
        <div className="flex items-center gap-3 mb-8 pb-5 border-b border-zinc-100">
          <div className="bg-blue-50 p-2.5 rounded-xl text-blue-600 border border-blue-100 shadow-sm">
            <MapPin className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-zinc-900 tracking-tight">ویرایش آدرس</h1>
            <p className="text-xs text-zinc-400 mt-1">مشخصات آدرس تحویل سفارش خود را به روزرسانی کنید.</p>
          </div>
        </div>

        {/* بدنه فرم متصل به اکشن آپدیت */}
        <form action={updateAddress.bind(null, address.id)} className="space-y-6">
          
          {/* عنوان آدرس */}
          <div>
            <label className="block text-xs font-semibold text-zinc-500 mb-2">
              عنوان آدرس
            </label>
            <input
              name="title"
              defaultValue={address.title}
              placeholder="مثال: خانه، محل کار"
              required
              className="w-full px-4 py-3 border border-zinc-200 rounded-xl bg-zinc-50/30 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all placeholder:text-zinc-400 text-xs font-medium"
            />
          </div>

          {/* گیرنده و موبایل */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-500 mb-2">
                نام و نام خانوادگی گیرنده
              </label>
              <input
                name="fullName"
                defaultValue={address.fullName}
                placeholder="نام گیرنده تحویل‌گیرنده"
                required
                className="w-full px-4 py-3 border border-zinc-200 rounded-xl bg-zinc-50/30 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all placeholder:text-zinc-400 text-xs font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-500 mb-2">
                شماره موبایل
              </label>
              <input
                name="phone"
                defaultValue={address.phone}
                placeholder="مثال: ۰۹۱۲۳۴۵۶۷۸۹"
                type="tel"
                required
                className="w-full px-4 py-3 border border-zinc-200 rounded-xl bg-zinc-50/30 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all placeholder:text-zinc-400 text-xs font-medium"
              />
            </div>
          </div>

          {/* استان و شهر */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-500 mb-2">
                استان
              </label>
              <input
                name="province"
                defaultValue={address.province}
                placeholder="نام استان"
                required
                className="w-full px-4 py-3 border border-zinc-200 rounded-xl bg-zinc-50/30 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all placeholder:text-zinc-400 text-xs font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-500 mb-2">
                شهر
              </label>
              <input
                name="city"
                defaultValue={address.city}
                placeholder="نام شهر"
                required
                className="w-full px-4 py-3 border border-zinc-200 rounded-xl bg-zinc-50/30 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all placeholder:text-zinc-400 text-xs font-medium"
              />
            </div>
          </div>

          {/* کد پستی */}
          <div>
            <label className="block text-xs font-semibold text-zinc-500 mb-2">
              کد پستی ده رقمی
            </label>
            <input
              name="postalCode"
              defaultValue={address.postalCode}
              placeholder="مثال: ۱۲۳۴۵۶۷۸۹۰"
              required
              className="w-full px-4 py-3 border border-zinc-200 rounded-xl bg-zinc-50/30 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all placeholder:text-zinc-400 text-xs font-medium"
            />
          </div>

          {/* جزئیات آدرس */}
          <div>
            <label className="block text-xs font-semibold text-zinc-500 mb-2">
              نشانی پستی (آدرس دقیق)
            </label>
            <textarea
              name="addressLine"
              defaultValue={address.addressLine}
              placeholder="نام خیابان، کوچه، پلاک، طبقه و واحد..."
              required
              rows={3}
              className="w-full px-4 py-3 border border-zinc-200 rounded-xl bg-zinc-50/30 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all placeholder:text-zinc-400 resize-none text-xs leading-relaxed font-medium"
            />
          </div>

          {/* دکمه‌های انتهای فرم */}
          <div className="flex items-center justify-end gap-3 pt-6 border-t border-zinc-100">
            <Button
              variant="outline"
              asChild
              className="px-5 py-2.5 border-zinc-200 hover:bg-zinc-50 text-zinc-600 font-semibold rounded-xl text-xs h-10 transition-all"
            >
              <Link href={backUrl}>
                <span>انصراف</span>
              </Link>
            </Button>
            
            <Button
              type="submit"
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-xs h-10 shadow-sm transition-all flex items-center gap-1.5"
            >
              <Check className="h-4 w-4" />
              <span>ذخیره تغییرات</span>
            </Button>
          </div>

        </form>
      </div>
    </div>
  );
}