import { createAddress } from "../actions";
import { getCurrentUser } from "@/lib/current-user";
import { redirect } from "next/navigation";

export default async function NewAddressPage() {
  const user = await getCurrentUser;
  if (!user) {
    redirect("/login");
  }

  return (
    <form
      action={createAddress}
      className="container mx-auto py-10"
    >
      <input
        name="title"
        placeholder="خانه"
        className="border p-2 w-full mb-4"
      />

      <input
        name="fullName"
        placeholder="نام گیرنده"
        className="border p-2 w-full mb-4"
      />

      <input
        name="phone"
        placeholder="موبایل"
        className="border p-2 w-full mb-4"
      />

      <input
        name="province"
        placeholder="استان"
        className="border p-2 w-full mb-4"
      />

      <input
        name="city"
        placeholder="شهر"
        className="border p-2 w-full mb-4"
      />

      <input
        name="postalCode"
        placeholder="کد پستی"
        className="border p-2 w-full mb-4"
      />

      <textarea
        name="addressLine"
        placeholder="آدرس"
        className="border p-2 w-full mb-4"
      />

      <button
        className="border px-4 py-2"
      >
        ذخیره
      </button>
    </form>
  );
}