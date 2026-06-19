import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const categories = [
    { name: "موبایل", slug: "mobile" },
    { name: "لپ‌تاپ", slug: "laptop" },
    { name: "لوازم جانبی", slug: "accessory" },
    { name: "کنسول بازی", slug: "gaming" },
    { name: "صوتی و تصویری", slug: "audio" },
    { name: "ساعت هوشمند", slug: "smartwatch" },
  ];

  console.log("Seeding categories...");

  for (const cat of categories) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {}, // اگر از قبل وجود داشت، تغییری نده
      create: {
        name: cat.name,
        slug: cat.slug,
      },
    });
  }

  console.log("Categories seeded successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });