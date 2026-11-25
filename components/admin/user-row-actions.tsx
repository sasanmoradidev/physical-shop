"use client";

import { useTransition } from "react";
import { toggleUserRole, deleteUser } from "@/app/admin/users/actions";
import { Button } from "@/components/ui/button";
import { ShieldAlert, ShieldCheck, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";

type Props = {
  userId: string;
  userName: string;
  isUserAdmin: boolean;
  isSelf: boolean;
};

export function UserRowActions({ userId, userName, isUserAdmin, isSelf }: Props) {
  const [isPending, startTransition] = useTransition();

  const handleToggleRole = () => {
    const actionLabel = isUserAdmin ? "عزل از مدیریت" : "ارتقا به مدیر سایت";
    if (!window.confirm(`آیا از ${actionLabel} برای «${userName}» مطمئن هستید؟`)) return;

    startTransition(async () => {
      const result = await toggleUserRole(userId);
      if (result.success) toast.success(result.message);
      else toast.error(result.message || "خطا در تغییر نقش.");
    });
  };

  const handleDelete = () => {
    if (!window.confirm(`آیا از حذف کامل کاربر «${userName}» مطمئن هستید؟`)) return;

    startTransition(async () => {
      const result = await deleteUser(userId);
      if (result.success) toast.success(result.message);
      else toast.error(result.message || "خطا در حذف کاربر.");
    });
  };

  return (
    <>
      <Button
        type="button"
        onClick={handleToggleRole}
        variant="outline"
        size="sm"
        disabled={isSelf || isPending}
        className="rounded-xl h-9 text-xs font-semibold border-zinc-200"
      >
        {isUserAdmin ? (
          <span className="flex items-center gap-1.5 text-red-600">
            <ShieldAlert className="h-3.5 w-3.5" />
            <span>عزل ادمین</span>
          </span>
        ) : (
          <span className="flex items-center gap-1.5 text-emerald-600">
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>ارتقا به ادمین</span>
          </span>
        )}
      </Button>

      <Button
        type="button"
        onClick={handleDelete}
        variant="destructive"
        disabled={isSelf || isPending}
        className="rounded-xl h-9 w-9 flex items-center justify-center p-0"
        aria-label="حذف کاربر"
      >
        {isPending ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Trash2 className="h-4 w-4" />
        )}
      </Button>
    </>
  );
}