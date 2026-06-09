"use server";

import { redirect } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/current-user";

export async function createAddress(
  formData: FormData
) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  await prisma.address.create({
    data: {
      title:
        formData.get("title") as string,

      fullName:
        formData.get(
          "fullName"
        ) as string,

      phone:
        formData.get(
          "phone"
        ) as string,

      province:
        formData.get(
          "province"
        ) as string,

      city:
        formData.get(
          "city"
        ) as string,

      postalCode:
        formData.get(
          "postalCode"
        ) as string,

      addressLine:
        formData.get(
          "addressLine"
        ) as string,

      userId: user.id,
    },
  });

  redirect(
    "/profile/addresses"
  );
}