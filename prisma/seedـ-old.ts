// import { PrismaClient } from "@prisma/client";

// const prisma = new PrismaClient();

// async function main() {
//   const mobile = await prisma.category.create({
//     data: {
//       name: "موبایل",
//       slug: "mobile",
//     },
//   });

//   const laptop = await prisma.category.create({
//     data: {
//       name: "لپ تاپ",
//       slug: "laptop",
//     },
//   });

//   await prisma.product.create({
//     data: {
//       title: "iPhone 15 Pro",
//       slug: "iphone-15-pro",
//       description: "Apple iPhone 15 Pro",
//       price: 999,
//       stock: 10,
//       categoryId: mobile.id,
//     },
//   });

//   await prisma.product.create({
//     data: {
//       title: "MacBook Air M3",
//       slug: "macbook-air-m3",
//       description: "Apple MacBook Air M3",
//       price: 1499,
//       stock: 5,
//       categoryId: laptop.id,
//     },
//   });
// }

// main()
//   .catch(console.error)
//   .finally(async () => {
//     await prisma.$disconnect();
//   });

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const mobile = await prisma.category.create({
    data: { name: "موبایل", slug: "mobile" },
  });

  const laptop = await prisma.category.create({
    data: { name: "لپ‌تاپ", slug: "laptop" },
  });

  const accessory = await prisma.category.create({
    data: { name: "لوازم جانبی", slug: "accessory" },
  });

  const clothing = await prisma.category.create({
    data: { name: "اکسسوری", slug: "clothing" },
  });

  await prisma.product.createMany({
    data: [
      // ================= MOBILE (10)
      {
        title: "آیفون 15 پرو",
        slug: "iphone-15-pro",
        description: "گوشی پرچمدار اپل با دوربین حرفه‌ای",
        price: 999,
        stock: 10,
        categoryId: mobile.id,
      },
      {
        title: "آیفون 16 پرو مکس",
        slug: "iphone-16-pro-max",
        description: "جدیدترین پرچمدار اپل",
        price: 1299,
        stock: 8,
        categoryId: mobile.id,
      },
      {
        title: "سامسونگ S24 اولترا",
        slug: "samsung-s24-ultra",
        description: "پرچمدار سامسونگ",
        price: 1100,
        stock: 12,
        categoryId: mobile.id,
      },
      {
        title: "شیائومی 14",
        slug: "xiaomi-14",
        description: "گوشی قدرتمند شیائومی",
        price: 750,
        stock: 20,
        categoryId: mobile.id,
      },
      {
        title: "پوکو F6 پرو",
        slug: "poco-f6-pro",
        description: "مناسب گیمینگ",
        price: 600,
        stock: 15,
        categoryId: mobile.id,
      },
      {
        title: "آنر Magic6",
        slug: "honor-magic6",
        description: "طراحی مدرن",
        price: 680,
        stock: 14,
        categoryId: mobile.id,
      },
      {
        title: "گوگل پیکسل 8",
        slug: "pixel-8",
        description: "اندروید خالص",
        price: 899,
        stock: 10,
        categoryId: mobile.id,
      },
      {
        title: "ناتینگ فون 2",
        slug: "nothing-phone-2",
        description: "طراحی خاص",
        price: 650,
        stock: 18,
        categoryId: mobile.id,
      },
      {
        title: "ریلمی GT Neo 6",
        slug: "realme-gt-neo-6",
        description: "اقتصادی قدرتمند",
        price: 520,
        stock: 25,
        categoryId: mobile.id,
      },
      {
        title: "شیائومی ردمی نوت 13",
        slug: "redmi-note-13",
        description: "اقتصادی پرفروش",
        price: 320,
        stock: 30,
        categoryId: mobile.id,
      },

      // ================= LAPTOP (10)
      {
        title: "مک بوک ایر M3",
        slug: "macbook-air-m3",
        description: "سبک و سریع",
        price: 1400,
        stock: 7,
        categoryId: laptop.id,
      },
      {
        title: "مک بوک پرو 14",
        slug: "macbook-pro-14",
        description: "حرفه‌ای برای طراحی",
        price: 2200,
        stock: 5,
        categoryId: laptop.id,
      },
      {
        title: "لنوو ThinkPad X1",
        slug: "thinkpad-x1",
        description: "اداری حرفه‌ای",
        price: 1600,
        stock: 8,
        categoryId: laptop.id,
      },
      {
        title: "لنوو LOQ",
        slug: "lenovo-loq",
        description: "گیمینگ اقتصادی",
        price: 1100,
        stock: 10,
        categoryId: laptop.id,
      },
      {
        title: "ایسوس TUF A15",
        slug: "asus-tuf-a15",
        description: "مناسب بازی",
        price: 1200,
        stock: 9,
        categoryId: laptop.id,
      },
      {
        title: "ایسوس ROG Strix",
        slug: "rog-strix",
        description: "گیمینگ حرفه‌ای",
        price: 2400,
        stock: 4,
        categoryId: laptop.id,
      },
      {
        title: "HP Victus 16",
        slug: "hp-victus-16",
        description: "قدرت و قیمت مناسب",
        price: 1300,
        stock: 6,
        categoryId: laptop.id,
      },
      {
        title: "Dell XPS 13",
        slug: "dell-xps-13",
        description: "لوکس و سبک",
        price: 1800,
        stock: 7,
        categoryId: laptop.id,
      },
      {
        title: "Acer Nitro 5",
        slug: "acer-nitro-5",
        description: "گیمینگ اقتصادی",
        price: 1000,
        stock: 12,
        categoryId: laptop.id,
      },
      {
        title: "Surface Laptop 5",
        slug: "surface-laptop-5",
        description: "طراحی مینیمال",
        price: 1500,
        stock: 5,
        categoryId: laptop.id,
      },

      // ================= ACCESSORY (15)
      {
        title: "ایرپاد پرو 2",
        slug: "airpods-pro-2",
        description: "هدفون اپل",
        price: 249,
        stock: 30,
        categoryId: accessory.id,
      },
      {
        title: "هدفون سونی WH-1000XM5",
        slug: "sony-xm5",
        description: "نویز کنسلینگ حرفه‌ای",
        price: 350,
        stock: 20,
        categoryId: accessory.id,
      },
      {
        title: "ماوس لاجیتک MX Master 3S",
        slug: "mx-master-3s",
        description: "ماوس حرفه‌ای",
        price: 120,
        stock: 25,
        categoryId: accessory.id,
      },
      {
        title: "کیبورد مکانیکی ردراگون",
        slug: "redragon-kb",
        description: "گیمینگ RGB",
        price: 90,
        stock: 40,
        categoryId: accessory.id,
      },
      {
        title: "پاوربانک 20000 شیائومی",
        slug: "xiaomi-powerbank",
        description: "ظرفیت بالا",
        price: 45,
        stock: 50,
        categoryId: accessory.id,
      },
      {
        title: "شارژر 67 وات",
        slug: "fast-charger-67w",
        description: "شارژ سریع",
        price: 25,
        stock: 60,
        categoryId: accessory.id,
      },
      {
        title: "هارد اکسترنال 1TB",
        slug: "hdd-1tb",
        description: "ذخیره سازی",
        price: 70,
        stock: 22,
        categoryId: accessory.id,
      },
      {
        title: "SSD اکسترنال 1TB",
        slug: "ssd-1tb",
        description: "سرعت بالا",
        price: 130,
        stock: 15,
        categoryId: accessory.id,
      },
      {
        title: "هاب USB-C",
        slug: "usb-c-hub",
        description: "افزایش پورت",
        price: 40,
        stock: 35,
        categoryId: accessory.id,
      },
      {
        title: "وبکم Full HD",
        slug: "webcam-fhd",
        description: "تماس تصویری",
        price: 35,
        stock: 28,
        categoryId: accessory.id,
      },
      {
        title: "پایه خنک‌کننده لپ‌تاپ",
        slug: "cooler-pad",
        description: "کاهش دما",
        price: 30,
        stock: 30,
        categoryId: accessory.id,
      },
      {
        title: "کیف لپ‌تاپ",
        slug: "laptop-bag",
        description: "ضد ضربه",
        price: 28,
        stock: 25,
        categoryId: accessory.id,
      },
      {
        title: "گلس آیفون",
        slug: "iphone-glass",
        description: "محافظ صفحه",
        price: 10,
        stock: 100,
        categoryId: accessory.id,
      },
      {
        title: "قاب سامسونگ",
        slug: "samsung-case",
        description: "محافظ گوشی",
        price: 12,
        stock: 80,
        categoryId: accessory.id,
      },
      {
        title: "استند موبایل",
        slug: "phone-stand",
        description: "نگهدارنده گوشی",
        price: 15,
        stock: 70,
        categoryId: accessory.id,
      },
    ],
  });
  const admin = await prisma.user.findFirst({
    where: {
      role: "ADMIN",
    },
  });

  if (admin) {
    const address = await prisma.address.findFirst({
      where: {
        userId: admin.id,
      },
    });

    const products = await prisma.product.findMany({
      take: 10,
    });

    if (address && products.length > 0) {
      for (let i = 0; i < 5; i++) {
        await prisma.order.create({
          data: {
            userId: admin.id,
            addressId: address.id,
            totalPrice: 1000 + i * 250,
            status: "PENDING",

            items: {
              create: [
                {
                  productId: products[i].id,
                  quantity: 1,
                  price: products[i].price,
                },
                {
                  productId: products[i + 1].id,
                  quantity: 2,
                  price: products[i + 1].price,
                },
              ],
            },
          },
        });
      }
    }
  }
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });