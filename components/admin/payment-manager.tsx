"use client";

import { useState, useTransition } from "react";
import {
  createPaymentMethod,
  updatePaymentMethod,
  togglePaymentMethod,
  deletePaymentMethod,
} from "@/app/admin/payments/actions";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2, Edit, Check, X, ShieldAlert, ShieldCheck } from "lucide-react";

type PaymentMethod = {
  id: string;
  name: string;
  code: string;
  description: string | null;
  isActive: boolean;
  merchantId?: string | null;
};

type Props = {
  initialMethods: PaymentMethod[];
};

export function PaymentManager({ initialMethods }: Props) {
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);
  const isEditMode = !!selectedMethod;

  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [description, setDescription] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [merchantId, setMerchantId] = useState("");

  const [isPending, startTransition] = useTransition();

  const handleStartEdit = (method: PaymentMethod) => {
    setSelectedMethod(method);
    setName(method.name);
    setCode(method.code);
    setDescription(method.description || "");
    setIsActive(method.isActive);
    setMerchantId(method.merchantId || "");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCancelEdit = () => {
    setSelectedMethod(null);
    setName("");
    setCode("");
    setDescription("");
    setIsActive(true);
    setMerchantId("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !code.trim() || !description.trim()) {
      toast.warning("لطفاً تمامی فیلدها را با مقادیر معتبر پر کنید.");
      return;
    }

    if (code.trim().toUpperCase() === "ONLINE" && !merchantId.trim()) {
      toast.warning("برای روش پرداخت آنلاین، وارد کردن شناسه پذیرنده (Merchant ID) الزامی است.");
      return;
    }

    startTransition(async () => {
      try {
        const result =
          isEditMode && selectedMethod
            ? await updatePaymentMethod(
                selectedMethod.id,
                name,
                code,
                description,
                isActive,
                code.trim().toUpperCase() === "ONLINE" ? merchantId : undefined
              )
            : await createPaymentMethod(
                name,
                code,
                description,
                isActive,
                code.trim().toUpperCase() === "ONLINE" ? merchantId : undefined
              );

        if (result.success) {
          toast.success(result.message);
          handleCancelEdit();
        } else {
          toast.error(result.message || "خطایی رخ داد.");
        }
      } catch {
        toast.error("خطایی رخ داد. لطفاً دوباره تلاش کنید.");
      }
    });
  };

  const handleToggle = (method: PaymentMethod) => {
    startTransition(async () => {
      const result = await togglePaymentMethod(method.id, method.isActive);
      if (result.success) toast.success(result.message);
      else toast.error(result.message || "خطا در تغییر وضعیت.");
    });
  };

  const handleDelete = (method: PaymentMethod) => {
    if (!window.confirm(`آیا از حذف روش پرداخت «${method.name}» مطمئن هستید؟`)) return;

    startTransition(async () => {
      const result = await deletePaymentMethod(method.id);
      if (result.success) {
        toast.success(result.message);
        if (selectedMethod?.id === method.id) handleCancelEdit();
      } else {
        toast.error(result.message || "خطا در حذف روش پرداخت.");
      }
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start animate-fade-in">
      <Card className="border-zinc-100 shadow-sm rounded-2xl bg-white">
        <CardHeader className="border-b border-zinc-50 bg-zinc-50/20 pb-4">
          <CardTitle className="text-sm font-extrabold text-zinc-800">
            {isEditMode ? "ویرایش روش پرداخت" : "افزودن روش پرداخت جدید"}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold text-zinc-400 mb-2">نام روش پرداخت</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="مثال: پرداخت آنلاین، کارت به کارت"
                className="w-full px-4 py-3 border border-zinc-200 rounded-xl bg-zinc-50/30 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition text-xs font-semibold"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-zinc-400 mb-2">کد کلیدی سیستم (انگلیسی بدون فاصله)</label>
              <input
                value={code}
                onChange={(e) => setCode(e.target.value)}
                required
                placeholder="مثال: ONLINE یا COD یا CARD"
                className="w-full px-4 py-3 border border-zinc-200 rounded-xl bg-zinc-50/30 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition text-xs font-mono font-bold"
              />
            </div>

            {code.trim().toUpperCase() === "ONLINE" && (
              <div className="animate-fade-in">
                <label className="block text-[10px] font-bold text-red-500 mb-2">
                  شناسه پذیرنده درگاه (Merchant ID)
                </label>
                <input
                  value={merchantId}
                  onChange={(e) => setMerchantId(e.target.value)}
                  required
                  placeholder="00000000-0000-0000-0000-000000000000"
                  className="w-full px-4 py-3 border border-red-200 rounded-xl bg-red-50/10 focus:bg-white focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none transition text-xs font-mono font-bold text-red-600 placeholder:text-red-300"
                />
              </div>
            )}

            <div>
              <label className="block text-[10px] font-bold text-zinc-400 mb-2">توضیحات راهنما برای خریدار</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                rows={3}
                placeholder="توضیحاتی که خریدار در زمان انتخاب این روش مشاهده می‌کند..."
                className="w-full px-4 py-3 border border-zinc-200 rounded-xl bg-zinc-50/30 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition text-xs font-medium resize-none leading-relaxed"
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
              <label htmlFor="isActive" className="text-xs font-bold text-zinc-600 cursor-pointer">
                فعال باشد
              </label>
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
                    <span>{isEditMode ? "ذخیره تغییرات" : "ثبت روش پرداخت"}</span>
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

      <div className="lg:col-span-2 space-y-4">
        {initialMethods.length === 0 ? (
          <Card className="border-dashed border-zinc-200 p-12 text-center bg-zinc-50/20">
            <CardContent className="py-4 text-xs text-zinc-400">
              هیچ روش پرداختی هنوز تعریف نشده است.
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
                        <span className="font-mono text-[9px] font-bold bg-zinc-100 px-1.5 py-0.5 rounded border border-zinc-200 text-zinc-500">
                          {method.code}
                        </span>
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-[9px] font-bold ${
                            isMethodActive
                              ? "bg-green-50 text-green-700 border border-green-100"
                              : "bg-red-50 text-red-700 border border-red-100"
                          }`}
                        >
                          {isMethodActive ? "فعال" : "غیرفعال"}
                        </span>
                      </div>

                      <p className="text-[10px] text-zinc-400 leading-relaxed font-semibold">
                        توضیحات: {method.description || "ثبت‌نشده"}
                      </p>
                      {method.merchantId && (
                        <p className="text-[9px] text-zinc-400 font-mono tracking-wide">
                          مرچنت فعال: {method.merchantId}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-2 border-t sm:border-t-0 pt-3 sm:pt-0 border-zinc-50 flex-shrink-0">
                      <Button
                        type="button"
                        disabled={isPending}
                        onClick={() => handleToggle(method)}
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

                      <Button
                        type="button"
                        onClick={() => handleStartEdit(method)}
                        variant="outline"
                        className="rounded-xl h-9 text-xs font-semibold border-zinc-200 text-zinc-700 hover:bg-zinc-50 flex items-center gap-1.5 px-4"
                      >
                        <Edit className="h-3.5 w-3.5 text-zinc-500" />
                        <span>ویرایش</span>
                      </Button>

                      <Button
                        type="button"
                        disabled={isPending}
                        onClick={() => handleDelete(method)}
                        variant="destructive"
                        className="rounded-xl h-9 w-9 flex items-center justify-center p-0"
                        title="حذف روش پرداخت"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
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