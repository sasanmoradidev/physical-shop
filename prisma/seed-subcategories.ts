import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding hierarchical categories...");

  // ۱. ساخت دسته‌بندی‌های مادر (Parent Categories)
  const parentsData = [
    { name: "کالای دیجیتال", slug: "digital" },
    { name: "لوازم جانبی", slug: "accessory" },
    { name: "کنسول و بازی", slug: "gaming" },
    { name: "صوتی و تصویری", slug: "audio" },
  ];

  const parentMap: { [key: string]: string } = {};

  for (const parent of parentsData) {
    const record = await prisma.category.upsert({
      where: { slug: parent.slug },
      update: {},
      create: {
        name: parent.name,
        slug: parent.slug,
      },
    });
    // ذخیره آیدی دسته‌بندی والد برای نسبت دادن به فرزندها
    parentMap[parent.slug] = record.id;
  }

  // ۲. ساخت زیردسته‌بندی‌ها (Subcategories) متصل به والدین
  const subcategoriesData = [
    // زیرمجموعه‌های کالای دیجیتال (digital)
    { name: "گوشی موبایل", slug: "mobile", parentSlug: "digital" },
    { name: "لپ‌تاپ", slug: "laptop", parentSlug: "digital" },
    { name: "تبلت", slug: "tablet", parentSlug: "digital" },

    // زیرمجموعه‌های لوازم جانبی (accessory)
    { name: "قاب و کاور گوشی", slug: "phone-case", parentSlug: "accessory" },
    { name: "پاوربانک", slug: "powerbank", parentSlug: "accessory" },
    { name: "کابل و شارژر", slug: "charger-cable", parentSlug: "accessory" },

    // زیرمجموعه‌های کنسول و بازی (gaming)
    { name: "کنسول بازی", slug: "console", parentSlug: "gaming" },
    { name: "بازی‌های کنسول", slug: "games", parentSlug: "gaming" },
    { name: "دسته بازی (Gamepad)", slug: "gamepad", parentSlug: "gaming" },

    // زیرمجموعه‌های صوتی و تصویری (audio)
    { name: "هدفون و هندزفری", slug: "headphone", parentSlug: "audio" },
    { name: "اسپیکر شارژی", slug: "speaker", parentSlug: "audio" },
  ];

  for (const sub of subcategoriesData) {
    const parentId = parentMap[sub.parentSlug];
    if (!parentId) continue;

    await prisma.category.upsert({
      where: { slug: sub.slug },
      update: { parentId }, // اگر وجود داشت، والدش را آپدیت کن
      create: {
        name: sub.name,
        slug: sub.slug,
        parentId: parentId, // اتصال فرزند به والد
      },
    });
  }

  console.log("Seeding hierarchical categories completed successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });