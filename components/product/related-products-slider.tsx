"use client";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import { ProductCard } from "./product-card";

type RelatedProductsSliderProps = {
    relatedProducts: {
        id: string;
        title: string;
        slug: string;
        price: number;
        stock: number;
        images: {
            url: string;
        }[];
    }[];
};

export function RelatedProductsSlider({
    relatedProducts,
}: RelatedProductsSliderProps) {
    return (
        <section className="container mx-auto mt-20">

            <h2
                className="
                                text-2xl
                                font-bold
                                mb-8
                            "
            >
                محصولات مرتبط
            </h2>

            <Swiper
                spaceBetween={16}
                slidesPerView={2}
                breakpoints={{
                    768: { slidesPerView: 4 },
                }}
            >
                {relatedProducts.map(
                    (related: any) => (
                        <SwiperSlide key={related.id}>
                            <ProductCard
                                product={{
                                    id: related.id,
                                    title: related.title,
                                    slug: related.slug,
                                    price: Number(
                                        related.price
                                    ),
                                    stock: related.stock,
                                    images:
                                        related.images,
                                }}
                            />
                        </SwiperSlide>
                    )
                )}
            </Swiper>


        </section>
    );
}