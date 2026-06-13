export function OrderBadge({
  status,
}: {
  status: string;
}) {
  const styles = {
    PENDING:
      "bg-yellow-100 text-yellow-800",

    PAID:
      "bg-green-100 text-green-800",

    PROCESSING:
      "bg-blue-100 text-blue-800",

    SHIPPED:
      "bg-purple-100 text-purple-800",

    DELIVERED:
      "bg-emerald-100 text-emerald-800",

    CANCELLED:
      "bg-red-100 text-red-800",
  };

  const labels = {
    PENDING: "در انتظار پرداخت",
    PAID: "پرداخت شده",
    PROCESSING: "در حال پردازش",
    SHIPPED: "ارسال شده",
    DELIVERED: "تحویل شده",
    CANCELLED: "لغو شده",
  };

  return (
    <span
      className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${
        styles[
          status as keyof typeof styles
        ]
      }`}
    >
      {
        labels[
          status as keyof typeof labels
        ]
      }
    </span>
  );
}