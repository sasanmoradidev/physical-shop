import fs from "fs/promises";
import path from "path";
import crypto from "crypto";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";

const ALLOWED_MIME_TO_EXT: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};
const MAX_RECEIPT_SIZE = 5 * 1024 * 1024; // ۵ مگابایت

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json(
        { error: "لطفاً ابتدا وارد حساب کاربری شوید." },
        { status: 401 }
      );
    }

    let payload;
    try {
      payload = await verifyToken(token);
    } catch {
      return NextResponse.json(
        { error: "نشست کاربری نامعتبر است." },
        { status: 401 }
      );
    }

    const formData = await req.formData();
    const orderId = String(formData.get("orderId") || "").trim();
    const trackingCode = String(formData.get("trackingCode") || "").trim();
    const note = String(formData.get("note") || "").trim();
    const receiptFile = formData.get("receiptFile") as File | null;

    if (!orderId) {
      return NextResponse.json(
        { error: "شناسه سفارش مشخص نیست." },
        { status: 400 }
      );
    }

    const hasFile = Boolean(receiptFile && receiptFile.size > 0);
    const hasTracking = trackingCode.length >= 4;

    if (!hasFile && !hasTracking) {
      return NextResponse.json(
        {
          error:
            "لطفاً تصویر رسید واریز را آپلود کنید یا شماره پیگیری بانکی (حداقل ۴ رقم) را وارد نمایید.",
        },
        { status: 400 }
      );
    }

    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
        userId: payload.userId,
      },
      include: {
        paymentMethod: true,
      },
    });

    if (!order) {
      return NextResponse.json({ error: "سفارش یافت نشد." }, { status: 404 });
    }

    if (
      order.status !== "PENDING" &&
      order.status !== "AWAITING_VERIFICATION"
    ) {
      return NextResponse.json(
        { error: "این سفارش در وضعیتی نیست که امکان ثبت رسید داشته باشد." },
        { status: 400 }
      );
    }

    let receiptImagePath = order.receiptImage;

    if (hasFile && receiptFile) {
      const ext = ALLOWED_MIME_TO_EXT[receiptFile.type];
      if (!ext) {
        return NextResponse.json(
          { error: "فرمت تصویر رسید مجاز نیست (فقط JPG، PNG و WebP)." },
          { status: 400 }
        );
      }

      if (receiptFile.size > MAX_RECEIPT_SIZE) {
        return NextResponse.json(
          { error: "حجم تصویر رسید نباید بیشتر از ۵ مگابایت باشد." },
          { status: 400 }
        );
      }

      const uploadDir = path.join(process.cwd(), "private-uploads", "receipts");
      await fs.mkdir(uploadDir, { recursive: true });

      const bytes = await receiptFile.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const fileName = `receipt-${order.id}-${Date.now()}-${crypto.randomUUID()}.${ext}`;
      const filePath = path.join(uploadDir, fileName);
      await fs.writeFile(filePath, buffer);

      // حذف رسید قبلی اگر کاربر دوباره رسید جدید آپلود کرده باشد
      if (order.receiptImage?.startsWith("/api/receipts/")) {
        const oldName = path.basename(order.receiptImage);
        const oldPath = path.join(uploadDir, oldName);
        await fs.unlink(oldPath).catch(() => {});
      }

      receiptImagePath = `/api/receipts/${fileName}`;
    }

    const updated = await prisma.order.update({
      where: { id: order.id },
      data: {
        status: "AWAITING_VERIFICATION",
        receiptImage: receiptImagePath,
        receiptTrackingCode: trackingCode || order.receiptTrackingCode || null,
        receiptNote: note || null,
        receiptSubmittedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      order: {
        id: updated.id,
        status: updated.status,
        receiptImage: updated.receiptImage,
        receiptTrackingCode: updated.receiptTrackingCode,
      },
    });
  } catch (error) {
    console.error("Card payment upload error:", error);
    return NextResponse.json(
      { error: "خطای سرور در ثبت اطلاعات پرداخت." },
      { status: 500 }
    );
  }
}