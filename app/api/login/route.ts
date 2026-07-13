import bcrypt from "bcrypt";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { createToken } from "@/lib/auth";

export async function POST(req: Request) {
  const body = await req.json();

  const user = await prisma.user.findUnique({
    where: {
      username: body.username,
    },
  });

  if (!user) {
    return NextResponse.json(
      { error: "Invalid credentials" },
      { status: 401 }
    );
  }

  const valid = await bcrypt.compare(
    body.password,
    user.password
  );

  if (!valid) {
    return NextResponse.json(
      { error: "Invalid credentials" },
      { status: 401 }
    );
  }

  const token = await createToken({
    userId: user.id,
    role: user.role,
  });

  const cookieStore = await cookies();

  cookieStore.set("token", token, {
    httpOnly: true,
    secure: false,
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });

  return NextResponse.json({
    success: true,
  });
}