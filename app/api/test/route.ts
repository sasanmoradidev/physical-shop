// import { NextResponse } from "next/server";
// import { prisma } from "@/lib/prisma";

// export async function GET() {
//   const users = await prisma.user.findMany();

//   return NextResponse.json(users);
// }


import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    ok: true,
  });
}