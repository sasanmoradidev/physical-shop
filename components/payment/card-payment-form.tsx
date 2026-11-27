"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TomanIcon } from "@/components/ui/toman-icon";
import {
  Copy,
  Check,
  CreditCard,
  Upload,
  CheckCircle2,
  ArrowLeft,
  ShoppingBag,
  FileImage,
  X,
  Clock,
} from "lucide-react";

type Props = {
  order: {
    id: string;
    totalPrice: number;
    status: string;
    receiptImage: string | null;
    receiptTrackingCode: string | null;
    receiptNote: string | null;
  };
  cardInfo: {
    name: string;
    cardNumber: string | null;
    cardHolder: string | null;
    bankName: string | null;
    description: string | null;
  } | null;
};

function formatCardNumber(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  if (digits.length === 16) {
    return digits.replace(/(\d{4})(?=\d)/g, "$1 - ");
  }
  return raw;
}

export function CardPaymentForm({ order, cardInfo }: Props) {
  const [copied, setCopied] = useState(false);
  const [trackingCode, setTrackingCode] = useState(order.receiptTrackingCode || "");
  const [note, setNote] = useState(order.receiptNote || "");
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(order.receiptImage);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const rawCardDigits = (cardInfo?.cardNumber || "").replace(/\D/g, "");

  async function handleCopyCard() {
    const textToCopy = rawCardDigits || cardInfo?.cardNumber || "";
    if (!textToCopy) return;
    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      toast.success("شماره کارت کپی شد.");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("امکان کپی خودکار وجود نداشت؛ لطفاً دستی کپی کنید.");
    }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files?.[0];
    if (!selected) return;

    if (!["image/jpeg", "image/png", "image/webp"].includes(selected.type)) {
      toast.error("فقط فرمت‌های JPG، PNG و WebP مجاز هستند.");
      return;
    }
    if (selected.size > 5 * 1024 * 1024) {
      toast.error("حجم تصویر نباید بیشتر از ۵ مگابایت باشد.");
      return;
    }

    setFile(selected);
    setPreviewUrl(URL.createObjectURL(selected));
  }

  function handleRemoveFile() {
    setFile(null);
    setPreviewUrl(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const hasFile = Boolean(file || order.receiptImage);
    const hasTracking = trackingCode.trim().length >= 4;

    if (!hasFile && !hasTracking) {
      toast.warning(
        "لطفاً تصویر رسید را آپلود کنید یا شماره پیگیری بانکی (حداقل ۴ رقم) را وارد نمایید."
      );
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("orderId", order.id);
      formData.append("trackingCode", trackingCode.trim());
      formData.append("note", note.trim());
      if (file) {
        formData.append("receiptFile", file);
      }

      const res = await fetch("/api/payment/card", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "خطا در ثبت اطلاعات پرداخت.");
        return;
      }

      toast.success("اطلاعات پرداخت با موفقیت ثبت شد!");
      setSubmitted(true);
    } catch {
      toast.error("خطا در ارتباط با سرور. لطفاً دوباره تلاش کنید.");
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <Card className="border-zinc-100 shadow-md rounded-3xl overflow-hidden bg-white text-center max-w-lg mx-auto animate-fade-in">
        <CardContent className="p-8 sm:p-10 flex flex-col items-center space-y-6">
          <div className="h-20 w-20 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center shadow-inner">
            <CheckCircle2 className="h-10 w-10" />
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-zinc-950">رسید پرداخت ثبت شد</h1>
            <p className="text-xs text-zinc-500 leading-relaxed">
              اطلاعات واریز شما با موفقیت دریافت شد و در صف بررسی کارشناسان قرار گرفت. پس از تایید، وضعیت سفارش شما به «پرداخت شده» تغییر خواهد کرد.
            </p>
          </div>

          <div className="w-full bg-zinc-50 border border-zinc-100 p-4 rounded-2xl flex items-center justify-between text-xs">
            <span className="text-zinc-400">کد سفارش:</span>
            <span className="font-mono font-bold text-zinc-800 uppercase">
              {order.id.slice(-8)}
            </span>
          </div>

          <div className="w-full flex flex-col sm:flex-row gap-3 pt-4 border-t border-zinc-100">
            <Button
              asChild
              className="flex-1 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs h-11"
            >
              <Link href={`/profile/orders/${order.id}`} className="flex items-center justify-center gap-2">
                <ShoppingBag className="h-4 w-4" />
                <span>مشاهده جزئیات سفارش</span>
              </Link>
            </Button>

            <Button
              variant="outline"
              asChild
              className="flex-1 rounded-xl border-zinc-200 text-zinc-700 font-semibold text-xs h-11"
            >
              <Link href="/" className="flex items-center justify-center gap-2">
                <span>بازگشت به فروشگاه</span>
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      {/* سربرگ درگاه کارت به کارت */}
      <div className="text-center space-y-2">
        <div className="mx-auto w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center border border-blue-100 shadow-sm">
          <CreditCard className="h-7 w-7" />
        </div>
        <h1 className="text-2xl font-extrabold text-zinc-900">پرداخت کارت به کارت</h1>
        <p className="text-xs text-zinc-500">
          مبلغ سفارش را به کارت زیر واریز کرده و تصویر رسید یا کد پیگیری را ثبت نمایید.
        </p>
      </div>

      {order.status === "AWAITING_VERIFICATION" && (
        <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-800 text-xs flex items-start gap-2.5">
          <Clock className="h-4 w-4 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            شما قبلاً رسید این سفارش را ارسال کرده‌اید و در حال بررسی است. در صورت نیاز می‌توانید اطلاعات یا تصویر رسید را در فرم زیر اصلاح و مجدداً ارسال کنید.
          </p>
        </div>
      )}

      {/* باکس مبلغ و شماره کارت مقصد */}
      <Card className="border-zinc-100 shadow-sm rounded-3xl overflow-hidden bg-white">
        <CardContent className="p-6 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-5 border-b border-zinc-100">
            <div>
              <span className="text-[11px] text-zinc-400 block">مبلغ قابل پرداخت</span>
              <div className="flex items-center gap-1.5 mt-1">
                <span className="text-2xl font-black text-zinc-950">
                  {order.totalPrice.toLocaleString("fa-IR")}
                </span>
                <TomanIcon className="h-5 w-5 text-zinc-700" />
              </div>
              <span className="text-[10px] text-zinc-400 block mt-0.5">
                معادل {(order.totalPrice * 10).toLocaleString("fa-IR")} ریال
              </span>
            </div>

            <div className="text-right sm:text-left bg-zinc-50 border border-zinc-100 px-4 py-2.5 rounded-xl">
              <span className="text-[10px] text-zinc-400 block">شماره سفارش</span>
              <span className="font-mono text-xs font-extrabold text-zinc-800 uppercase">
                #{order.id.slice(-8)}
              </span>
            </div>
          </div>

          {/* نمای کارت بانکی مقصد */}
          {cardInfo?.cardNumber ? (
            <div className="rounded-2xl bg-gradient-to-l from-slate-900 to-slate-800 text-white p-5 sm:p-6 space-y-5 shadow-md">
              <div className="flex items-center justify-between text-xs text-slate-300">
                <span className="font-bold">{cardInfo.bankName || "کارت بانکی مقصد"}</span>
                <CreditCard className="h-5 w-5 text-slate-400" />
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <span
                  dir="ltr"
                  className="font-mono text-lg sm:text-xl font-extrabold tracking-widest text-white select-all text-center sm:text-left"
                >
                  {formatCardNumber(cardInfo.cardNumber)}
                </span>

                <button
                  type="button"
                  onClick={handleCopyCard}
                  className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition border border-white/15 shrink-0"
                >
                  {copied ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-emerald-400" />
                      <span>کپی شد</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" />
                      <span>کپی شماره کارت</span>
                    </>
                  )}
                </button>
              </div>

              {cardInfo.cardHolder && (
                <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs">
                  <span className="text-slate-400">به نام:</span>
                  <span className="font-bold text-white">{cardInfo.cardHolder}</span>
                </div>
              )}
            </div>
          ) : (
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-100 text-amber-800 text-xs leading-relaxed">
              {cardInfo?.description ||
                "شماره کارت مقصد هنوز در تنظیمات روش پرداخت ثبت نشده است. لطفاً با پشتیبانی تماس بگیرید."}
            </div>
          )}

          {cardInfo?.cardNumber && cardInfo.description && (
            <p className="text-[11px] text-zinc-500 leading-relaxed bg-zinc-50 p-3.5 rounded-xl border border-zinc-100">
              {cardInfo.description}
            </p>
          )}
        </CardContent>
      </Card>

      {/* فرم ارسال رسید (آپلود عکس و/یا ورود دستی اطلاعات) */}
      <Card className="border-zinc-100 shadow-sm rounded-3xl overflow-hidden bg-white">
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1">
              <h2 className="text-base font-bold text-zinc-900">ثبت اطلاعات واریز</h2>
              <p className="text-[11px] text-zinc-400">
                آپلود تصویر رسید بانکی <strong>یا</strong> وارد کردن شماره پیگیری (حداقل یکی از این دو) الزامی است.
              </p>
            </div>

            {/* ۱. آپلود عکس رسید */}
            <div>
              <label className="block text-xs font-bold text-zinc-700 mb-2">
                تصویر رسید کارت به کارت (اسکرین‌شات یا عکس فیش)
              </label>

              {previewUrl ? (
                <div className="relative rounded-2xl border border-zinc-200 bg-zinc-50 p-3 flex flex-col items-center gap-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={previewUrl}
                    alt="پیش‌نمایش رسید پرداخت"
                    className="max-h-64 rounded-xl object-contain"
                  />
                  <div className="flex items-center gap-2">
                    <label className="cursor-pointer px-3.5 py-2 rounded-xl bg-white border border-zinc-200 hover:bg-zinc-50 text-xs font-bold text-zinc-700 inline-flex items-center gap-1.5">
                      <Upload className="h-3.5 w-3.5 text-blue-600" />
                      <span>تغییر تصویر</span>
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                    </label>
                    <button
                      type="button"
                      onClick={handleRemoveFile}
                      className="px-3.5 py-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 text-xs font-bold inline-flex items-center gap-1"
                    >
                      <X className="h-3.5 w-3.5" />
                      <span>حذف</span>
                    </button>
                  </div>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center gap-2.5 border-2 border-dashed border-zinc-200 hover:border-blue-400 hover:bg-blue-50/20 rounded-2xl p-8 cursor-pointer transition text-center">
                  <div className="p-3 rounded-2xl bg-zinc-100 text-zinc-500">
                    <FileImage className="h-6 w-6" />
                  </div>
                  <div className="space-y-1">
                    <span className="text-xs font-bold text-zinc-700 block">
                      برای انتخاب تصویر رسید کلیک کنید
                    </span>
                    <span className="text-[10px] text-zinc-400 block">
                      فرمت‌های مجاز: JPG، PNG، WebP (حداکثر ۵ مگابایت)
                    </span>
                  </div>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
              )}
            </div>

            {/* ۲. ورود دستی کد پیگیری */}
            <div>
              <label className="block text-xs font-bold text-zinc-700 mb-2">
                شماره پیگیری / شماره ارجاع بانکی
              </label>
              <input
                type="text"
                dir="ltr"
                value={trackingCode}
                onChange={(e) => setTrackingCode(e.target.value)}
                placeholder="مثال: 9845123456"
                className="w-full px-4 py-3 border border-zinc-200 rounded-xl bg-zinc-50/30 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition text-sm font-mono font-bold"
              />
            </div>

            {/* ۳. توضیحات تکمیلی اختیاری */}
            <div>
              <label className="block text-xs font-bold text-zinc-700 mb-2">
                توضیحات تکمیلی (اختیاری - مثلاً ۴ رقم آخر کارت مبدا یا ساعت واریز)
              </label>
              <textarea
                rows={2}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="مثال: واریز از کارت به شماره پایان 4821 در ساعت 14:30"
                className="w-full px-4 py-3 border border-zinc-200 rounded-xl bg-zinc-50/30 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition text-xs leading-relaxed resize-none"
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Button
                type="submit"
                disabled={submitting}
                className="flex-1 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs h-12 shadow-sm"
              >
                {submitting ? "در حال ثبت اطلاعات پرداخت..." : "ثبت نهایی رسید و ارسال برای تایید"}
              </Button>

              <Button
                type="button"
                variant="outline"
                asChild
                className="sm:w-40 rounded-xl border-zinc-200 text-zinc-600 font-semibold text-xs h-12"
              >
                <Link href={`/profile/orders/${order.id}`}>انصراف و پیگیری بعداً</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}