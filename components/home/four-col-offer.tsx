import Image from "next/image";
import Link from "next/link";

export function FourColOffer() {
    return (
        <div className="container mx-auto px-4 mt-10 grid grid-cols-2 gap-x-4 gap-y-4 lg:grid-cols-4 lg:gap-x-8 lg:gap-y-8">
            <Link
                href="#"
            >
                <div className="rounded-md overflow-hidden">
                    <Image
                        src="/uploads/offercol4-1.webp"
                        alt="col offer"
                        width={700}
                        height={355}
                        sizes="(max-width: 768px) 50vw, 25vw"
                        className="block w-full h-auto"
                    />
                </div>
            </Link>
            <Link
                href="#"
            >

                <div className="rounded-md overflow-hidden">
                    <Image
                        src="/uploads/offercol4-2.webp"
                        alt="col offer"
                        width={700}
                        height={355}
                        sizes="(max-width: 768px) 50vw, 25vw"
                        className="block w-full h-auto"
                    />
                </div>
            </Link>

            <Link
                href="#"
            >
                <div className="rounded-md overflow-hidden">
                    <Image
                        src="/uploads/offercol4-3.webp"
                        alt="col offer"
                        width={700}
                        height={355}
                        sizes="(max-width: 768px) 50vw, 25vw"
                        className="block w-full h-auto"
                    />
                </div>
            </Link>

            <Link
                href="#"
            >
                <div className="rounded-md overflow-hidden">
                    <Image
                        src="/uploads/offercol4-4.webp"
                        alt="col offer"
                        width={700}
                        height={355}
                        sizes="(max-width: 768px) 50vw, 25vw"
                        className="block w-full h-auto"
                    />
                </div>
            </Link>
        </div>
    );
}