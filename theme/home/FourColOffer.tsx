import Image from "next/image";
import Link from "next/link";
import type { BannerItem } from "./config";

export function FourColOffer({ items }: { items: BannerItem[] }) {
  const validItems = items.filter((item) => Boolean(item.image));
  if (validItems.length === 0) return null;

  return (
    <div className="container mx-auto px-4 mt-10 grid grid-cols-2 gap-x-4 gap-y-4 lg:grid-cols-4 lg:gap-x-8 lg:gap-y-8">
      {validItems.map((item) => {
        const hasLink = Boolean(item.link && item.link.trim() !== "" && item.link.trim() !== "#");
        const imageBox = (
          <div className="rounded-md overflow-hidden">
            <Image
              src={item.image}
              alt={item.alt || "بنر تبلیغاتی"}
              width={700}
              height={355}
              sizes="(max-width: 768px) 50vw, 25vw"
              className="block w-full h-auto"
            />
          </div>
        );

        return hasLink ? (
          <Link key={item.id} href={item.link}>
            {imageBox}
          </Link>
        ) : (
          <div key={item.id}>{imageBox}</div>
        );
      })}
    </div>
  );
}