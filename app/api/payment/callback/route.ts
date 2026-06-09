"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function CallbackPage() {
  const params = useSearchParams();
  const router = useRouter();

  const Authority = params.get("Authority");
  const Status = params.get("Status");

  useEffect(() => {
    async function verify() {
      const res = await fetch("/api/payment/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          Authority,
          Status,
        }),
      });

      if (res.ok) {
        router.push("/profile/orders");
      }
    }

    verify();
  }, []);

  return <div>در حال بررسی پرداخت...</div>;
}