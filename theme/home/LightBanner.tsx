import Image from "next/image";
import Link from "next/link";
import type { LightBannerConfig } from "./config";

export function LightBanner({ banner }: { banner: LightBannerConfig }) {
  if (!banner.enabled) return null;

  const desktopSrc = banner.desktopImage || banner.mobileImage;
  const mobileSrc = banner.mobileImage || banner.desktopImage;

  if (!desktopSrc && !mobileSrc) return null;

  const hasLink = Boolean(
    banner.link && banner.link.trim() !== "" && banner.link.trim() !== "#"
  );

  const content = (
    <>
      {mobileSrc && (
        <Image
          src={mobileSrc}
          alt={banner.alt || "بنر تبلیغاتی"}
          width={768}
          height={300}
          sizes="calc(100vw - 2rem)"
          className="block md:hidden w-full h-auto rounded-md"
        />
      )}
      {desktopSrc && (
        <Image
          src={desktopSrc}
          alt={banner.alt || "بنر تبلیغاتی"}
          width={1600}
          height={274}
          sizes="1280px"
          className="hidden md:block w-full h-auto rounded-md"
        />
      )}
    </>
  );

  return (
    <div className="container relative mx-auto px-4 mt-10">
      {hasLink ? (
        <Link href={banner.link} className="block">
          {content}
        </Link>
      ) : (
        <div className="block">{content}</div>
      )}
    </div>
  );
}