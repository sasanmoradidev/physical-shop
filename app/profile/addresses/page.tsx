import { redirect } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/current-user";

import Link from "next/link";
export default async function AddressesPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const addresses = await prisma.address.findMany({
    where: {
      userId: user.id,
    },
  });

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">
        آدرس‌های من
      </h1>

      {addresses.map((address) => (
        <div
          key={address.id}
          className="border rounded p-4 mb-4"
        >
          <p>{address.title}</p>

          <p>{address.fullName}</p>

          <p>{address.phone}</p>

          <p>
            {address.province} -
            {" "}
            {address.city}
          </p>

          <p>{address.addressLine}</p>
        </div>
      ))}
      {/* مدیریت CRUD آدرس‌ها */}
    <Link href="/profile/addresses/new">افزودن آدرس</Link>     
    </div>
  );
}