"use client";

export function OrderStatus({
  orderId,
  status,
}: {
  orderId: string;
  status: string;
}) {
  async function updateStatus(
    value: string
  ) {
    await fetch(
      `/api/admin/orders/${orderId}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type":
            "application/json",
        },
        body: JSON.stringify({
          status: value,
        }),
      }
    );

    location.reload();
  }

  return (
    <select
      value={status}
      onChange={(e) =>
        updateStatus(
          e.target.value
        )
      }
      className="border p-2"
    >
      <option value="PENDING">
        PENDING
      </option>

      <option value="PAID">
        PAID
      </option>

      <option value="PROCESSING">
        PROCESSING
      </option>

      <option value="SHIPPED">
        SHIPPED
      </option>

      <option value="DELIVERED">
        DELIVERED
      </option>

      <option value="CANCELLED">
        CANCELLED
      </option>
    </select>
  );
}