import { redirect } from "next/navigation";
import { ClearCart } from "@/components/cart/clear-cart";
import Link from "next/link";

// ایمپورت کامپوننت‌های شکیل پروژه (Shadcn UI)
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

// ایمپورت آیکون‌های استاندارد Lucide
import { CheckCircle2, XCircle, ShoppingBag, ArrowLeft } from "lucide-react";

type Props = {
  searchParams: Promise<{
    Authority?: string;
    Status?: string;
  }>;
};

export default async function PaymentCallbackPage({
  searchParams,
}: Props) {
  console.log("CALLBACK PARAMS:", await searchParams);
  const { Authority, Status } = await searchParams;

  if (!Authority) {
    redirect("/");
  }

  // ارسال اطلاعات تراکنش به بک‌اند برای وریفای نهایی
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_APP_URL}/api/payment/verify`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        Authority,
        Status,
      }),
      cache: "no-store",
    }
  );

  const data = await response.json();
  console.log("VERIFY RESULT:", data);

  // بررسی وضعیت نهایی وریفای تراکنش [2]
  const isSuccess = response.ok && data.ok === true;

  return (
    <div className="container mx-auto px-4 py-20 max-w-lg animate-fade-in">
      {isSuccess ? (
        /* ۱. نمای تراکنش موفقیت‌آمیز */
        <Card className="border-zinc-100 shadow-md rounded-3xl overflow-hidden bg-white text-center">
          <CardContent className="p-8 sm:p-10 flex flex-col items-center justify-center space-y-6">
            
            {/* کامپوننت پاک‌کننده سبد خرید کاربری */}
            <ClearCart />

            <div className="h-20 w-20 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center text-3xl shadow-inner">
              <CheckCircle2 className="h-10 w-10 animate-bounce" />
            </div>

            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-zinc-950">پرداخت با موفقیت انجام شد</h1>
              <p className="text-xs text-zinc-400 leading-relaxed">
                تراکنش شما با موفقیت تایید شد و سفارش شما ثبت گردید. به زودی فرآیند آماده‌سازی و ارسال مرسوله آغاز خواهد شد.
              </p>
            </div>

            {/* نمایش شناسه درگاه به عنوان کد رهگیری تراکنش */}
            <div className="w-full bg-zinc-50 border border-zinc-100/80 p-4 rounded-2xl flex items-center justify-between text-xs">
              <span className="text-zinc-400">شناسه تراکنش (Authority):</span>
              <span className="font-mono font-bold text-zinc-800 tracking-tight select-all">
                {Authority.slice(-10).toUpperCase()}
              </span>
            </div>

            <div className="w-full flex flex-col sm:flex-row gap-3 pt-4 border-t border-zinc-100">
              <Button asChild className="flex-1 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs h-11 flex items-center justify-center gap-2">
                <Link href="/profile/orders">
                  <ShoppingBag className="h-4 w-4" />
                  <span>مشاهده سفارش‌های من</span>
                </Link>
              </Button>

              <Button variant="outline" asChild className="flex-1 rounded-xl border-zinc-200 text-zinc-700 font-semibold text-xs h-11 flex items-center justify-center gap-2">
                <Link href="/">
                  <span>بازگشت به سایت</span>
                  <ArrowLeft className="h-4 w-4" />
                </Link>
              </Button>
            </div>

          </CardContent>
        </Card>
      ) : (
        /* ۲. نمای تراکنش ناموفق یا لغوشده */
        <Card className="border-zinc-100 shadow-md rounded-3xl overflow-hidden bg-white text-center">
          <CardContent className="p-8 sm:p-10 flex flex-col items-center justify-center space-y-6">
            
            <div className="h-20 w-20 rounded-full bg-red-50 border border-red-100 text-red-600 flex items-center justify-center text-3xl shadow-inner animate-pulse">
              <XCircle className="h-10 w-10" />
            </div>

            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-red-600">پرداخت ناموفق بود!</h1>
              <p className="text-xs text-zinc-400 leading-relaxed">
                تراکنش توسط شما لغو شده یا خطایی در ارتباط با درگاه پرداخت رخ داده است. هیچ مبلغی از حساب شما کسر نشده است.
              </p>
            </div>

            <div className="w-full flex flex-col sm:flex-row gap-3 pt-4 border-t border-zinc-100">
              <Button asChild className="flex-1 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white font-semibold text-xs h-11 flex items-center justify-center">
                <Link href="/profile/orders">
                  <span>پیگیری در سفارش‌های من</span>
                </Link>
              </Button>

              <Button variant="outline" asChild className="flex-1 rounded-xl border-zinc-200 text-zinc-700 font-semibold text-xs h-11 flex items-center justify-center gap-2">
                <Link href="/cart">
                  <span>بازگشت به سبد خرید</span>
                  <ArrowLeft className="h-4 w-4" />
                </Link>
              </Button>
            </div>

          </CardContent>
        </Card>
      )}
    </div>
  );
}