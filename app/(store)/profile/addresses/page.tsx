import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/rbac-server";
import { deleteAddress } from "./actions";
import Link from "next/link";

// ایمپورت کامپوننت‌های شکیل پروژه (Shadcn UI)
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

// ایمپورت آیکون‌های شکیل از خانواده Lucide
import {
  MapPin,
  Plus,
  User,
  Phone,
  Hash,
  Navigation,
  MapPinOff,
  Edit,
  Trash2,
} from "lucide-react";

export default async function AddressesPage() {
  const user = await requireAuth();

  const addresses = await prisma.address.findMany({
    where: {
      userId: user.id,
    },
    orderBy: {
      id: "desc", // نمایش جدیدترین آدرس‌ها در بالای لیست
    },
  });

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* هدر بالای لیست آدرس‌ها */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-zinc-100">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">آدرس‌های من</h1>
          <p className="text-xs text-zinc-400">آدرس‌های ثبت‌یافته برای تحویل و ارسال سفارشات خود را در زیر مدیریت کنید.</p>
        </div>

        <Button asChild size="sm" className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-sm flex items-center gap-2 w-fit">
          <Link href="/profile/addresses/new">
            <Plus className="h-4 w-4" />
            <span>افزودن آدرس جدید</span>
          </Link>
        </Button>
      </div>

      {/* ۱. مدیریت حالت خالی بودن لیست آدرس‌ها (Empty State) */}
      {addresses.length === 0 ? (
        <Card className="border-dashed border-zinc-200 p-12 text-center bg-zinc-50/20">
          <CardContent className="flex flex-col items-center justify-center space-y-4">
            <div className="p-4 bg-zinc-50 rounded-full text-zinc-400 border border-zinc-100">
              <MapPinOff className="h-10 w-10" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-zinc-800">هیچ آدرسی ثبت نشده است</h3>
              <p className="text-xs text-zinc-400">هنوز هیچ آدرسی برای ارسال کالا در حساب کاربری خود ثبت نکرده‌اید.</p>
            </div>
            <Button asChild variant="outline" size="sm" className="rounded-xl border-zinc-200">
              <Link href="/profile/addresses/new">
                <Plus className="h-4 w-4 ml-1.5" />
                <span>ثبت اولین آدرس ارسال</span>
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        /* ۲. گرید شکیل نمایش کارت‌های آدرس */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {addresses.map((address) => (
            <Card
              key={address.id}
              className="border-zinc-100 shadow-sm rounded-2xl overflow-hidden hover:shadow-md transition duration-200 bg-white flex flex-col justify-between"
            >
              <div>
                {/* هدر کارت با برچسب عنوان آدرس */}
                <CardHeader className="border-b border-zinc-50 bg-zinc-50/20 pb-4">
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-600 rounded-xl text-xs font-bold border border-blue-100 shadow-inner">
                      <MapPin className="h-3.5 w-3.5" />
                      <span>{address.title}</span>
                    </span>
                  </div>
                </CardHeader>
                
                {/* بدنه جزئیات آدرس گیرنده */}
                <CardContent className="p-5 space-y-3.5 text-xs text-zinc-500">
                  <div className="flex items-start gap-2.5">
                    <User className="h-4 w-4 text-zinc-400 flex-shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <span className="text-[9px] text-zinc-400 block">گیرنده سفارش</span>
                      <span className="font-bold text-zinc-800 block text-xs">{address.fullName}</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <Phone className="h-4 w-4 text-zinc-400 flex-shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <span className="text-[9px] text-zinc-400 block">شماره موبایل تحویل‌گیرنده</span>
                      <span className="font-semibold text-zinc-700 block" dir="ltr">{address.phone}</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <Navigation className="h-4 w-4 text-zinc-400 flex-shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <span className="text-[9px] text-zinc-400 block">استان و شهر</span>
                      <span className="font-bold text-zinc-800 block">
                        {address.province} - {address.city}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <Hash className="h-4 w-4 text-zinc-400 flex-shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <span className="text-[9px] text-zinc-400 block">کد پستی ده رقمی</span>
                      <span className="font-semibold text-zinc-700 block font-mono tracking-wider" dir="ltr">
                        {address.postalCode}
                      </span>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-zinc-50 leading-relaxed text-zinc-600 font-medium text-xs">
                    {address.addressLine}
                  </div>
                </CardContent>
              </div>

              {/* دکمه‌های حذف و ویرایش انتهای کارت آدرس */}
              <div className="p-4 pt-0 border-t border-zinc-50/60 mt-auto flex items-center justify-between gap-2.5 bg-zinc-50/20">
                <Button
                  asChild
                  variant="outline"
                  className="flex-1 flex items-center justify-center gap-1.5 text-xs font-semibold py-2 h-9 rounded-xl border-zinc-200 text-zinc-700 hover:bg-zinc-50 transition"
                >
                  <Link href={`/profile/addresses/${address.id}/edit`}>
                    <Edit className="h-3.5 w-3.5 text-zinc-500" />
                    <span>ویرایش</span>
                  </Link>
                </Button>

                <form
                  action={deleteAddress.bind(null, address.id)}
                  className="flex-shrink-0"
                >
                  <Button
                    type="submit"
                    variant="destructive"
                    className="rounded-xl h-9 w-9 flex items-center justify-center p-0 shadow-sm"
                    aria-label="حذف آدرس"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </form>
              </div>

            </Card>
          ))}
        </div>
      )}
    </div>
  );
}