import { requirePermission } from "@/lib/rbac-server";
import { getOtpSetting, updateOtpSetting } from "./actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Settings, ShieldCheck, ToggleLeft, ToggleRight } from "lucide-react";

export default async function AdminSettingsPage() {
  // ۱. بررسی دسترسی ادمین
  await requirePermission("MANAGE_SHIPPING");

  // ۲. دریافت وضعیت فعلی OTP از دیتابیس
  const isOtpEnabled = await getOtpSetting();

  // ۳. اکشن مربوط به سابمیت فرم تغییر وضعیت
  async function handleToggle() {
    "use server";
    await updateOtpSetting(!isOtpEnabled);
  }

  return (
    <div className="container max-w-4xl mx-auto py-8 px-4 space-y-6 animate-fade-in">
      
      {/* هدر صفحه */}
      <div className="flex items-center gap-3.5 pb-6 border-b border-zinc-100">
        <div className="p-3 bg-zinc-50 border border-zinc-100 rounded-2xl text-zinc-700 shadow-sm">
          <Settings className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">تنظیمات فروشگاه</h1>
          <p className="text-xs text-zinc-400 mt-1">تنظیمات عمومی، روش‌های احراز هویت و پارامترهای اصلی سیستم</p>
        </div>
      </div>

      {/* بخش احراز هویت */}
      <Card className="border-zinc-100 shadow-sm rounded-2xl overflow-hidden bg-white">
        <CardHeader className="border-b border-zinc-150 bg-zinc-50/10 pb-4">
          <CardTitle className="text-sm font-bold text-zinc-800 flex items-center gap-2">
            <ShieldCheck className="h-4.5 w-4.5 text-blue-600" />
            <span>تنظیمات احراز هویت کاربران</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            
            <div className="space-y-1">
              <span className="font-bold text-sm text-zinc-800 block">ورود با رمز یکبار مصرف پیامکی (OTP)</span>
              <span className="text-xs text-zinc-400 block max-w-lg leading-relaxed">
                با فعال بودن این گزینه، کاربران می‌توانند به جای نام کاربری و رمز عبور، با وارد کردن شماره همراه و کد تایید دریافتی پیامکی وارد حساب خود شوند. در صورت غیرفعال‌سازی، تب OTP در صفحه لاگین سایت مخفی خواهد شد.
              </span>
            </div>

            <form action={handleToggle} className="flex-shrink-0">
              <Button
                type="submit"
                variant={isOtpEnabled ? "default" : "outline"}
                className={`rounded-xl px-5 h-11 flex items-center gap-2 font-bold text-xs shadow-sm transition-all duration-300 ${
                  isOtpEnabled 
                    ? "bg-emerald-600 text-white hover:bg-emerald-700" 
                    : "border-zinc-200 text-zinc-500"
                }`}
              >
                {isOtpEnabled ? (
                  <>
                    <ToggleRight className="h-5 w-5" />
                    <span>فعال (روشن)</span>
                  </>
                ) : (
                  <>
                    <ToggleLeft className="h-5 w-5" />
                    <span>غیرفعال (خاموش)</span>
                  </>
                )}
              </Button>
            </form>

          </div>
        </CardContent>
      </Card>
      
    </div>
  );
}