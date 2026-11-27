export function OrderBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    PENDING: "bg-yellow-100 text-yellow-800",
    AWAITING_VERIFICATION: "bg-indigo-100 text-indigo-800",
    PAID: "bg-green-100 text-green-800",
    PROCESSING: "bg-blue-100 text-blue-800",
    SHIPPED: "bg-purple-100 text-purple-800",
    DELIVERED: "bg-emerald-100 text-emerald-800",
    CANCELLED: "bg-red-100 text-red-800",
  };

  const labels: Record<string, string> = {
    PENDING: "در انتظار پرداخت",
    AWAITING_VERIFICATION: "در انتظار تایید رسید",
    PAID: "پرداخت شده",
    PROCESSING: "در حال پردازش",
    SHIPPED: "ارسال شده",
    DELIVERED: "تحویل شده",
    CANCELLED: "لغو شده",
  };

  return (
    <span
      className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${
        styles[status] || "bg-zinc-100 text-zinc-700"
      }`}
    >
      {labels[status] || status}
    </span>
  );
}