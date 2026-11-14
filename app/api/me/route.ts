import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/current-user";

export async function GET() {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json(null);
  }

  return NextResponse.json({
    id: user.id,
    name: user.name,
    username: user.username,
    phone: user.phone,
    role: user.role,
  });
}