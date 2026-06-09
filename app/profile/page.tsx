import { redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/current-user";
import Link from "next/link";

export default async function ProfilePage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">
        پروفایل
      </h1>

      <div className="border p-4 rounded">
        <p>نام: {user.name}</p>
        <p>ایمیل: {user.email}</p>
        <p>نقش: {user.role}</p>
      </div>
      <Link href="/profile/addresses">
        مدیریت آدرس‌ها
      </Link>
      <Link href="/profile/orders">
        سفارش ها
      </Link>
    </div>
  );
}