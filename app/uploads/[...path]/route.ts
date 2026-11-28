import fs from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";

const EXT_TO_MIME: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".avif": "image/avif",
  ".gif": "image/gif",
};

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path: segments } = await params;

  if (
    !Array.isArray(segments) ||
    segments.length === 0 ||
    !segments.every(
      (seg) => seg !== "." && seg !== ".." && /^[a-zA-Z0-9._-]+$/.test(seg)
    )
  ) {
    return NextResponse.json({ error: "Invalid path" }, { status: 400 });
  }

  const uploadsRoot = path.resolve(process.cwd(), "public", "uploads");
  const filePath = path.resolve(uploadsRoot, ...segments);

  if (!filePath.startsWith(uploadsRoot + path.sep)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const ext = path.extname(filePath).toLowerCase();
  const contentType = EXT_TO_MIME[ext];
  if (!contentType) {
    return NextResponse.json({ error: "Unsupported file type" }, { status: 404 });
  }

  try {
    const fileBuffer = await fs.readFile(filePath);
    return new NextResponse(fileBuffer, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=2592000, immutable",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}