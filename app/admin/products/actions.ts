"use server";

import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export async function createProduct(
  formData: FormData
) {
  const title = formData.get("title") as string;
  const slug = formData.get("slug") as string;
  const description =
    formData.get("description") as string;

  const price = Number(
    formData.get("price")
  );

  const stock = Number(
    formData.get("stock")
  );

  const categoryId =
    formData.get("categoryId") as string;

  await prisma.product.create({
    data: {
      title,
      slug,
      description,
      price,
      stock,
      categoryId,
    },
  });

  redirect("/admin/products");
}

export async function updateProduct(
  id: string,
  formData: FormData
) {
  await prisma.product.update({
    where: {
      id,
    },
    data: {
      title: formData.get("title") as string,
      slug: formData.get("slug") as string,
      description: formData.get("description") as string,
      price: Number(formData.get("price")),
      stock: Number(formData.get("stock")),
    },
  });

  redirect("/admin/products");
}

export async function deleteProduct(id: string) {
  await prisma.product.delete({
    where: {
      id,
    },
  });

  redirect("/admin/products");
}