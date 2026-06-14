"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import Image from "next/image";
import Link from "next/link";

export function NewProducts({ products }: any) {
    return (
        <div className="container mx-auto mt-12">

            <h2 className="text-xl font-bold mb-4">
                محصولات جدید
            </h2>

            <Swiper
                spaceBetween={16}
                slidesPerView={2}
                breakpoints={{
                    768: { slidesPerView: 4 },
                }}
            >
                {products.map((p: any) => (
                    <SwiperSlide key={p.id}>
                        <Link
                            href={`/products/${p.slug}`}
                            className="border rounded-xl p-3 block"
                        >
                            <Image
                                src={p.images?.[0]?.url || "/placeholder.png"}
                                alt={p.title}
                                width={200}
                                height={200}
                            />
                            <div className="font-bold">
                                {p.title}
                            </div>

                            <div className="text-sm text-gray-600 mt-2">
                                {p.price.toString()} تومان
                            </div>
                        </Link>
                    </SwiperSlide>
                ))}
            </Swiper>
        </div>
    );
}