"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import { ProductCard } from "@/components/product/product-card";

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
                        <ProductCard
                            product={{
                                id: p.id,
                                title: p.title,
                                slug: p.slug,
                                price: Number(p.price),
                                images: p.images,
                                stock: p.stock,

                            }}
                        />
                    </SwiperSlide>
                ))}
            </Swiper>
        </div>
    );
}