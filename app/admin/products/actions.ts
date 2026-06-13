"use server";

import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import fs from "fs/promises";
import path from "path";

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

  const images =
    formData.getAll("images") as File[];

  const imageRecords: {
    url: string;
  }[] = [];

  for (const image of images) {

    if (image.size === 0) {
      continue;
    }

    const bytes =
      await image.arrayBuffer();

    const buffer =
      Buffer.from(bytes);

    const fileName =
      `${Date.now()}-${image.name}`;

    const uploadDir = path.join(
      process.cwd(),
      "public",
      "uploads",
      "products"
    );

    await fs.writeFile(
      path.join(
        uploadDir,
        fileName
      ),
      buffer
    );

    imageRecords.push({
      url:
        `/uploads/products/${fileName}`,
    });
  }

  await prisma.product.create({
    data: {
      title,
      slug,
      description,
      price,
      stock,
      categoryId,
      images: {
        create: imageRecords ? imageRecords : undefined,
      },
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