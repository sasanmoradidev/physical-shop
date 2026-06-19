import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const parentCategories = await prisma.category.findMany({
      where: {
        parentId: null, // 👈 فقط دریافت دسته‌بندی‌های ریشه (مادر)
      },
      include: {
        subcategories: {
          orderBy: { name: "asc" }, // لود زیردسته‌بندی‌های متصل به ترتیب الفبا
        },
      },
      orderBy: {
        name: "asc",
      },
    });
    return NextResponse.json(parentCategories);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}