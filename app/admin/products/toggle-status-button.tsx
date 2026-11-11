"use client";

import { useTransition } from "react";
import { toggleProductStatus } from "./actions"; // مسیر اکشن را در صورت نیاز اصلاح کنید
import { toast } from "sonner";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ToggleStatusButton({ id, isActive }: { id: string; isActive: boolean }) {
  const [isPending, startTransition] = useTransition();

  const handleToggle = () => {
    startTransition(async () => {
      // وضعیت جدید برعکس وضعیت فعلی خواهد بود
      const result = await toggleProductStatus(id, !isActive);

      if (result) {
        if (result.success) {
          toast.success(result.message, {
            style: {
              background: "#dcfce7", // bg-green-100
              color: "#166534",      // text-green-800
              border: "1px solid #bbf7d0", // border-green-200
            }
          });
        } else {
          toast.error(result.message);
        }
      }
    });
  };

  return (
    <Button
      onClick={handleToggle}
      disabled={isPending}
      variant="outline"
      title={isActive ? "غیرفعال کردن محصول" : "فعال کردن محصول"}
      className={`rounded-xl h-9 w-9 flex flex-shrink-0 items-center justify-center p-0 shadow-sm transition-all ${isActive ? "hover:bg-amber-50" : "hover:bg-green-50"
        }`}
    >
      {isPending ? (
        <Loader2 className="h-4 w-4 animate-spin text-zinc-400" />
      ) : isActive ? (
        <Eye className="h-4 w-4 text-zinc-500 hover:text-amber-600" />
      ) : (
        <EyeOff className="h-4 w-4 text-zinc-300 hover:text-green-600" />
      )}
    </Button>
  );
}