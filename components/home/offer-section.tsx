"use client";

import Image from "next/image";
import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";

export function OfferSection({ products }: any) {
    return (
        <div className="container mx-auto mt-10">

            {/* TITLE */}
            <div className="mb-4 flex items-center justify-between">
                <h2 className="text-xl font-bold">
                    آفر ویژه
                </h2>

                <span className="text-red-500 text-sm">
                    تخفیف ویژه امروز
                </span>
            </div>

            {/* GRID */}
            <div className="grid md:grid-cols-3 gap-4">

                {/* LEFT IMAGE */}
                <div className="relative rounded-2xl overflow-hidden md:col-span-1">
                    <Image
                        src="/uploads/offer.jpg"
                        alt="offer"
                        width={500}
                        height={700}
                        className="w-full h-full object-cover"
                    />
                </div>

                {/* RIGHT SWIPER */}
                <div className="md:col-span-2">

                    <Swiper
                        slidesPerView={1}
                        spaceBetween={16}
                    >
                        {products.map((p: any) => (
                            <SwiperSlide key={p.id}>
                                <Link
                                    href={`/products/${p.slug}`}
                                    className="border rounded-xl p-4 block"
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

                                    <div className="text-red-500 mt-2">
                                        {p.price.toLocaleString()} تومان
                                    </div>

                                </Link>
                            </SwiperSlide>
                        ))}
                    </Swiper>

                </div>
            </div>
        </div>
    );
}