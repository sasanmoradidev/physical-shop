"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { saveHomeConfig } from "@/app/admin/homepage/actions";
import type { HomeConfig, BannerItem } from "@/theme/home/config";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Plus,
  Trash2,
  Upload,
  Check,
  Loader2,
  ArrowUp,
  ArrowDown,
  Images,
  LayoutGrid,
  Sparkles,
  RectangleHorizontal,
  X,
} from "lucide-react";

type TabId = "hero" | "fourcol" | "offer" | "light";

async function uploadImage(file: File): Promise<string | null> {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch("/api/admin/homepage/upload", {
    method: "POST",
    body: formData,
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data.url) {
    toast.error(data.error || "خطا در آپلود تصویر.");
    return null;
  }

  toast.success("تصویر با موفقیت آپلود شد.");
  return data.url as string;
}

export function HomepageManager({
  initialConfig,
}: {
  initialConfig: HomeConfig;
}) {
  const [config, setConfig] = useState<HomeConfig>(initialConfig);
  const [activeTab, setActiveTab] = useState<TabId>("hero");
  const [uploadingKey, setUploadingKey] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  async function handleUpload(
    key: string,
    file: File | undefined,
    onSuccess: (url: string) => void
  ) {
    if (!file) return;
    setUploadingKey(key);
    try {
      const url = await uploadImage(file);
      if (url) onSuccess(url);
    } finally {
      setUploadingKey(null);
    }
  }

  function moveSlide(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= config.heroSlides.length) return;
    const next = [...config.heroSlides];
    [next[index], next[target]] = [next[target], next[index]];
    setConfig({ ...config, heroSlides: next });
  }

  function updateFourColItem(
    which: "firstFourCol" | "secondFourCol",
    index: number,
    patch: Partial<BannerItem>
  ) {
    const list = [...config[which]];
    list[index] = { ...list[index], ...patch };
    setConfig({ ...config, [which]: list });
  }

  function handleSave() {
    startTransition(async () => {
      const result = await saveHomeConfig(config);
      if (result.success) toast.success(result.message);
      else toast.error(result.message);
    });
  }

  const tabs: { id: TabId; label: string; icon: typeof Images }[] = [
    { id: "hero", label: "اسلایدر اصلی", icon: Images },
    { id: "fourcol", label: "بنرهای ۴ ستونه", icon: LayoutGrid },
    { id: "offer", label: "بخش تخفیف‌ها", icon: Sparkles },
    { id: "light", label: "بنر پایین و بخش‌ها", icon: RectangleHorizontal },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* تب‌ها و دکمه ذخیره بالا */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-wrap gap-2 bg-zinc-100/80 p-1.5 rounded-2xl w-fit">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition ${
                  isActive
                    ? "bg-white text-blue-600 shadow-sm"
                    : "text-zinc-500 hover:text-zinc-800"
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        <Button
          type="button"
          onClick={handleSave}
          disabled={isPending}
          className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs h-11 px-6 shadow-sm flex items-center gap-2 w-fit"
        >
          {isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>در حال ذخیره...</span>
            </>
          ) : (
            <>
              <Check className="h-4 w-4" />
              <span>ذخیره تغییرات صفحه اصلی</span>
            </>
          )}
        </Button>
      </div>

      {/* تب ۱: اسلایدر اصلی (دسکتاپ 1920x860 + موبایل 800x1000) */}
      {activeTab === "hero" && (
        <Card className="border-zinc-100 shadow-sm rounded-2xl bg-white">
          <CardHeader className="border-b border-zinc-100 bg-zinc-50/20 pb-4 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-bold text-zinc-800">
              اسلایدهای بالای صفحه اصلی ({config.heroSlides.length.toLocaleString("fa-IR")} اسلاید)
            </CardTitle>
            <Button
              type="button"
              size="sm"
              onClick={() =>
                setConfig({
                  ...config,
                  heroSlides: [
                    ...config.heroSlides,
                    {
                      id: crypto.randomUUID(),
                      image: "",
                      mobileImage: "",
                      title: `اسلاید ${config.heroSlides.length + 1}`,
                      link: "",
                    },
                  ],
                })
              }
              className="rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-100 text-xs font-bold h-9 px-3.5"
            >
              <Plus className="h-4 w-4 ml-1" />
              <span>افزودن اسلاید جدید</span>
            </Button>
          </CardHeader>
          <CardContent className="p-6 space-y-5">
            {config.heroSlides.length === 0 ? (
              <div className="border border-dashed border-zinc-200 rounded-2xl p-10 text-center text-xs text-zinc-400">
                هیچ اسلایدی وجود ندارد. روی «افزودن اسلاید جدید» کلیک کنید.
              </div>
            ) : (
              config.heroSlides.map((slide, index) => {
                const desktopKey = `hero-desktop-${slide.id}`;
                const mobileKey = `hero-mobile-${slide.id}`;
                const isUploadingDesktop = uploadingKey === desktopKey;
                const isUploadingMobile = uploadingKey === mobileKey;

                return (
                  <div
                    key={slide.id}
                    className="p-4 sm:p-5 rounded-2xl border border-zinc-200 bg-zinc-50/40 space-y-4"
                  >
                    {/* ردیف تصاویر: دسکتاپ + موبایل */}
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                      {/* تصویر دسکتاپ 1920x860 */}
                      <div className="md:col-span-8 space-y-2">
                        <span className="text-[11px] font-bold text-zinc-600 block">
                          تصویر دسکتاپ (ابعاد پیشنهادی: 1920×860)
                        </span>
                        <div className="relative w-full aspect-[1920/860] rounded-xl border border-zinc-200 bg-white overflow-hidden flex items-center justify-center">
                          {slide.image ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={slide.image}
                              alt={slide.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="text-xs text-zinc-400">بدون تصویر دسکتاپ</span>
                          )}
                        </div>

                        <label className="cursor-pointer w-full inline-flex items-center justify-center gap-2 py-2 px-3 rounded-xl border border-zinc-200 bg-white hover:bg-zinc-50 text-xs font-bold text-zinc-700 transition">
                          {isUploadingDesktop ? (
                            <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                          ) : (
                            <Upload className="h-4 w-4 text-blue-600" />
                          )}
                          <span>
                            {isUploadingDesktop ? "در حال آپلود..." : "آپلود تصویر دسکتاپ"}
                          </span>
                          <input
                            type="file"
                            accept="image/jpeg,image/png,image/webp,image/avif"
                            disabled={isUploadingDesktop}
                            onChange={(e) =>
                              handleUpload(desktopKey, e.target.files?.[0], (url) => {
                                const next = [...config.heroSlides];
                                next[index] = { ...next[index], image: url };
                                setConfig({ ...config, heroSlides: next });
                              })
                            }
                            className="hidden"
                          />
                        </label>
                      </div>

                      {/* تصویر موبایل 800x1000 */}
                      <div className="md:col-span-4 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-bold text-zinc-600">
                            تصویر موبایل (800×1000)
                          </span>
                          {slide.mobileImage && (
                            <button
                              type="button"
                              onClick={() => {
                                const next = [...config.heroSlides];
                                next[index] = { ...next[index], mobileImage: "" };
                                setConfig({ ...config, heroSlides: next });
                              }}
                              className="text-[10px] text-red-500 hover:text-red-700 font-bold inline-flex items-center gap-0.5"
                            >
                              <X className="h-3 w-3" />
                              <span>حذف</span>
                            </button>
                          )}
                        </div>

                        <div className="relative w-full max-w-[180px] mx-auto aspect-[800/1000] rounded-xl border border-zinc-200 bg-white overflow-hidden flex items-center justify-center">
                          {slide.mobileImage ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={slide.mobileImage}
                              alt={`${slide.title} - موبایل`}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="text-[10px] text-zinc-400 text-center px-2">
                              اختیاری (در نبود آن عکس دسکتاپ نمایش داده می‌شود)
                            </span>
                          )}
                        </div>

                        <label className="cursor-pointer w-full inline-flex items-center justify-center gap-2 py-2 px-3 rounded-xl border border-zinc-200 bg-white hover:bg-zinc-50 text-xs font-bold text-zinc-700 transition">
                          {isUploadingMobile ? (
                            <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                          ) : (
                            <Upload className="h-4 w-4 text-blue-600" />
                          )}
                          <span>
                            {isUploadingMobile ? "در حال آپلود..." : "آپلود تصویر موبایل"}
                          </span>
                          <input
                            type="file"
                            accept="image/jpeg,image/png,image/webp,image/avif"
                            disabled={isUploadingMobile}
                            onChange={(e) =>
                              handleUpload(mobileKey, e.target.files?.[0], (url) => {
                                const next = [...config.heroSlides];
                                next[index] = { ...next[index], mobileImage: url };
                                setConfig({ ...config, heroSlides: next });
                              })
                            }
                            className="hidden"
                          />
                        </label>
                      </div>
                    </div>

                    {/* فیلدهای عنوان، لینک و دکمه‌های ترتیب/حذف */}
                    <div className="space-y-3 pt-3 border-t border-zinc-200/70">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[10px] font-bold text-zinc-500 mb-1">
                            عنوان اسلاید (Alt سئو)
                          </label>
                          <input
                            value={slide.title}
                            onChange={(e) => {
                              const next = [...config.heroSlides];
                              next[index] = { ...next[index], title: e.target.value };
                              setConfig({ ...config, heroSlides: next });
                            }}
                            placeholder="مثلاً: کالکشن جدید"
                            className="w-full px-3.5 py-2.5 border border-zinc-200 rounded-xl bg-white text-xs font-semibold outline-none focus:border-blue-500"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-zinc-500 mb-1">
                            لینک کلیک روی اسلاید (اختیاری)
                          </label>
                          <input
                            dir="ltr"
                            value={slide.link}
                            onChange={(e) => {
                              const next = [...config.heroSlides];
                              next[index] = { ...next[index], link: e.target.value };
                              setConfig({ ...config, heroSlides: next });
                            }}
                            placeholder="/products?category=..."
                            className="w-full px-3.5 py-2.5 border border-zinc-200 rounded-xl bg-white text-xs font-mono outline-none focus:border-blue-500"
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-2">
                        <div className="flex items-center gap-1.5">
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            disabled={index === 0}
                            onClick={() => moveSlide(index, -1)}
                            className="h-8 w-8 rounded-lg"
                            title="انتقال به بالا"
                          >
                            <ArrowUp className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            disabled={index === config.heroSlides.length - 1}
                            onClick={() => moveSlide(index, 1)}
                            className="h-8 w-8 rounded-lg"
                            title="انتقال به پایین"
                          >
                            <ArrowDown className="h-3.5 w-3.5" />
                          </Button>
                          <span className="text-[10px] text-zinc-400 mr-2">
                            اسلاید {(index + 1).toLocaleString("fa-IR")}
                          </span>
                        </div>

                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          onClick={() => {
                            const next = config.heroSlides.filter((_, i) => i !== index);
                            setConfig({ ...config, heroSlides: next });
                          }}
                          className="h-8 rounded-lg text-xs px-3 flex items-center gap-1"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          <span>حذف اسلاید</span>
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>
      )}

      {/* تب ۲: بنرهای ۴ ستونه (ردیف اول و ردیف دوم) */}
      {activeTab === "fourcol" && (
        <div className="space-y-6">
          {(
            [
              {
                title: "ردیف اول بنرهای ۴ ستونه (زیر اسلایدر اصلی)",
                listKey: "firstFourCol" as const,
                toggleKey: "showFirstFourCol" as const,
              },
              {
                title: "ردیف دوم بنرهای ۴ ستونه (زیر بخش تخفیف‌ها)",
                listKey: "secondFourCol" as const,
                toggleKey: "showSecondFourCol" as const,
              },
            ] as const
          ).map((section) => (
            <Card
              key={section.listKey}
              className="border-zinc-100 shadow-sm rounded-2xl bg-white"
            >
              <CardHeader className="border-b border-zinc-100 bg-zinc-50/20 pb-4 flex flex-row items-center justify-between">
                <CardTitle className="text-sm font-bold text-zinc-800">
                  {section.title}
                </CardTitle>
                <label className="flex items-center gap-2 text-xs font-bold text-zinc-600 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config[section.toggleKey]}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        [section.toggleKey]: e.target.checked,
                      })
                    }
                    className="w-4 h-4 rounded text-blue-600"
                  />
                  <span>نمایش این ردیف</span>
                </label>
              </CardHeader>
              <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                {config[section.listKey].map((item, idx) => {
                  const key = `${section.listKey}-${item.id}`;
                  const isUploading = uploadingKey === key;

                  return (
                    <div
                      key={item.id}
                      className="p-4 rounded-2xl border border-zinc-200 bg-zinc-50/40 space-y-3"
                    >
                      <div className="relative w-full h-28 rounded-xl border border-zinc-200 bg-white overflow-hidden flex items-center justify-center">
                        {item.image ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={item.image}
                            alt={item.alt}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-xs text-zinc-400">بدون تصویر</span>
                        )}
                      </div>

                      <label className="cursor-pointer w-full inline-flex items-center justify-center gap-2 py-2 px-3 rounded-xl border border-zinc-200 bg-white hover:bg-zinc-50 text-xs font-bold text-zinc-700 transition">
                        {isUploading ? (
                          <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                        ) : (
                          <Upload className="h-4 w-4 text-blue-600" />
                        )}
                        <span>{isUploading ? "در حال آپلود..." : `آپلود تصویر بنر ${idx + 1}`}</span>
                        <input
                          type="file"
                          accept="image/jpeg,image/png,image/webp,image/avif"
                          disabled={isUploading}
                          onChange={(e) =>
                            handleUpload(key, e.target.files?.[0], (url) =>
                              updateFourColItem(section.listKey, idx, { image: url })
                            )
                          }
                          className="hidden"
                        />
                      </label>

                      <div className="grid grid-cols-2 gap-2">
                        <input
                          value={item.alt}
                          onChange={(e) =>
                            updateFourColItem(section.listKey, idx, { alt: e.target.value })
                          }
                          placeholder="عنوان (Alt)"
                          className="px-3 py-2 border border-zinc-200 rounded-xl bg-white text-xs outline-none focus:border-blue-500"
                        />
                        <input
                          dir="ltr"
                          value={item.link}
                          onChange={(e) =>
                            updateFourColItem(section.listKey, idx, { link: e.target.value })
                          }
                          placeholder="/products"
                          className="px-3 py-2 border border-zinc-200 rounded-xl bg-white text-xs font-mono outline-none focus:border-blue-500"
                        />
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* تب ۳: بخش جشنواره و تخفیف‌ها */}
      {activeTab === "offer" && (
        <Card className="border-zinc-100 shadow-sm rounded-2xl bg-white">
          <CardHeader className="border-b border-zinc-100 bg-zinc-50/20 pb-4 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-bold text-zinc-800">
              تنظیمات بنر بخش تخفیف‌های ویژه
            </CardTitle>
            <label className="flex items-center gap-2 text-xs font-bold text-zinc-600 cursor-pointer">
              <input
                type="checkbox"
                checked={config.offerSection.enabled}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    offerSection: { ...config.offerSection, enabled: e.target.checked },
                  })
                }
                className="w-4 h-4 rounded text-blue-600"
              />
              <span>نمایش بخش تخفیف‌ها</span>
            </label>
          </CardHeader>
          <CardContent className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            <div className="lg:col-span-5 space-y-3">
              <div className="relative w-full h-56 rounded-2xl border border-zinc-200 bg-zinc-50 overflow-hidden flex items-center justify-center">
                {config.offerSection.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={config.offerSection.image}
                    alt="بنر جشنواره"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-xs text-zinc-400">بدون تصویر</span>
                )}
              </div>

              <label className="cursor-pointer w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-zinc-200 bg-white hover:bg-zinc-50 text-xs font-bold text-zinc-700 transition">
                {uploadingKey === "offer-banner" ? (
                  <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                ) : (
                  <Upload className="h-4 w-4 text-blue-600" />
                )}
                <span>
                  {uploadingKey === "offer-banner"
                    ? "در حال آپلود..."
                    : "آپلود تصویر بنر جشنواره"}
                </span>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/avif"
                  disabled={uploadingKey === "offer-banner"}
                  onChange={(e) =>
                    handleUpload("offer-banner", e.target.files?.[0], (url) =>
                      setConfig({
                        ...config,
                        offerSection: { ...config.offerSection, image: url },
                      })
                    )
                  }
                  className="hidden"
                />
              </label>
            </div>

            <div className="lg:col-span-7 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-600 mb-1.5">
                    متن برچسب قرمز
                  </label>
                  <input
                    value={config.offerSection.badge}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        offerSection: { ...config.offerSection, badge: e.target.value },
                      })
                    }
                    className="w-full px-3.5 py-2.5 border border-zinc-200 rounded-xl text-xs font-semibold outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-600 mb-1.5">
                    عنوان جشنواره
                  </label>
                  <input
                    value={config.offerSection.title}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        offerSection: { ...config.offerSection, title: e.target.value },
                      })
                    }
                    className="w-full px-3.5 py-2.5 border border-zinc-200 rounded-xl text-xs font-semibold outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-600 mb-1.5">
                  توضیح کوتاه زیر عنوان
                </label>
                <input
                  value={config.offerSection.subtitle}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      offerSection: { ...config.offerSection, subtitle: e.target.value },
                    })
                  }
                  className="w-full px-3.5 py-2.5 border border-zinc-200 rounded-xl text-xs outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-600 mb-1.5">
                    متن دکمه
                  </label>
                  <input
                    value={config.offerSection.buttonText}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        offerSection: {
                          ...config.offerSection,
                          buttonText: e.target.value,
                        },
                      })
                    }
                    className="w-full px-3.5 py-2.5 border border-zinc-200 rounded-xl text-xs font-semibold outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-600 mb-1.5">
                    لینک دکمه
                  </label>
                  <input
                    dir="ltr"
                    value={config.offerSection.buttonLink}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        offerSection: {
                          ...config.offerSection,
                          buttonLink: e.target.value,
                        },
                      })
                    }
                    className="w-full px-3.5 py-2.5 border border-zinc-200 rounded-xl text-xs font-mono outline-none focus:border-blue-500"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* تب ۴: بنر تمام‌عرض پایین و تنظیم نمایش جدیدترین‌ها */}
      {activeTab === "light" && (
        <div className="space-y-6">
          <Card className="border-zinc-100 shadow-sm rounded-2xl bg-white">
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <span className="text-sm font-bold text-zinc-800 block">
                  نمایش بخش «جدیدترین محصولات»
                </span>
                <span className="text-xs text-zinc-400">
                  اسلایدر ۱۰ محصول جدید اضافه شده در صفحه اصلی
                </span>
              </div>
              <input
                type="checkbox"
                checked={config.showNewProducts}
                onChange={(e) =>
                  setConfig({ ...config, showNewProducts: e.target.checked })
                }
                className="w-5 h-5 rounded text-blue-600 cursor-pointer"
              />
            </CardContent>
          </Card>

          <Card className="border-zinc-100 shadow-sm rounded-2xl bg-white">
            <CardHeader className="border-b border-zinc-100 bg-zinc-50/20 pb-4 flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-bold text-zinc-800">
                بنر تمام‌عرض پایین صفحه (دسکتاپ و موبایل)
              </CardTitle>
              <label className="flex items-center gap-2 text-xs font-bold text-zinc-600 cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.lightBanner.enabled}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      lightBanner: {
                        ...config.lightBanner,
                        enabled: e.target.checked,
                      },
                    })
                  }
                  className="w-4 h-4 rounded text-blue-600"
                />
                <span>نمایش این بنر</span>
              </label>
            </CardHeader>
            <CardContent className="p-6 space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* دسکتاپ */}
                <div className="space-y-2.5">
                  <span className="text-xs font-bold text-zinc-700 block">تصویر دسکتاپ (عریض)</span>
                  <div className="relative w-full h-32 rounded-xl border border-zinc-200 bg-zinc-50 overflow-hidden flex items-center justify-center">
                    {config.lightBanner.desktopImage ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={config.lightBanner.desktopImage}
                        alt="بنر دسکتاپ"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-xs text-zinc-400">بدون تصویر</span>
                    )}
                  </div>
                  <label className="cursor-pointer w-full inline-flex items-center justify-center gap-2 py-2 px-3 rounded-xl border border-zinc-200 bg-white hover:bg-zinc-50 text-xs font-bold text-zinc-700 transition">
                    {uploadingKey === "light-desktop" ? (
                      <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                    ) : (
                      <Upload className="h-4 w-4 text-blue-600" />
                    )}
                    <span>آپلود تصویر دسکتاپ</span>
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/avif"
                      disabled={uploadingKey === "light-desktop"}
                      onChange={(e) =>
                        handleUpload("light-desktop", e.target.files?.[0], (url) =>
                          setConfig({
                            ...config,
                            lightBanner: {
                              ...config.lightBanner,
                              desktopImage: url,
                            },
                          })
                        )
                      }
                      className="hidden"
                    />
                  </label>
                </div>

                {/* موبایل */}
                <div className="space-y-2.5">
                  <span className="text-xs font-bold text-zinc-700 block">تصویر موبایل (اختیاری)</span>
                  <div className="relative w-full h-32 rounded-xl border border-zinc-200 bg-zinc-50 overflow-hidden flex items-center justify-center">
                    {config.lightBanner.mobileImage ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={config.lightBanner.mobileImage}
                        alt="بنر موبایل"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-xs text-zinc-400">بدون تصویر</span>
                    )}
                  </div>
                  <label className="cursor-pointer w-full inline-flex items-center justify-center gap-2 py-2 px-3 rounded-xl border border-zinc-200 bg-white hover:bg-zinc-50 text-xs font-bold text-zinc-700 transition">
                    {uploadingKey === "light-mobile" ? (
                      <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                    ) : (
                      <Upload className="h-4 w-4 text-blue-600" />
                    )}
                    <span>آپلود تصویر موبایل</span>
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/avif"
                      disabled={uploadingKey === "light-mobile"}
                      onChange={(e) =>
                        handleUpload("light-mobile", e.target.files?.[0], (url) =>
                          setConfig({
                            ...config,
                            lightBanner: {
                              ...config.lightBanner,
                              mobileImage: url,
                            },
                          })
                        )
                      }
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-zinc-100">
                <div>
                  <label className="block text-xs font-bold text-zinc-600 mb-1.5">
                    عنوان بنر (Alt)
                  </label>
                  <input
                    value={config.lightBanner.alt}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        lightBanner: { ...config.lightBanner, alt: e.target.value },
                      })
                    }
                    className="w-full px-3.5 py-2.5 border border-zinc-200 rounded-xl text-xs outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-600 mb-1.5">
                    لینک کلیک روی بنر
                  </label>
                  <input
                    dir="ltr"
                    value={config.lightBanner.link}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        lightBanner: { ...config.lightBanner, link: e.target.value },
                      })
                    }
                    className="w-full px-3.5 py-2.5 border border-zinc-200 rounded-xl text-xs font-mono outline-none focus:border-blue-500"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}