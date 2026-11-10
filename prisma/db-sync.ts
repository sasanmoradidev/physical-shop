import { PrismaClient } from "@prisma/client";
import * as fs from "fs/promises";
import * as path from "path";

const prisma = new PrismaClient();

const backupDir = path.join(process.cwd(), "prisma");

// 👇 اضافه‌شدن Brands به تایپ اصلی بک‌آپ
type BackupData = {
  users: any[];
  otpRequests: any[];
  systemSettings: any[];
  categories: any[];
  brands: any[]; // 👈 اضافه شد
  products: any[];
  productImages: any[];
  shippingMethods: any[];
  paymentMethods: any[];
  addresses: any[];
  orders: any[];
  orderItems: any[];
};

// Convert JSON date strings to JavaScript Date objects
function restoreDates(rows: any[], fields: string[]): any[] {
  return rows.map((row) => {
    const result = { ...row };

    for (const field of fields) {
      if (result[field] !== null && result[field] !== undefined) {
        const date = new Date(result[field]);

        if (Number.isNaN(date.getTime())) {
          throw new Error(`Invalid date in field: ${field}`);
        }

        result[field] = date;
      }
    }

    return result;
  });
}

// Export
async function exportData() {
  console.log("⏳ Reading data from database...");

  // نام فایل داینامیک بر اساس تاریخ و زمان
  const timestamp = new Date().toISOString().replace(/T/, '-').replace(/[:.]/g, '-').slice(0, 19);
  const fileName = `local-backup-${timestamp}.json`;
  const filePath = path.join(backupDir, fileName);

  const backupData: BackupData = {
    users: await prisma.user.findMany(),
    otpRequests: await prisma.otpRequest.findMany(),
    systemSettings: await prisma.systemSetting.findMany(),
    categories: await prisma.category.findMany(),
    brands: await prisma.brand.findMany(), // 👈 واکشی اطلاعات برندها اضافه شد
    products: await prisma.product.findMany(),
    productImages: await prisma.productImage.findMany(),
    shippingMethods: await prisma.shippingMethod.findMany(),
    paymentMethods: await prisma.paymentMethod.findMany(),
    addresses: await prisma.address.findMany(),
    orders: await prisma.order.findMany(),
    orderItems: await prisma.orderItem.findMany(),
  };

  await fs.mkdir(backupDir, { recursive: true });

  await fs.writeFile(
    filePath,
    JSON.stringify(backupData, null, 2),
    "utf-8"
  );

  console.log("✅ Export completed!");
  console.log(`📁 Backup saved to: ${filePath}`);
}

