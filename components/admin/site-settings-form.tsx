"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import { toast } from "sonner";
import { updateSiteConfig } from "@/app/admin/settings/actions";
import type { SiteConfig } from "@/theme/config";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Store,
  Phone,
  MapPin,
  FileText,
  Upload,
  Check,
  Loader2,
} from "lucide-react";

export function SiteSettingsForm({
  initialConfig,
}: {
  initialConfig: SiteConfig;
}) {
  const [isPending, startTransition] = useTransition();
  const [logoPreview, setLogoPreview] = useState(initialConfig.logo);
  const [logoPath, setLogoPath] = useState(initialConfig.logo);

  function handleLogoFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setLogoPreview(URL.createObjectURL(file));
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const result = await updateSiteConfig(formData);
      if (result.success) {
        if (result.logo) {
          setLogoPath(result.logo);
          setLogoPreview(result.logo);
        }
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* ۱. هویت برند، لوگو و سئو */}
      <Card className="border-zinc-100 shadow-sm rounded-2xl overflow-hidden bg-white">
        <CardHeader className="border-b border-zinc-100 bg-zinc-50/20 pb-4">
          <CardTitle className="text-sm font-bold text-zinc-800 flex items-center gap-2">
            <Store className="h-4.5 w-4.5 text-blue-600" />
            <span>هویت فروشگاه، لوگو و سئو</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-zinc-600 mb-2">
                نام فروشگاه
              </label>
              <input
                name="name"
                required
                defaultValue={initialConfig.name}
                placeholder="مثال: فروشگاه آتا مد"
                className="w-full px-4 py-2.5 border border-zinc-200 rounded-xl bg-zinc-50/30 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-xs font-semibold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-600 mb-2">
                عنوان سئو (Title)
              </label>
              <input
                name="title"
                required
                defaultValue={initialConfig.title}
                placeholder="مثال: فروشگاه | خرید مطمئن و سریع"
                className="w-full px-4 py-2.5 border border-zinc-200 rounded-xl bg-zinc-50/30 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-xs font-semibold"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-600 mb-2">
              توضیحات فروشگاه (Meta Description و فوتر)
            </label>
            <textarea
              name="description"
              rows={3}
              defaultValue={initialConfig.description}
              className="w-full px-4 py-2.5 border border-zinc-200 rounded-xl bg-zinc-50/30 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-xs leading-relaxed resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-600 mb-2">
              کلمات کلیدی سئو (با کاما جدا کنید)
            </label>
            <input
              name="keywords"
              defaultValue={initialConfig.keywords.join("، ")}
              placeholder="فروشگاه آنلاین، خرید اینترنتی، تخفیف ویژه"
              className="w-full px-4 py-2.5 border border-zinc-200 rounded-xl bg-zinc-50/30 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-xs font-medium"
            />
          </div>

          {/* بخش لوگو */}
          <div className="pt-2 border-t border-zinc-100 grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
            <div className="flex items-center gap-4">
              <div className="relative w-28 h-14 rounded-xl border border-zinc-200 bg-zinc-50 flex items-center justify-center overflow-hidden p-2">
                {logoPreview ? (
                  <Image
                    src={logoPreview}
                    alt="لوگوی فروشگاه"
                    fill
                    unoptimized={logoPreview.startsWith("blob:")}
                    className="object-contain p-1.5"
                  />
                ) : (
                  <span className="text-[10px] text-zinc-400">بدون لوگو</span>
                )}
              </div>
              <label className="cursor-pointer inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-zinc-200 bg-white hover:bg-zinc-50 text-xs font-bold text-zinc-700 transition">
                <Upload className="h-3.5 w-3.5 text-blue-600" />
                <span>آپلود لوگوی جدید</span>
                <input
                  type="file"
                  name="logoFile"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={handleLogoFileChange}
                  className="hidden"
                />
              </label>
            </div>

            <div className="md:col-span-2">
              <label className="block text-[10px] font-bold text-zinc-400 mb-1.5">
                مسیر فایل لوگو (در صورت آپلود فایل جدید خودکار جایگزین می‌شود)
              </label>
              <input
                name="logo"
                dir="ltr"
                value={logoPath}
                onChange={(e) => {
                  setLogoPath(e.target.value);
                  setLogoPreview(e.target.value);
                }}
                className="w-full px-4 py-2.5 border border-zinc-200 rounded-xl bg-zinc-50/30 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-xs font-mono"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ۲. اطلاعات تماس و شبکه‌های اجتماعی */}
      <Card className="border-zinc-100 shadow-sm rounded-2xl overflow-hidden bg-white">
        <CardHeader className="border-b border-zinc-100 bg-zinc-50/20 pb-4">
          <CardTitle className="text-sm font-bold text-zinc-800 flex items-center gap-2">
            <Phone className="h-4.5 w-4.5 text-blue-600" />
            <span>اطلاعات تماس و شبکه‌های اجتماعی</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-zinc-600 mb-2">
                تلفن تماس (انگلیسی برای لینک و سئو)
              </label>
              <input
                name="phone"
                dir="ltr"
                defaultValue={initialConfig.phone}
                placeholder="02188888888"
                className="w-full px-4 py-2.5 border border-zinc-200 rounded-xl bg-zinc-50/30 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-xs font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-600 mb-2">
                تلفن نمایشی (فارسی)
              </label>
              <input
                name="phoneDisplay"
                dir="ltr"
                defaultValue={initialConfig.phoneDisplay}
                placeholder="۰۲۱-۸۸۸۸۸۸۸۸"
                className="w-full px-4 py-2.5 border border-zinc-200 rounded-xl bg-zinc-50/30 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-xs font-semibold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-600 mb-2">
                ایمیل پشتیبانی
              </label>
              <input
                name="email"
                type="email"
                dir="ltr"
                defaultValue={initialConfig.email}
                placeholder="info@example.com"
                className="w-full px-4 py-2.5 border border-zinc-200 rounded-xl bg-zinc-50/30 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-xs font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-zinc-600 mb-2">
                لینک وب‌سایت / اینستاگرام
              </label>
              <input
                name="socialWebsite"
                dir="ltr"
                defaultValue={initialConfig.socials.website}
                placeholder="https://..."
                className="w-full px-4 py-2.5 border border-zinc-200 rounded-xl bg-zinc-50/30 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-xs font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-600 mb-2">
                لینک تلگرام / پیام‌رسان
              </label>
              <input
                name="socialTelegram"
                dir="ltr"
                defaultValue={initialConfig.socials.telegram}
                placeholder="https://t.me/..."
                className="w-full px-4 py-2.5 border border-zinc-200 rounded-xl bg-zinc-50/30 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-xs font-mono"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ۳. آدرس و موقعیت روی نقشه */}
      <Card className="border-zinc-100 shadow-sm rounded-2xl overflow-hidden bg-white">
        <CardHeader className="border-b border-zinc-100 bg-zinc-50/20 pb-4">
          <CardTitle className="text-sm font-bold text-zinc-800 flex items-center gap-2">
            <MapPin className="h-4.5 w-4.5 text-blue-600" />
            <span>آدرس فروشگاه و موقعیت نقشه</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-zinc-600 mb-2">
                شهر
              </label>
              <input
                name="addressCity"
                defaultValue={initialConfig.address.city}
                className="w-full px-4 py-2.5 border border-zinc-200 rounded-xl bg-zinc-50/30 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-xs font-semibold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-600 mb-2">
                خیابان
              </label>
              <input
                name="addressStreet"
                defaultValue={initialConfig.address.street}
                className="w-full px-4 py-2.5 border border-zinc-200 rounded-xl bg-zinc-50/30 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-xs font-semibold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-600 mb-2">
                کد کشور (سئو)
              </label>
              <input
                name="addressCountry"
                dir="ltr"
                defaultValue={initialConfig.address.country}
                className="w-full px-4 py-2.5 border border-zinc-200 rounded-xl bg-zinc-50/30 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-xs font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-zinc-600 mb-2">
                آدرس کوتاه
              </label>
              <input
                name="addressShort"
                defaultValue={initialConfig.address.short}
                className="w-full px-4 py-2.5 border border-zinc-200 rounded-xl bg-zinc-50/30 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-xs font-semibold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-600 mb-2">
                آدرس کامل (نمایش در فوتر و تماس با ما)
              </label>
              <input
                name="addressFull"
                defaultValue={initialConfig.address.full}
                className="w-full px-4 py-2.5 border border-zinc-200 rounded-xl bg-zinc-50/30 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-xs font-semibold"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-600 mb-2">
              یادداشت مراجعه حضوری (زیر نقشه تماس با ما)
            </label>
            <textarea
              name="addressNote"
              rows={2}
              defaultValue={initialConfig.address.note}
              className="w-full px-4 py-2.5 border border-zinc-200 rounded-xl bg-zinc-50/30 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-xs leading-relaxed resize-none"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-zinc-600 mb-2">
                عرض جغرافیایی نقشه (Latitude)
              </label>
              <input
                name="mapLat"
                type="number"
                step="any"
                dir="ltr"
                defaultValue={initialConfig.map.lat}
                className="w-full px-4 py-2.5 border border-zinc-200 rounded-xl bg-zinc-50/30 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-xs font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-600 mb-2">
                طول جغرافیایی نقشه (Longitude)
              </label>
              <input
                name="mapLng"
                type="number"
                step="any"
                dir="ltr"
                defaultValue={initialConfig.map.lng}
                className="w-full px-4 py-2.5 border border-zinc-200 rounded-xl bg-zinc-50/30 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-xs font-mono"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ۴. فوتر */}
      <Card className="border-zinc-100 shadow-sm rounded-2xl overflow-hidden bg-white">
        <CardHeader className="border-b border-zinc-100 bg-zinc-50/20 pb-4">
          <CardTitle className="text-sm font-bold text-zinc-800 flex items-center gap-2">
            <FileText className="h-4.5 w-4.5 text-blue-600" />
            <span>متن کپی‌رایت فوتر</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <input
            name="copyright"
            defaultValue={initialConfig.copyright}
            className="w-full px-4 py-2.5 border border-zinc-200 rounded-xl bg-zinc-50/30 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-xs font-medium"
          />
        </CardContent>
      </Card>

      <div className="flex justify-end pt-2">
        <Button
          type="submit"
          disabled={isPending}
          className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs h-11 px-8 shadow-sm flex items-center gap-2"
        >
          {isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>در حال ذخیره تنظیمات...</span>
            </>
          ) : (
            <>
              <Check className="h-4 w-4" />
              <span>ذخیره تنظیمات فروشگاه</span>
            </>
          )}
        </Button>
      </div>
    </form>
  );
}