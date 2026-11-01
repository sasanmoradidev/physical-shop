// components/admin/user-form.tsx
"use client";

import { useTransition } from "react";
import { createUser, updateUser } from "@/app/admin/users/actions";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";

type PlainUser = {
  id: string;
  name: string;
  username: string;
  phone: string;
  role: "USER" | "ADMIN" | "SUPPORT" | "CONTENT_MANAGER";
};

type Props = {
  user?: PlainUser;
};

export default function UserForm({ user }: Props) {
  const [isPending, startTransition] = useTransition();
  const isEditMode = !!user;

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formElement = event.currentTarget;
    const formData = new FormData(formElement);

    startTransition(async () => {
      try {
        if (isEditMode && user) {
          await updateUser(user.id, formData);
        } else {
          await createUser(formData);
        }
      } catch (error: any) {
        if (
          error?.digest?.includes("NEXT_REDIRECT") ||
          error?.message?.includes("NEXT_REDIRECT")
        ) {
          throw error;
        }

        console.error(error);
        alert(error?.message || "خطایی رخ داد. لطفاً دوباره تلاش کنید.");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 animate-fade-in">
      {/* سطر نام، نام کاربری و موبایل */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div>
          <label className="block text-[10px] font-bold text-zinc-400 mb-2 mr-1">نام و نام خانوادگی</label>
          <input
            name="name"
            required
            defaultValue={user?.name}
            placeholder="مثال: علی محمدی"
            className="w-full px-4 py-3 border border-zinc-200 rounded-xl bg-zinc-50/30 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition text-xs font-semibold"
          />
        </div>

        <div>
          <label className="block text-[10px] font-bold text-zinc-400 mb-2 mr-1">نام کاربری</label>
          <input
            name="username"
            required
            dir="ltr"
            defaultValue={user?.username}
            placeholder="ali_mohammadi"
            className="w-full px-4 py-3 border border-zinc-200 rounded-xl bg-zinc-50/30 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition text-xs font-semibold"
          />
        </div>

        <div>
          <label className="block text-[10px] font-bold text-zinc-400 mb-2 mr-1">شماره موبایل</label>
          <input
            name="phone"
            type="tel"
            required
            dir="ltr"
            defaultValue={user?.phone}
            placeholder="09123456789"
            className="w-full px-4 py-3 border border-zinc-200 rounded-xl bg-zinc-50/30 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition text-xs font-semibold"
          />
        </div>
      </div>

      {/* سطر کلمه عبور و انتخاب نقش */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label className="block text-[10px] font-bold text-zinc-400 mb-2 mr-1">
            {isEditMode ? "کلمه عبور جدید (اختیاری)" : "کلمه عبور"}
          </label>
          <input
            name="password"
            type="password"
            dir="ltr"
            required={!isEditMode}
            placeholder={isEditMode ? "در صورت عدم تغییر خالی بگذارید" : "حداقل ۶ کاراکتر"}
            className="w-full px-4 py-3 border border-zinc-200 rounded-xl bg-zinc-50/30 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition text-xs font-semibold"
          />
        </div>

        <div>
          <label className="block text-[10px] font-bold text-zinc-400 mb-2 mr-1">تعیین نقش کاربری</label>
          <select
            name="role"
            required
            defaultValue={user?.role || "USER"}
            className="w-full border rounded-xl px-4 py-3 bg-zinc-50/30 text-xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition cursor-pointer"
          >
            <option value="USER">کاربر عادی (خریدار)</option>
            <option value="SUPPORT">پشتیبان فروشگاه (مدیریت سفارشات)</option>
            <option value="CONTENT_MANAGER">مدیر محتوا (مدیریت محصولات و ارسال)</option>
            <option value="ADMIN">مدیر کل سایت (دسترسی تام)</option>
          </select>
        </div>
      </div>

      <div className="flex items-center justify-end gap-3 pt-6 border-t border-zinc-100">
        <Button
          type="submit"
          disabled={isPending}
          className="px-6 h-10 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm transition flex items-center gap-1.5"
        >
          {isPending ? (
            <span>در حال ثبت...</span>
          ) : (
            <>
              <Check className="h-4 w-4" />
              <span>{isEditMode ? "ذخیره تغییرات" : "ایجاد کاربر جدید"}</span>
            </>
          )}
        </Button>
      </div>
    </form>
  );
}