import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const mobile = await prisma.category.create({
    data: {
      name: "موبایل",
      slug: "mobile",
    },
  });

  const laptop = await prisma.category.create({
    data: {
      name: "لپ تاپ",
      slug: "laptop",
    },
  });

  await prisma.product.create({
    data: {
      title: "iPhone 15 Pro",
      slug: "iphone-15-pro",
      description: "Apple iPhone 15 Pro",
      price: 999,
      stock: 10,
      categoryId: mobile.id,
    },
  });

  await prisma.product.create({
    data: {
      title: "MacBook Air M3",
      slug: "macbook-air-m3",
      description: "Apple MacBook Air M3",
      price: 1499,
      stock: 5,
      categoryId: laptop.id,
    },
  });
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });