"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileImage, CheckCircle2, XCircle, ExternalLink } from "lucide-react";

type Props = {
  orderId: string;
  status: string;
  receiptImage: string | null;
  receiptTrackingCode: string | null;
  receiptNote: string | null;
  receiptSubmittedAt: string | null;
};

export function ReceiptReviewCard({
  orderId,
  status,
  receiptImage,
  receiptTrackingCode,
  receiptNote,
  receiptSubmittedAt,
}: Props) {
  const router = useRouter();
  const [loadingAction, setLoadingAction] = useState<"APPROVE" | "REJECT" | null>(null);

  async function updateStatus(newStatus: "PAID" | "PENDING", action: "APPROVE" | "REJECT") {
    if (
      action === "REJECT" &&
      !window.confirm("آیا از رد کردن این رسید مطمئن هستید؟ وضعیت سفارش به «در انتظار پرداخت» برمی‌گردد تا مشتری رسید جدید بفرستد.")
    ) {
      return;
    }

    setLoadingAction(action);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || "خطا در به‌روزرسانی وضعیت سفارش");
      }

      toast.success(
        action === "APPROVE"
          ? "پرداخت تایید شد و وضعیت سفارش به «پرداخت شده» تغییر یافت."
          : "رسید رد شد و سفارش به حالت «در انتظار پرداخت» بازگشت."
      );
      router.refresh();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "خطایی رخ داد.");
    } finally {
      setLoadingAction(null);
    }
  }

  return (
    <Card className="border-indigo-100 shadow-sm rounded-2xl overflow-hidden bg-white">
      <CardHeader className="border-b border-indigo-50 bg-indigo-50/40 pb-4">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-base font-bold text-indigo-950 flex items-center gap-2">
            <FileImage className="h-5 w-5 text-indigo-600" />
            <span>رسید پرداخت کارت به کارت</span>
          </CardTitle>
          {receiptImage && (
            <a
              href={receiptImage}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-bold text-indigo-600 hover:underline inline-flex items-center gap-1"
            >
              <span>بزرگ‌نمایی</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-6 space-y-4 text-xs">
        {receiptImage && (
          <a
            href={receiptImage}
            target="_blank"
            rel="noopener noreferrer"
            className="block rounded-2xl overflow-hidden border border-zinc-200 bg-zinc-50 p-2 hover:opacity-95 transition"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={receiptImage}
              alt="تصویر رسید واریز مشتری"
              className="max-h-72 w-full object-contain rounded-xl"
            />
          </a>
        )}

        <div className="space-y-2.5 bg-zinc-50 p-4 rounded-xl border border-zinc-100">
          <div className="flex items-center justify-between">
            <span className="text-zinc-400">کد پیگیری بانکی:</span>
            <span className="font-mono font-bold text-zinc-900 select-all">
              {receiptTrackingCode || "وارد نشده"}
            </span>
          </div>

          {receiptSubmittedAt && (
            <div className="flex items-center justify-between">
              <span className="text-zinc-400">زمان ثبت رسید:</span>
              <span className="font-semibold text-zinc-700">{receiptSubmittedAt}</span>
            </div>
          )}

          {receiptNote && (
            <div className="pt-2 border-t border-zinc-200/70">
              <span className="text-zinc-400 block mb-1">توضیحات مشتری:</span>
              <p className="text-zinc-700 leading-relaxed font-medium">{receiptNote}</p>
            </div>
          )}
        </div>

        {(status === "AWAITING_VERIFICATION" || status === "PENDING") && (
          <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
            <Button
              type="button"
              disabled={loadingAction !== null}
              onClick={() => updateStatus("PAID", "APPROVE")}
              className="flex-1 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs h-10 flex items-center justify-center gap-1.5"
            >
              <CheckCircle2 className="h-4 w-4" />
              <span>{loadingAction === "APPROVE" ? "در حال تایید..." : "تایید پرداخت"}</span>
            </Button>

            <Button
              type="button"
              variant="outline"
              disabled={loadingAction !== null}
              onClick={() => updateStatus("PENDING", "REJECT")}
              className="flex-1 rounded-xl border-red-200 text-red-600 hover:bg-red-50 font-bold text-xs h-10 flex items-center justify-center gap-1.5"
            >
              <XCircle className="h-4 w-4" />
              <span>{loadingAction === "REJECT" ? "در حال رد..." : "رد رسید"}</span>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}