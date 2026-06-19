"use client";

import { useState, useTransition } from "react";
import {
  createShippingMethod,
  updateShippingMethod,
  toggleShippingMethod,
  deleteShippingMethod,
} from "@/app/admin/shipping/actions";

// ایمپورت کامپوننت‌های شکیل پروژه (Shadcn UI)
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

// ایمپورت آیکون‌های لوساید برای دکمه‌های کنترل
import { Trash2, Edit, Check, X, ShieldAlert, ShieldCheck } from "lucide-react";

type ShippingMethod = {
  id: string;
  name: string;
  price: any; // شیء Decimal از دیتابیس پریزما
  estimatedTime: string;
  isActive: boolean;
};

type Props = {
  initialMethods: ShippingMethod[];
};

export function ShippingManager({ initialMethods }: Props) {
  const [selectedMethod, setSelectedMethod] = useState<ShippingMethod | null>(null);
  const isEditMode = !!selectedMethod;

  // فیلدهای فرم چپ
  const [name, setName] = useState("");
  const [price, setPrice] = useState<string>("");
  const [estimatedTime, setEstimatedTime] = useState("");
  const [isActive, setIsActive] = useState(true);

  const [isPending, startTransition] = useTransition();

  // فعالسازی حالت ویرایش و پر کردن فرم چپ با مشخصات روش انتخاب شده
  const handleStartEdit = (method: ShippingMethod) => {
    setSelectedMethod(method);
    setName(method.name);
    setPrice(String(Number(method.price)));
    setEstimatedTime(method.estimatedTime);
    setIsActive(method.isActive);
    
    // اسکرول نرم به بالای صفحه در موبایل برای دیدن فرم
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // لغو حالت ویرایش و ریست کردن فرم
  const handleCancelEdit = () => {
    setSelectedMethod(null);
    setName("");
    setPrice("");
    setEstimatedTime("");
    setIsActive(true);
  };

  // ثبت نهایی فرم (ایجاد یا ویرایش)
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !price || Number(price) < 0 || !estimatedTime) {
      alert("لطفاً تمامی فیلدها را با مقادیر معتبر پر کنید.");
      return;
    }

    startTransition(async () => {
      try {
        if (isEditMode && selectedMethod) {
          // ۱. اجرای اکشن آپدیت
          await updateShippingMethod(
            selectedMethod.id,
            name,
            Number(price),
            estimatedTime,
            isActive
          );
          alert("تغییرات با موفقیت ذخیره شد.");
        } else {
          // ۲. اجرای اکشن ایجاد
          await createShippingMethod(
            name,
            Number(price),
            estimatedTime,
            isActive
          );
          alert("روش ارسال جدید با موفقیت ثبت شد.");
        }
        // ریست فرم بعد از موفقیت
        handleCancelEdit();
      } catch (error: any) {
        console.error(error);
        alert(error?.message || "خطایی رخ داد. لطفاً دوباره تلاش کنید.");
      }
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
      
      {/* سمت راست (عرض ۱ از ۳): فرم پویا که بر حسب انتخاب، عنوانش تغییر می‌کند */}
      <Card className="border-zinc-100 shadow-sm rounded-2xl bg-white">
        <CardHeader className="border-b border-zinc-50 bg-zinc-50/20 pb-4">
          <CardTitle className="text-sm font-extrabold text-zinc-800">
            {isEditMode ? "ویرایش روش ارسال" : "افزودن روش ارسال جدید"}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold text-zinc-400 mb-2">نام روش ارسال</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="مثال: تیپاکس، پست پیشتاز، پیک"
                className="w-full px-4 py-3 border border-zinc-200 rounded-xl bg-zinc-50/30 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition text-xs font-semibold"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-zinc-400 mb-2">هزینه ارسال (تومان)</label>
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required
                placeholder="مثال: ۴۹۰۰۰"
                className="w-full px-4 py-3 border border-zinc-200 rounded-xl bg-zinc-50/30 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition text-xs font-semibold"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-zinc-400 mb-2">زمان تقریبی تحویل</label>
              <input
                value={estimatedTime}
                onChange={(e) => setEstimatedTime(e.target.value)}
                required
                placeholder="مثال: ۲ تا ۴ روز کاری"
                className="w-full px-4 py-3 border border-zinc-200 rounded-xl bg-zinc-50/30 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition text-xs font-semibold"
              />
            </div>

            <div className="flex items-center gap-3 pt-2">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                id="isActive"
                className="w-4 h-4 text-blue-600 border-zinc-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="isActive" className="text-xs font-bold text-zinc-600 cursor-pointer">فعال باشد</label>
            </div>

            <div className="flex flex-col gap-2 pt-4 border-t border-zinc-50 mt-2">
              <Button
                type="submit"
                disabled={isPending}
                size="sm"
                className="w-full rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs h-10 flex items-center justify-center gap-1.5 shadow-sm"
              >
                {isPending ? (
                  <span>در حال ثبت...</span>
                ) : (
                  <>
                    <Check className="h-4 w-4" />
                    <span>{isEditMode ? "ذخیره تغییرات" : "ثبت روش ارسال"}</span>
                  </>
                )}
              </Button>

              {isEditMode && (
                <Button
                  type="button"
                  onClick={handleCancelEdit}
                  variant="outline"
                  size="sm"
                  className="w-full rounded-xl border-zinc-200 text-zinc-500 text-xs font-bold h-10 flex items-center justify-center gap-1.5"
                >
                  <X className="h-4 w-4" />
                  <span>انصراف و افزودن جدید</span>
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      {/* سمت چپ (عرض ۲ از ۳): لیست روش‌های ارسال با دکمه ویرایش */}
      <div className="lg:col-span-2 space-y-4">
        {initialMethods.length === 0 ? (
          <Card className="border-dashed border-zinc-200 p-12 text-center bg-zinc-50/20 animate-fade-in">
            <CardContent className="py-4 text-xs text-zinc-400">
              هیچ روش ارسالی هنوز تعریف نشده است.
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {initialMethods.map((method) => {
              const isSelectedForEdit = selectedMethod?.id === method.id;
              const isMethodActive = method.isActive;

              return (
                <Card
                  key={method.id}
                  className={`border p-5 rounded-2xl transition duration-200 ${
                    isSelectedForEdit
                      ? "border-blue-500 bg-blue-50/10 ring-1 ring-blue-500 shadow-inner"
                      : "border-zinc-100 bg-white shadow-sm"
                  }`}
                >
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

                    <div className="flex items-center gap-2 border-t sm:border-t-0 pt-3 sm:pt-0 border-zinc-50 flex-shrink-0">
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

                      {/* دکمه انتقال اطلاعات به فرم چپ جهت ویرایش */}
                      <Button
                        type="button"
                        onClick={() => handleStartEdit(method)}
                        variant="outline"
                        className="rounded-xl h-9 text-xs font-semibold border-zinc-200 text-zinc-700 hover:bg-zinc-50 flex items-center gap-1.5 px-4"
                      >
                        <Edit className="h-3.5 w-3.5 text-zinc-500" />
                        <span>ویرایش</span>
                      </Button>

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
  );
}