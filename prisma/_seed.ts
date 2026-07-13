// مسیر: prisma/seed.ts
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  console.log("⏳ Clearing existing data...");
  // پاکسازی تمامی جداول برای ممانعت از تداخل روابط
  await prisma.systemSetting.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.address.deleteMany();
  await prisma.productImage.deleteMany();
  await prisma.product.deleteMany();
  await prisma.paymentMethod.deleteMany();
  await prisma.shippingMethod.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();

  console.log("👤 Seeding Admin User...");
  const hashedPassword = await bcrypt.hash("123456", 10);
  const admin = await prisma.user.create({
    data: {
      name: "مدیر کل سیستم",
      username: "admin@test.com", // یوزرنیم همان ایمیل ادمین قبلی باشد تا بخش‌های دیگر به هم نریزد
      password: hashedPassword,
      phone: "09120827031", // شماره همراه ادمین
      role: "ADMIN",
    },
  });

  console.log("⚙️ Seeding Default System Settings...");
  // فعال کردن احراز هویت پیامکی به عنوان تنظیم پیش‌فرض سیستمی
  await prisma.systemSetting.create({
    data: {
      key: "OTP_ENABLED",
      value: "true",
    },
  });

  console.log("📁 Seeding Hierarchical Categories...");
  // ساخت دسته‌بندی‌های ریشه (مادر)
  const digital = await prisma.category.create({
    data: { name: "کالای دیجیتال", slug: "digital" },
  });
  const accessory = await prisma.category.create({
    data: { name: "لوازم جانبی", slug: "accessory" },
  });
  const gaming = await prisma.category.create({
    data: { name: "کنسول و بازی", slug: "gaming" },
  });

  // ساخت زیردسته‌بندی‌های متصل به والدین
  const mobile = await prisma.category.create({
    data: { name: "گوشی موبایل", slug: "mobile", parentId: digital.id },
  });
  const laptop = await prisma.category.create({
    data: { name: "لپ‌تاپ", slug: "laptop", parentId: digital.id },
  });
  const tablet = await prisma.category.create({
    data: { name: "تبلت", slug: "tablet", parentId: digital.id },
  });

  const phoneCase = await prisma.category.create({
    data: { name: "قاب و کاور گوشی", slug: "phone-case", parentId: accessory.id },
  });
  const powerbank = await prisma.category.create({
    data: { name: "پاوربانک", slug: "powerbank", parentId: accessory.id },
  });

  const consoleGame = await prisma.category.create({
    data: { name: "کنسول بازی", slug: "console", parentId: gaming.id },
  });

  console.log("🚚 Seeding Shipping Methods...");
  await prisma.shippingMethod.createMany({
    data: [
      {
        name: "پست پیشتاز کشوری",
        price: 45000,
        estimatedTime: "۳ تا ۵ روز کاری",
        isActive: true,
      },
      {
        name: "ارسال اکسپرس (پیک موتوری - ویژه تهران)",
        price: 120000,
        estimatedTime: "ارسال فوری ۳ ساعته",
        isActive: true,
      },
    ],
  });

  console.log("💳 Seeding Payment Methods...");
  await prisma.paymentMethod.createMany({
    data: [
      {
        name: "درگاه پرداخت آنلاین (زرین‌پال)",
        code: "ONLINE",
        description: "پرداخت امن و سریع با تمامی کارت‌های عضو شتاب",
        isActive: true,
        merchantId: "72C1DB8E-3DF8-4DF2-9A2A-C39D89516698",
      },
      {
        name: "پرداخت در محل (COD)",
        code: "COD",
        description: "پرداخت وجه نقد یا با کارتخوان درب منزل در زمان تحویل کالا",
        isActive: true,
      },
    ],
  });

  console.log("📦 Seeding Products...");
  await prisma.product.createMany({
    data: [
      {
        title: "گوشی موبایل سامسونگ Galaxy S24 Ultra",
        slug: "samsung-s24-ultra",
        description: "پرچمدار قدرتمند سامسونگ مجهز به هوش مصنوعی اختصاصی، دوربین ۲۰۰ مگاپیکسلی و قلم هوشمند S-Pen.",
        price: 1250,
        offerPrice: 1190, // دارای تخفیف شگفت‌انگیز
        stock: 12,
        categoryId: mobile.id,
        featured: true,
      },
      {
        title: "آیفون ۱۵ پرو ۲۵۶ گیگابایت",
        slug: "iphone-15-pro",
        description: "گوشی پرچمدار اپل مجهز به بدنه تیتانیومی مقاوم، پردازنده فوق‌العاده سریع A17 Pro و دوربین زوم تلسکوپی.",
        price: 999,
        stock: 8,
        categoryId: mobile.id,
      },
      {
        title: "لپ‌تاپ مک‌بوک ایر M3 مدل ۲۰۲۴",
        slug: "macbook-air-m3",
        description: "لوکس‌ترین و باریک‌ترین لپ‌تاپ جهان مجهز به تراشه بی‌نظیر M3 اپل و ماندگاری شارژ باتری تا ۱۸ ساعت.",
        price: 1400,
        stock: 7,
        categoryId: laptop.id,
        featured: true,
      },
      {
        title: "پاوربانک ۲۰۰۰۰ فست شارژ شیائومی",
        slug: "xiaomi-powerbank-20k",
        description: "پاوربانک باکیفیت و خوش‌دست شیائومی با قابلیت شارژ فوق سریع هم‌زمان سه دستگاه.",
        price: 45,
        stock: 50,
        categoryId: powerbank.id,
      },
      {
        title: "کنسول بازی پلی‌استیشن ۵ مدل Slim",
        slug: "playstation-5-slim",
        description: "جدیدترین نسخه کنسول محبوب سونی با طراحی باریک‌تر و ظرفیت حافظه سریع ۱ ترابایتی.",
        price: 520,
        stock: 15,
        categoryId: consoleGame.id,
        featured: true,
      },
    ],
  });

  console.log("🎉 Database Seeded Successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });