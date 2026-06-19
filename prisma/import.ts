import { PrismaClient } from "@prisma/client";
import * as fs from "fs/promises";
import * as path from "path";

const prisma = new PrismaClient();

async function main() {
  console.log("⏳ Reading local-backup.json...");
  const filePath = path.join(process.cwd(), "prisma", "local-backup.json");
  const fileData = await fs.readFile(filePath, "utf-8");
  const backup = JSON.parse(fileData);

  console.log("⏳ Clearing remote database tables first...");
  // پاکسازی جداول از آخر به اول برای جلوگیری از تداخل کلید خارجی
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.address.deleteMany();
  await prisma.productImage.deleteMany();
  await prisma.product.deleteMany();
  await prisma.paymentMethod.deleteMany();
  await prisma.shippingMethod.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();

  console.log("⏳ Seeding Users...");
  if (backup.users.length > 0) {
    await prisma.user.createMany({ data: backup.users });
  }

  console.log("⏳ Seeding Categories (Parent categories first, then subcategories)...");
  // تفکیک دسته‌بندی‌های اصلی از زیردسته‌بندی‌ها برای ممانعت از ارور فیلد parentId
  const parents = backup.categories.filter((c: any) => !c.parentId);
  const subs = backup.categories.filter((c: any) => c.parentId);

  if (parents.length > 0) {
    await prisma.category.createMany({ data: parents });
  }
  if (subs.length > 0) {
    await prisma.category.createMany({ data: subs });
  }

  console.log("⏳ Seeding Shipping Methods...");
  if (backup.shippingMethods.length > 0) {
    await prisma.shippingMethod.createMany({ data: backup.shippingMethods });
  }

  console.log("⏳ Seeding Payment Methods...");
  if (backup.paymentMethods.length > 0) {
    await prisma.paymentMethod.createMany({ data: backup.paymentMethods });
  }

  console.log("⏳ Seeding Products...");
  if (backup.products.length > 0) {
    await prisma.product.createMany({ data: backup.products });
  }

  console.log("⏳ Seeding Product Images...");
  if (backup.productImages.length > 0) {
    await prisma.productImage.createMany({ data: backup.productImages });
  }

  console.log("⏳ Seeding Addresses...");
  if (backup.addresses.length > 0) {
    await prisma.address.createMany({ data: backup.addresses });
  }

  console.log("⏳ Seeding Orders...");
  if (backup.orders.length > 0) {
    await prisma.order.createMany({ data: backup.orders });
  }

  console.log("⏳ Seeding Order Items...");
  if (backup.orderItems.length > 0) {
    await prisma.orderItem.createMany({ data: backup.orderItems });
  }

  console.log("🎉 Complete database migration finished successfully!");
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });