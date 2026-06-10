import { redirect } from "next/navigation";
import { ClearCart } from "@/components/cart/clear-cart";

type Props = {
  searchParams: {
    Authority?: string;
    Status?: string;
  };
};

export default async function PaymentCallbackPage({
  searchParams,
}: Props) {
   console.log("CALLBACK PARAMS:", await searchParams);
  const { Authority, Status } = await searchParams;

  if (!Authority) {
    redirect("/");
  }

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_APP_URL}/api/payment/verify`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        Authority,
        Status,
      }),
      cache: "no-store",
    }
  );

  const data = await response.json();
  console.log("VERIFY RESULT:", data);

  if (!response.ok) {
    redirect("/payment/failed");
  }

  return (
    <div className="container mx-auto py-10">
      <ClearCart />

      <h1 className="text-3xl font-bold text-green-600">
        پرداخت با موفقیت انجام شد
      </h1>

      <p className="mt-4">
        سفارش شما ثبت شد
      </p>
    </div>
  );
}