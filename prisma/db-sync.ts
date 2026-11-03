
import { PrismaClient } from "@prisma/client";
import * as fs from "fs/promises";
import * as path from "path";

const prisma = new PrismaClient();

const filePath = path.join(
  process.cwd(),
  "prisma",
  "local-backup.json"
);

// تبدیل رشته‌های تاریخ JSON به Date
function restoreDates(value: any): any {
  if (Array.isArray(value)) {
    return value.map(restoreDates);
  }

  if (value && typeof value === "object") {
    const result: any = {};

    for (const [key, val] of Object.entries(value)) {
      result[key] = restoreDates(val);
    }

    return result;
  }

  return value;
}

// Export database
async function exportData() {
  console.log("⏳ Reading data from current database...");

  const backupData = {
    users: await prisma.user.findMany(),
    otpRequests: await prisma.otpRequest.findMany(),
    systemSettings: await prisma.systemSetting.findMany(),
    categories: await prisma.category.findMany(),
    products: await prisma.product.findMany(),
    productImages: await prisma.productImage.findMany(),
    shippingMethods: await prisma.shippingMethod.findMany(),
    paymentMethods: await prisma.paymentMethod.findMany(),
    addresses: await prisma.address.findMany(),
    orders: await prisma.order.findMany(),
    orderItems: await prisma.orderItem.findMany(),
  };

  await fs.mkdir(path.dirname(filePath), { recursive: true });

  await fs.writeFile(
    filePath,
    JSON.stringify(backupData, null, 2),
    "utf-8"
  );

  console.log("✅ Data exported successfully!");
  console.log(`📁 Backup location: ${filePath}`);
}

// Import database
async function importData() {
  console.log("⏳ Reading backup file...");

  try {
    const fileContent = await fs.readFile(filePath, "utf-8");
    const data = JSON.parse(fileContent);

    console.log("🔄 Importing data...");

    // بررسی ساختار فایل بکاپ
    const requiredTables = [
      "users",
      "otpRequests",
      "systemSettings",
      "categories",
      "products",
      "productImages",
      "shippingMethods",
      "paymentMethods",
      "addresses",
      "orders",
      "orderItems",
    ];

    for (const table of requiredTables) {
      if (!Array.isArray(data[table])) {
        throw new Error(`Invalid backup data: ${table} is missing or invalid.`);
      }
    }

    // تبدیل تاریخ‌ها
    const users = restoreDates(data.users);
    const otpRequests = restoreDates(data.otpRequests);
    const systemSettings = restoreDates(data.systemSettings);
    const categories = restoreDates(data.categories);
    const products = restoreDates(data.products);
    const productImages = restoreDates(data.productImages);
    const shippingMethods = restoreDates(data.shippingMethods);
    const paymentMethods = restoreDates(data.paymentMethods);
    const addresses = restoreDates(data.addresses);
    const orders = restoreDates(data.orders);
    const orderItems = restoreDates(data.orderItems);

    // ترتیب Import بر اساس وابستگی‌ها
    await prisma.$transaction(
      async (tx) => {

        // 1. Users
        if (users.length) {
          await tx.user.createMany({
            data: users,
            skipDuplicates: true,
          });
          console.log("✅ Users imported.");
        }

        // 2. OTP Requests
        if (otpRequests.length) {
          await tx.otpRequest.createMany({
            data: otpRequests,
            skipDuplicates: true,
          });
          console.log("✅ OTP Requests imported.");
        }

        // 3. System Settings
        if (systemSettings.length) {
          await tx.systemSetting.createMany({
            data: systemSettings,
            skipDuplicates: true,
          });
          console.log("✅ System Settings imported.");
        }

        // 4. Shipping Methods
        if (shippingMethods.length) {
          await tx.shippingMethod.createMany({
            data: shippingMethods,
            skipDuplicates: true,
          });
          console.log("✅ Shipping Methods imported.");
        }

        // 5. Payment Methods
        if (paymentMethods.length) {
          await tx.paymentMethod.createMany({
            data: paymentMethods,
            skipDuplicates: true,
          });
          console.log("✅ Payment Methods imported.");
        }

        // 6. Categories
        if (categories.length) {
          const pending = [...categories];

          while (pending.length > 0) {
            const ready = pending.filter(
              (category: any) =>
                !category.parentId ||
                !pending.some(
                  (parent: any) => parent.id === category.parentId
                )
            );

            if (ready.length === 0) {
              throw new Error(
                "Category hierarchy contains a circular dependency."
              );
            }

            await tx.category.createMany({
              data: ready,
              skipDuplicates: true,
            });

            const importedIds = new Set(
              ready.map((category: any) => category.id)
            );

            for (let i = pending.length - 1; i >= 0; i--) {
              if (importedIds.has(pending[i].id)) {
                pending.splice(i, 1);
              }
            }
          }

          console.log("✅ Categories imported.");
        }

        // 7. Products
        if (products.length) {
          await tx.product.createMany({
            data: products,
            skipDuplicates: true,
          });
          console.log("✅ Products imported.");
        }

        // 8. Product Images
        if (productImages.length) {
          await tx.productImage.createMany({
            data: productImages,
            skipDuplicates: true,
          });
          console.log("✅ Product Images imported.");
        }

        // 9. Addresses
        if (addresses.length) {
          await tx.address.createMany({
            data: addresses,
            skipDuplicates: true,
          });
          console.log("✅ Addresses imported.");
        }

        // 10. Orders
        if (orders.length) {
          await tx.order.createMany({
            data: orders,
            skipDuplicates: true,
          });
          console.log("✅ Orders imported.");
        }

        // 11. Order Items
        if (orderItems.length) {
          await tx.orderItem.createMany({
            data: orderItems,
            skipDuplicates: true,
          });
          console.log("✅ Order Items imported.");
        }
      },
      {
        maxWait: 10000,
        timeout: 120000,
      }
    );

    console.log("🎉 All data imported successfully!");

  } catch (error) {
    console.error("❌ Import failed:", error);
    throw error;
  }
}

// Main
async function main() {
  const action = process.argv[2];

  if (action === "export") {
    await exportData();
  } else if (action === "import") {
    await importData();
  } else {
    console.log("⚠️ Please specify an action: export or import");
    console.log("Example: npm run db:export");
    console.log("Example: npm run db:import");
    process.exitCode = 1;
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
