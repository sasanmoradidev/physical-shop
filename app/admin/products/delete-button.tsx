"use client";

import { useTransition } from "react";
import { deleteProduct } from "./actions";
import { toast } from "sonner";
import { Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function DeleteProductButton({ id }: { id: string }) {
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    if (!window.confirm("آیا از حذف این محصول مطمئن هستید؟")) return;

    startTransition(async () => {
      const result = await deleteProduct(id);

      if (result && !result.success) {
        toast.error(result.message, {
          style: {
            background: "#fee2e2",
            color: "#991b1b",
            border: "1px solid #f87171",
          },
        });
      }
    });
  };

  return (
    <Button
      onClick={handleDelete}
      disabled={isPending}
      variant="destructive"
      className="flex-shrink-0 rounded-xl h-9 w-9 flex items-center justify-center p-0 shadow-sm"
      title="حذف محصول"
    >
      {isPending ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Trash2 className="h-4 w-4" />
      )}
    </Button>
  );
}