// Import
async function importData() {
  // پیدا کردن جدیدترین فایل بک‌آپ
  const files = await fs.readdir(backupDir);
  const backupFiles = files.filter(f => f.startsWith("local-backup") && f.endsWith(".json"));

  if (backupFiles.length === 0) {
    throw new Error("❌ No backup files found in prisma directory.");
  }

  // مرتب‌سازی معکوس فایل‌ها برای گرفتن جدیدترین (از روی اسمشان که حاوی تاریخ است)
  backupFiles.sort((a, b) => b.localeCompare(a));
  const latestBackupFile = backupFiles[0];
  const filePath = path.join(backupDir, latestBackupFile);

  console.log(`⏳ Reading latest backup file: ${latestBackupFile}...`);

  const content = await fs.readFile(filePath, "utf-8");
  const raw = JSON.parse(content);

  // اضافه شدن برندها به لیست جداول
  const tables = [
    "users",
    "otpRequests",
    "systemSettings",
    "categories",
    "brands", // 👈 جدول برند
    "products",
    "productImages",
    "shippingMethods",
    "paymentMethods",
    "addresses",
    "orders",
    "orderItems",
  ];

  for (const table of tables) {
    if (!Array.isArray(raw[table])) {
      throw new Error(`Invalid backup: Missing or invalid table array -> ${table}`);
    }
  }

  // ساختاربندی و بازیابی تاریخ‌ها (Date Types)
  const data: BackupData = {
    users: restoreDates(raw.users, ["createdAt", "updatedAt"]),
    otpRequests: restoreDates(raw.otpRequests, ["expiresAt", "createdAt"]),
    systemSettings: raw.systemSettings,
    categories: raw.categories,
    brands: restoreDates(raw.brands, ["createdAt", "updatedAt"]), // 👈 رستور تاریخ‌های برند
    products: restoreDates(raw.products, [
      "createdAt",
      "updatedAt",
      "offerStartsAt",
      "offerEndsAt",
    ]),
    productImages: raw.productImages,
    shippingMethods: restoreDates(raw.shippingMethods, ["createdAt", "updatedAt"]),
    paymentMethods: restoreDates(raw.paymentMethods, ["createdAt", "updatedAt"]),
    addresses: raw.addresses,
    orders: restoreDates(raw.orders, ["createdAt", "updatedAt", "paidAt"]),
    orderItems: raw.orderItems,
  };

  console.log("🔄 Starting database reset and import...");

  await prisma.$transaction(
    async (tx) => {

      // 1. پاک کردن جداول به همراه دیتای جدید (Brands)
      console.log("🗑️ Clearing database...");

      await tx.$executeRawUnsafe(`
        TRUNCATE TABLE
          "OrderItem",
          "Order",
          "Address",
          "ProductImage",
          "Product",
          "Brand", 
          "Category",
          "OtpRequest",
          "SystemSetting",
          "ShippingMethod",
          "PaymentMethod",
          "User"
        RESTART IDENTITY;
      `);

      console.log("✅ Database cleared.");

      // 2. Users
      if (data.users.length) {
        await tx.user.createMany({ data: data.users });
      }
      console.log(`✅ Users: ${data.users.length}`);

      // 3. OTP Requests
      if (data.otpRequests.length) {
        await tx.otpRequest.createMany({ data: data.otpRequests });
      }
      console.log(`✅ OTP Requests: ${data.otpRequests.length}`);

      // 4. System Settings
      if (data.systemSettings.length) {
        await tx.systemSetting.createMany({ data: data.systemSettings });
      }
      console.log(`✅ System Settings: ${data.systemSettings.length}`);

      // 5. Shipping Methods
      if (data.shippingMethods.length) {
        await tx.shippingMethod.createMany({ data: data.shippingMethods });
      }
      console.log(`✅ Shipping Methods: ${data.shippingMethods.length}`);

      // 6. Payment Methods
      if (data.paymentMethods.length) {
        await tx.paymentMethod.createMany({ data: data.paymentMethods });
      }
      console.log(`✅ Payment Methods: ${data.paymentMethods.length}`);

      // 7. Categories (رعایت ترتیب سلسله مراتبی والد و فرزندی)
      if (data.categories.length) {
        const pending = [...data.categories];
        while (pending.length > 0) {
          const ready = pending.filter(
            (category) =>
              !category.parentId ||
              !pending.some((parent) => parent.id === category.parentId)
          );

          if (ready.length === 0) {
            throw new Error("Circular or invalid category hierarchy detected.");
          }

          await tx.category.createMany({ data: ready });

          const importedIds = new Set(ready.map((category) => category.id));
          for (let i = pending.length - 1; i >= 0; i--) {
            if (importedIds.has(pending[i].id)) pending.splice(i, 1);
          }
        }
      }
      console.log(`✅ Categories: ${data.categories.length}`);

      // 👇 8. Brands (برندها باید قبل از محصولات ذخیره شوند چون محصول به آن‌ها وابستگی دارد)
      if (data.brands.length) {
        await tx.brand.createMany({ data: data.brands });
      }
      console.log(`✅ Brands: ${data.brands.length}`);

      // 9. Products
      if (data.products.length) {
        await tx.product.createMany({ data: data.products });
      }
      console.log(`✅ Products: ${data.products.length}`);

      // 10. Product Images
      if (data.productImages.length) {
        const productIds = new Set(data.products.map((product) => product.id));
        const invalidImages = data.productImages.filter(
          (image) => !productIds.has(image.productId)
        );

        if (invalidImages.length) {
          throw new Error(
            `Missing products for images: ${invalidImages.map((image) => image.productId).join(", ")}`
          );
        }
        await tx.productImage.createMany({ data: data.productImages });
      }
      console.log(`✅ Product Images: ${data.productImages.length}`);

      // 11. Addresses
      if (data.addresses.length) {
        await tx.address.createMany({ data: data.addresses });
      }
      console.log(`✅ Addresses: ${data.addresses.length}`);

      // 12. Orders
      if (data.orders.length) {
        await tx.order.createMany({ data: data.orders });
      }
      console.log(`✅ Orders: ${data.orders.length}`);

      // 13. Order Items
      if (data.orderItems.length) {
        await tx.orderItem.createMany({ data: data.orderItems });
      }
      console.log(`✅ Order Items: ${data.orderItems.length}`);

      // 14. Verify imported record counts
      const counts = {
        users: await tx.user.count(),
        otpRequests: await tx.otpRequest.count(),
        systemSettings: await tx.systemSetting.count(),
        categories: await tx.category.count(),
        brands: await tx.brand.count(), // 👈 چک کردن رکورد برندها اضافه شد
        products: await tx.product.count(),
        productImages: await tx.productImage.count(),
        shippingMethods: await tx.shippingMethod.count(),
        paymentMethods: await tx.paymentMethod.count(),
        addresses: await tx.address.count(),
        orders: await tx.order.count(),
        orderItems: await tx.orderItem.count(),
      };

      console.log("\n========== IMPORT VERIFICATION ==========");
      for (const [table, count] of Object.entries(counts)) {
        console.log(`${table}: ${count}`);
      }

      for (const table of tables) {
        if (counts[table as keyof typeof counts] !== data[table as keyof BackupData].length) {
          throw new Error(
            `Count mismatch in ${table}: expected ${
              data[table as keyof BackupData].length
            }, got ${counts[table as keyof typeof counts]}`
          );
        }
      }
    },
    {
      maxWait: 10000,
      timeout: 120000,
    }
  );

  console.log("\n🎉 Database reset and import completed successfully!");
}

// Main
async function main() {
  const action = process.argv[2];

  if (action === "export") {
    await exportData();
  } else if (action === "import") {
    await importData();
  } else {
    console.log("⚠️ Please specify export or import.");
    console.log("npm run db:export");
    console.log("npm run db:import");
    process.exitCode = 1;
  }
}

main()
  .catch((error) => {
    console.error("\n❌ Operation failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });