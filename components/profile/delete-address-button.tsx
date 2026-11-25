"use client";

import { useTransition } from "react";
import { deleteAddress } from "@/app/(store)/profile/addresses/actions";
import { Button } from "@/components/ui/button";
import { Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";

export function DeleteAddressButton({
  id,
  title,
}: {
  id: string;
  title: string;
}) {
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    if (!window.confirm(`آیا از حذف آدرس «${title}» مطمئن هستید؟`)) return;

    startTransition(async () => {
      const result = await deleteAddress(id);
      if (result.success) toast.success(result.message);
      else toast.error(result.message || "خطا در حذف آدرس.");
    });
  };

  return (
    <Button
      type="button"
      onClick={handleDelete}
      disabled={isPending}
      variant="destructive"
      className="rounded-xl h-9 w-9 flex items-center justify-center p-0 shadow-sm flex-shrink-0"
      aria-label="حذف آدرس"
    >
      {isPending ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Trash2 className="h-4 w-4" />
      )}
    </Button>
  );
}