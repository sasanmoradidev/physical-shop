import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";

export async function POST(
  req: Request
) {
  try {
    const body = await req.json();

    const cookieStore =
      await cookies();

    const token =
      cookieStore.get("token")
        ?.value;

    if (!token) {
      return NextResponse.json(
        {
          error: "Unauthorized",
        },
        { status: 401 }
      );
    }

    const payload =
      await verifyToken(token);

    if (!body.addressId) {
      return NextResponse.json(
        {
          error: "Address is required",
        },
        { status: 400 }
      );
    }

    const items = body.items;

    if (
      !Array.isArray(items) ||
      items.length === 0
    ) {
      return NextResponse.json(
        {
          error:
            "Cart is empty",
        },
        { status: 400 }
      );
    }

    const products =
      await prisma.product.findMany({
        where: {
          id: {
            in: items.map(
              (item: any) => item.id
            ),
          },
        },
      });

    if (
      products.length !== items.length
    ) {
      return NextResponse.json(
        {
          error:
            "Some products no longer exist",
        },
        { status: 400 }
      );
    }
    for (const item of items) {
      const product = products.find(
        (p) => p.id === item.id
      );

      if (!product) {
        return NextResponse.json(
          {
            error: "Product not found",
          },
          { status: 400 }
        );
      }

      if (product.stock < item.quantity) {
        return NextResponse.json(
          {
            error: `${product.title} موجودی کافی ندارد`,
          },
          { status: 400 }
        );
      }
    }
    const totalPrice =
      items.reduce(
        (
          sum: number,
          item: any
        ) => {
          const product =
            products.find(
              (p) =>
                p.id === item.id
            );

          if (!product) {
            throw new Error(
              `Product ${item.id} not found`
            );
          }

          return (
            sum +
            Number(
              product.price
            ) *
            item.quantity
          );
        },
        0
      );

    const order =
      await prisma.order.create({
        data: {
          userId:
            payload.userId as string,

          totalPrice,

          addressId:
            body.addressId,

          items: {
            create:
              items.map(
                (
                  item: any
                ) => {
                  const product =
                    products.find(
                      (p) =>
                        p.id ===
                        item.id
                    );

                  if (!product) {
                    throw new Error(
                      `Product ${item.id} not found`
                    );
                  }

                  return {
                    productId:
                      product.id,

                    quantity:
                      item.quantity,

                    price:
                      product.price,
                  };
                }
              ),
          },
        },
      });

    return NextResponse.json(
      order
    );
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error:
          "Server Error",
      },
      { status: 500 }
    );
  }
}