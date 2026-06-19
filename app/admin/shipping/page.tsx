import { prisma } from "@/lib/prisma";
import {
  createShippingMethod,
  toggleShippingMethod,
  deleteShippingMethod,
} from "./actions";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Truck, Plus, Trash2, ShieldCheck, ShieldAlert, Check } from "lucide-react";

export default async function AdminShippingPage() {
  const methods = await prisma.shippingMethod.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="container mx-auto py-8 px-4 space-y-8 animate-fade-in">
      
      {/* هدر */}
      <div className="flex items-center gap-3.5 pb-6 border-b border-zinc-100">
        <div className="p-3 bg-zinc-50 border border-zinc-100 rounded-2xl text-zinc-700 shadow-sm">
          <Truck className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">روش‌های ارسال</h1>
          <p className="text-xs text-zinc-400 mt-1">مدیریت انواع شیوه ارسال سفارش، هزینه‌ها و زمان تحویل</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* فرم ساخت روش ارسال جدید (عرض ۱ از ۳) */}
        <Card className="border-zinc-100 shadow-sm rounded-2xl">
          <CardHeader className="border-b border-zinc-50 bg-zinc-50/20 pb-4">
            <CardTitle className="text-sm font-bold text-zinc-800">افزودن روش ارسال جدید</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <form action={createShippingMethod} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-500 mb-2">نام روش ارسال</label>
                <input
                  name="name"
                  required
                  placeholder="مثال: پست پیشتاز، تیپاکس، پیک موتوری"
                  className="w-full px-4 py-3 border border-zinc-200 rounded-xl bg-zinc-50/30 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition text-xs font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-500 mb-2">هزینه ارسال (تومان)</label>
                <input
                  type="number"
                  name="price"
                  required
                  placeholder="مثال: ۳۹۰۰۰"
                  className="w-full px-4 py-3 border border-zinc-200 rounded-xl bg-zinc-50/30 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition text-xs font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-500 mb-2">زمان تقریبی تحویل</label>
                <input
                  name="estimatedTime"
                  required
                  placeholder="مثال: ۲ تا ۴ روز کاری، همان روز"
                  className="w-full px-4 py-3 border border-zinc-200 rounded-xl bg-zinc-50/30 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition text-xs font-medium"
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <input
                  type="checkbox"
                  name="isActive"
                  id="isActive"
                  defaultChecked
                  className="w-4 h-4 text-blue-600 border-zinc-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="isActive" className="text-xs font-bold text-zinc-600 cursor-pointer">فعال باشد</label>
              </div>

              <Button type="submit" size="sm" className="w-full rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs h-10 flex items-center justify-center gap-1.5 pt-2">
                <Plus className="h-4 w-4" />
                <span>ثبت روش ارسال</span>
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* لیست روش‌های ارسال فعلی (عرض ۲ از ۳) */}
        <div className="lg:col-span-2 space-y-4">
          {methods.length === 0 ? (
            <Card className="border-dashed border-zinc-200 p-8 text-center bg-zinc-50/20">
              <CardContent className="py-4 text-xs text-zinc-400">هیچ روش ارسالی هنوز تعریف نشده است.</CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {methods.map((method) => {
                const isMethodActive = method.isActive;
                return (
                  <Card key={method.id} className="border-zinc-100 shadow-sm rounded-2xl p-5 bg-white">
                    <CardContent className="p-0 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      
                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          <span className="font-bold text-sm text-zinc-800">{method.name}</span>
                          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-[9px] font-bold ${
                            isMethodActive 
                              ? "bg-green-50 text-green-700 border border-green-100" 
                              : "bg-red-50 text-red-700 border border-red-100"
                          }`}>
                            {isMethodActive ? "فعال" : "غیرفعال"}
                          </span>
                        </div>
                        <div className="text-[10px] text-zinc-400 font-semibold space-y-1">
                          <p>هزینه تحویل: {Number(method.price).toLocaleString("fa-IR")} تومان</p>
                          <p>مدت زمان ارسال: {method.estimatedTime}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 border-t sm:border-t-0 pt-3 sm:pt-0 border-zinc-50">
                        {/* دکمه تغییر وضعیت فعال/غیرفعال */}
                        <form action={toggleShippingMethod.bind(null, method.id, isMethodActive)}>
                          <Button
                            type="submit"
                            variant="outline"
                            size="sm"
                            className="rounded-xl h-9 text-xs font-semibold border-zinc-200"
                          >
                            {isMethodActive ? (
                              <span className="flex items-center gap-1.5 text-red-600">
                                <ShieldAlert className="h-3.5 w-3.5" />
                                <span>غیرفعال‌سازی</span>
                              </span>
                            ) : (
                              <span className="flex items-center gap-1.5 text-emerald-600">
                                <ShieldCheck className="h-3.5 w-3.5" />
                                <span>فعال‌سازی</span>
                              </span>
                            )}
                          </Button>
                        </form>

                        {/* دکمه حذف */}
                        <form action={deleteShippingMethod.bind(null, method.id)}>
                          <Button type="submit" variant="destructive" className="rounded-xl h-9 w-9 flex items-center justify-center p-0">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </form>
                      </div>

                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}