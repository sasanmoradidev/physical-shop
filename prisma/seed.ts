import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const admin = await prisma.user.findFirst({
    where: {
      role: "ADMIN",
    },
  });

  if (!admin) {
    console.log("Admin not found");
    return;
  }

  const address = await prisma.address.findFirst({
    where: {
      userId: admin.id,
    },
  });

  if (!address) {
    console.log("Address not found");
    return;
  }

  const products = await prisma.product.findMany();

  if (products.length < 2) {
    console.log("At least 2 products required");
    return;
  }

  for (let i = 0; i < 20; i++) {
    const product1 =
      products[Math.floor(Math.random() * products.length)];

    const product2 =
      products[Math.floor(Math.random() * products.length)];

    const totalPrice =
      Number(product1.price) +
      Number(product2.price);

    await prisma.order.create({
      data: {
        userId: admin.id,
        addressId: address.id,
        totalPrice,
        status: "PENDING",

        items: {
          create: [
            {
              productId: product1.id,
              quantity: 1,
              price: product1.price,
            },
            {
              productId: product2.id,
              quantity: 1,
              price: product2.price,
            },
          ],
        },
      },
    });
  }

  console.log("20 orders created");
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });