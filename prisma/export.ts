import { PrismaClient } from "@prisma/client";
import * as fs from "fs/promises";
import * as path from "path";

const prisma = new PrismaClient();

async function main() {
  console.log("⏳ Reading data from local database...");

  const users = await prisma.user.findMany();
  const categories = await prisma.category.findMany();
  const shippingMethods = await prisma.shippingMethod.findMany();
  const paymentMethods = await prisma.paymentMethod.findMany();
  const products = await prisma.product.findMany();
  const productImages = await prisma.productImage.findMany();
  const addresses = await prisma.address.findMany();
  const orders = await prisma.order.findMany();
  const orderItems = await prisma.orderItem.findMany();

  const backupData = {
    users,
    categories,
    shippingMethods,
    paymentMethods,
    products,
    productImages,
    addresses,
    orders,
    orderItems,
  };

  const filePath = path.join(process.cwd(), "prisma", "local-backup.json");
  await fs.writeFile(filePath, JSON.stringify(backupData, null, 2), "utf-8");

  console.log(`✅ Data exported successfully to: ${filePath}`);
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });