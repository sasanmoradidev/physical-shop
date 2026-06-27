import { NextResponse } from "next/server";

import { requireAuth } from "@/lib/rbac-server";

export async function GET() {
  const user = await requireAuth();

  if (!user) {
    return NextResponse.json(null);
  }

  return NextResponse.json({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  });
}